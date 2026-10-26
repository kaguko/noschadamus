import type { NextResponse } from 'next/server';
import type { OwnerContext } from '@/contexts/reading/application/ports';
import type { Container } from '@/composition/container';
import { OWNER_COOKIE, ownerCookieOptions, withReading } from '@/shared/http/owner-cookie';
import { ApiError, rateLimitSubject } from '@/shared/http/api';
import type { RateLimitRule } from '@/shared/http/rate-limit';

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return undefined;
}

export function ownerFromRequest(req: Request, c: Container): OwnerContext {
  return { ownedReadingIds: c.infra.ownerCookie.decode(readCookie(req, OWNER_COOKIE)) };
}

export function setOwnerCookie(
  res: NextResponse,
  req: Request,
  c: Container,
  owner: OwnerContext,
  newId: string,
) {
  const secure = new URL(req.url).protocol === 'https:';
  res.cookies.set(
    OWNER_COOKIE,
    c.infra.ownerCookie.encode(withReading(owner.ownedReadingIds, newId)),
    ownerCookieOptions(secure),
  );
}

export async function enforceRateLimit(req: Request, c: Container, ...rules: RateLimitRule[]) {
  const subject = rateLimitSubject(req, c.env.ANALYTICS_SECRET);
  const now = c.infra.clock.now();
  // Chỉ để chạy e2e song song (mọi yêu cầu cùng một IP); production để mặc định 1.
  const multiplier = Math.max(1, Number(process.env.RATE_LIMIT_MULTIPLIER ?? 1) || 1);
  for (const rule of rules) {
    const r = await c.infra.rateLimiter.consume(
      { ...rule, limit: rule.limit * multiplier },
      subject,
      now,
    );
    if (!r.allowed) {
      throw new ApiError('RATE_LIMITED', undefined, { 'Retry-After': String(r.retryAfterSec) });
    }
  }
}

export const NO_STORE = { 'Cache-Control': 'private, no-store' };
