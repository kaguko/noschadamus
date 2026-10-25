import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getContainer } from '@/composition/container';
import { ApiError, handle } from '@/shared/http/api';

function authorized(header: string | null, secret: string): boolean {
  const given = Buffer.from(header ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Vercel Cron, 03:00 UTC hằng ngày (docs/03 mục 5). */
export const GET = handle(async (req) => {
  const c = getContainer();
  if (!authorized(req.headers.get('authorization'), c.env.CRON_SECRET)) {
    throw new ApiError('NOT_FOUND');
  }
  const now = c.infra.clock.now();
  const readings = await c.reading.repository.deleteExpired(now);
  const events = await c.analytics.purgeEvents.execute();
  const rateLimitBuckets = await c.infra.rateLimiter.purge(now);
  console.log(JSON.stringify({ level: 'info', msg: 'purge', readings, events, rateLimitBuckets }));
  return NextResponse.json({ readings, events, rateLimitBuckets });
});
