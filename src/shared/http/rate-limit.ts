import type { Db } from '@/shared/db/prisma-client';

export interface RateLimitRule {
  readonly name: string;
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitResult {
  readonly allowed: boolean;
  /** Số giây đến khi cửa sổ hiện tại kết thúc (dùng cho header Retry-After). */
  readonly retryAfterSec: number;
}

/** Giới hạn tần suất theo cửa sổ cố định (docs/03 mục 7). */
export interface RateLimiter {
  consume(rule: RateLimitRule, subject: string, now: Date): Promise<RateLimitResult>;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

export const RATE_LIMITS = {
  createReadingPerMinute: { name: 'create-m', limit: 5, windowMs: MINUTE },
  createReadingPerHour: { name: 'create-h', limit: 20, windowMs: HOUR },
  share: { name: 'share-h', limit: 30, windowMs: HOUR },
  image: { name: 'image-h', limit: 60, windowMs: HOUR },
  events: { name: 'events-m', limit: 120, windowMs: MINUTE },
} as const satisfies Record<string, RateLimitRule>;

function windowOf(rule: RateLimitRule, now: Date) {
  const start = Math.floor(now.getTime() / rule.windowMs) * rule.windowMs;
  return {
    start: new Date(start),
    retryAfterSec: Math.max(1, Math.ceil((start + rule.windowMs - now.getTime()) / 1000)),
  };
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly counts = new Map<string, number>();

  async consume(rule: RateLimitRule, subject: string, now: Date) {
    const w = windowOf(rule, now);
    const key = `${rule.name}:${subject}:${w.start.getTime()}`;
    const count = (this.counts.get(key) ?? 0) + 1;
    this.counts.set(key, count);
    return { allowed: count <= rule.limit, retryAfterSec: w.retryAfterSec };
  }
}

export class PrismaRateLimiter implements RateLimiter {
  constructor(private readonly db: Db) {}

  async consume(rule: RateLimitRule, subject: string, now: Date) {
    const w = windowOf(rule, now);
    const key = `${rule.name}:${subject}`;
    const bump = () =>
      this.db.rateLimitBucket.upsert({
        where: { key_windowStart: { key, windowStart: w.start } },
        create: { key, windowStart: w.start, count: 1 },
        update: { count: { increment: 1 } },
      });
    let row;
    try {
      row = await bump();
    } catch {
      // Hai yêu cầu cùng tạo bản ghi một lúc: lần thử lại sẽ rơi vào nhánh update.
      row = await bump();
    }
    return { allowed: row.count <= rule.limit, retryAfterSec: w.retryAfterSec };
  }

  /** Dọn bản ghi cũ hơn 2 giờ (cron). */
  async purge(now: Date) {
    const res = await this.db.rateLimitBucket.deleteMany({
      where: { windowStart: { lt: new Date(now.getTime() - 2 * HOUR) } },
    });
    return res.count;
  }
}
