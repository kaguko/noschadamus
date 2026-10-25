import { rehydrateReading, type DomainEvent, type Reading } from '../domain';
import type { EventBus, ReadingRepository } from '../application/ports';

const DAY_MS = 86_400_000;
/** Giữ đồng bộ với prisma-reading-repository (docs/03 mục 5). */
const RETENTION_UNSHARED_DAYS = 180;
const RETENTION_SHARED_DAYS = 730;

/** Kho trong bộ nhớ: dùng cho test, script demo, và làm chuẩn cho bộ test hợp đồng. */
export class InMemoryReadingRepository implements ReadingRepository {
  private readonly rows = new Map<string, Reading>();
  private readonly lastViewed = new Map<string, Date>();

  async save(r: Reading) {
    this.rows.set(r.id, r);
    this.lastViewed.set(r.id, r.createdAt);
  }
  async findById(id: string) {
    return this.rows.get(id) ?? null;
  }
  async findByShareToken(t: string) {
    for (const r of this.rows.values()) if (r.share?.token === t) return r;
    return null;
  }
  async updateShare(id: string, share: Reading['share']) {
    const r = this.rows.get(id);
    if (r) this.rows.set(id, rehydrateReading({ ...r, share }));
  }
  async findManyByIds(ids: readonly string[], limit: number) {
    return ids
      .map((id) => this.rows.get(id))
      .filter((r): r is Reading => r !== undefined)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  async markViewed(id: string, now: Date) {
    if (this.rows.has(id)) this.lastViewed.set(id, now);
  }
  async deleteExpired(now: Date) {
    let count = 0;
    for (const [id, r] of this.rows) {
      const days = r.share ? RETENTION_SHARED_DAYS : RETENTION_UNSHARED_DAYS;
      if (this.lastViewed.get(id)!.getTime() < now.getTime() - days * DAY_MS) {
        this.rows.delete(id);
        this.lastViewed.delete(id);
        count++;
      }
    }
    return count;
  }
}

export class InMemoryEventBus implements EventBus {
  readonly published: DomainEvent[] = [];
  private readonly handlers: ((e: DomainEvent) => Promise<void> | void)[] = [];

  subscribe(handler: (e: DomainEvent) => Promise<void> | void) {
    this.handlers.push(handler);
  }

  async publish(e: DomainEvent) {
    this.published.push(e);
    for (const h of this.handlers) await h(e);
  }
}

export class FixedClock {
  constructor(private current: Date) {}
  now() {
    return new Date(this.current.getTime());
  }
  advance(ms: number) {
    this.current = new Date(this.current.getTime() + ms);
  }
}

/** Sinh id tuần tự, dễ đọc trong test. */
export class SequentialIdGenerator {
  private n = 0;
  private t = 0;
  readingId() {
    return `rd_test${String(++this.n).padStart(4, '0')}`;
  }
  shareToken() {
    return `tok_test${String(++this.t).padStart(4, '0')}`;
  }
}
