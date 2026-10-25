import { createHmac, timingSafeEqual } from 'node:crypto';

/** Cookie chủ sở hữu (docs/03 mục 6): danh sách id bản đọc, ký HMAC-SHA256. */
export const OWNER_COOKIE = 'nd_owner';
export const OWNER_COOKIE_MAX_IDS = 50;
export const OWNER_COOKIE_MAX_AGE = 34_560_000; // 400 ngày

const ID_PATTERN = /^rd_[1-9A-HJ-NP-Za-km-z]{16}$/;

export const ownerCookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: OWNER_COOKIE_MAX_AGE,
});

export class OwnerCookieCodec {
  constructor(private readonly secret: string) {}

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }

  encode(ids: readonly string[]): string {
    const payload = Buffer.from(
      JSON.stringify({ v: 1, ids: ids.slice(0, OWNER_COOKIE_MAX_IDS) }),
    ).toString('base64url');
    return `${payload}.${this.sign(payload)}`;
  }

  /** Không bao giờ throw: chữ ký sai hoặc dữ liệu hỏng → danh sách rỗng. */
  decode(value: string | undefined | null): string[] {
    if (!value) return [];
    const dot = value.indexOf('.');
    if (dot <= 0) return [];
    const payload = value.slice(0, dot);
    const given = Buffer.from(value.slice(dot + 1), 'base64url');
    const expected = Buffer.from(this.sign(payload), 'base64url');
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return [];
    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown;
      if (typeof data !== 'object' || data === null) return [];
      const { v, ids } = data as { v?: unknown; ids?: unknown };
      if (v !== 1 || !Array.isArray(ids)) return [];
      return ids
        .filter((x): x is string => typeof x === 'string' && ID_PATTERN.test(x))
        .slice(0, OWNER_COOKIE_MAX_IDS);
    } catch {
      return [];
    }
  }
}

/** Thêm id mới vào đầu, bỏ trùng, giữ tối đa 50. */
export function withReading(ids: readonly string[], id: string): string[] {
  return [id, ...ids.filter((x) => x !== id)].slice(0, OWNER_COOKIE_MAX_IDS);
}
