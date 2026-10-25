import { NextResponse } from 'next/server';
import { getContainer } from '@/composition/container';
import { sharePath } from '@/contexts/reading/application/dto';
import { ApiError, assertSameOrigin, handle } from '@/shared/http/api';
import { RATE_LIMITS } from '@/shared/http/rate-limit';
import { enforceRateLimit, NO_STORE, ownerFromRequest } from '../../../_lib/owner';

/** docs/03 mục 7.4: idempotent. */
export const POST = handle(async (req, { params }) => {
  const c = getContainer();
  assertSameOrigin(req, c.env.NEXT_PUBLIC_SITE_URL);
  await enforceRateLimit(req, c, RATE_LIMITS.share);
  const r = await c.reading.shareReading.execute({
    readingId: params.id ?? '',
    owner: ownerFromRequest(req, c),
  });
  if (!r.ok) throw new ApiError('NOT_FOUND');
  return NextResponse.json(
    {
      token: r.value.token,
      path: sharePath(r.value.token),
      sharedAt: r.value.sharedAt.toISOString(),
    },
    { headers: NO_STORE },
  );
});

/** docs/03 mục 7.5: idempotent; từ đây /s/<token cũ> trả 404. */
export const DELETE = handle(async (req, { params }) => {
  const c = getContainer();
  assertSameOrigin(req, c.env.NEXT_PUBLIC_SITE_URL);
  const r = await c.reading.revokeShare.execute({
    readingId: params.id ?? '',
    owner: ownerFromRequest(req, c),
  });
  if (!r.ok) throw new ApiError('NOT_FOUND');
  return new NextResponse(null, { status: 204, headers: NO_STORE });
});
