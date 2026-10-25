import { createHash, createHmac } from 'node:crypto';

/**
 * Mã khách ẩn danh, xoay mỗi ngày UTC (docs/03 mục 9):
 *   salt = HMAC(ANALYTICS_SECRET, yyyy-mm-dd);  hash = sha256(salt + ip + userAgent)
 * Không lưu IP/UA; không nhận diện xuyên ngày.
 */
export function visitorHash(secret: string, ip: string, userAgent: string, now: Date): string {
  const day = now.toISOString().slice(0, 10);
  const salt = createHmac('sha256', secret).update(day).digest('hex');
  return createHash('sha256').update(`${salt}|${ip}|${userAgent}`).digest('base64url');
}

/** Mã dùng cho sự kiện do server phát (không gắn với khách cụ thể). */
export const SERVER_VISITOR = 'server';
