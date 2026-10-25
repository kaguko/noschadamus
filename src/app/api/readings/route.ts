import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getContainer } from '@/composition/container';
import { ApiError, assertSameOrigin, handle, readJson } from '@/shared/http/api';
import { RATE_LIMITS } from '@/shared/http/rate-limit';
import { enforceRateLimit, NO_STORE, ownerFromRequest, setOwnerCookie } from '../_lib/owner';

/** docs/03 mục 7.1 */
const createBody = z
  .object({
    spreadId: z.enum(['single', 'three']),
    allowReversed: z.boolean().default(true),
    intention: z.string().trim().max(280).optional(),
    storeIntention: z.boolean().default(false),
    // Chỉ để phân tích nghi thức chọn bài; KHÔNG ảnh hưởng kết quả rút.
    pickedSlots: z.array(z.number().int().min(0).max(77)).max(3).optional(),
  })
  .strict();

export const POST = handle(async (req) => {
  const c = getContainer();
  assertSameOrigin(req, c.env.NEXT_PUBLIC_SITE_URL);
  const body = await readJson(req, createBody);
  await enforceRateLimit(
    req,
    c,
    RATE_LIMITS.createReadingPerMinute,
    RATE_LIMITS.createReadingPerHour,
  );

  const owner = ownerFromRequest(req, c);
  const r = await c.reading.createReading.execute({
    spreadId: body.spreadId,
    allowReversed: body.allowReversed,
    intention: body.intention,
    storeIntention: body.storeIntention,
  });
  if (!r.ok) {
    if (r.error === 'INTENTION_TOO_LONG') {
      throw new ApiError('VALIDATION_FAILED', [{ path: 'intention', issue: 'too_long' }]);
    }
    if (r.error === 'SPREAD_NOT_FOUND') {
      throw new ApiError('VALIDATION_FAILED', [{ path: 'spreadId', issue: 'not_found' }]);
    }
    throw new ApiError('INTERNAL');
  }

  const id = r.value.readingId;
  const res = NextResponse.json({ id, path: `/reading/${id}` }, { status: 201, headers: NO_STORE });
  setOwnerCookie(res, req, c, owner, id);
  return res;
});

/** docs/03 mục 7.3 */
export const GET = handle(async (req) => {
  const c = getContainer();
  const items = await c.reading.listOwnedReadings.execute({ owner: ownerFromRequest(req, c) });
  return NextResponse.json({ items }, { headers: NO_STORE });
});
