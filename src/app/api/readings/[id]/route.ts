import { NextResponse } from 'next/server';
import { getContainer } from '@/composition/container';
import { ApiError, handle } from '@/shared/http/api';
import { NO_STORE, ownerFromRequest } from '../../_lib/owner';

/** docs/03 mục 7.2: chỉ chủ; người khác nhận 404 như không tồn tại. */
export const GET = handle(async (req, { params }) => {
  const c = getContainer();
  const r = await c.reading.getReadingForOwner.execute({
    readingId: params.id ?? '',
    owner: ownerFromRequest(req, c),
  });
  if (!r.ok) throw new ApiError('NOT_FOUND');
  return NextResponse.json(r.value, { headers: NO_STORE });
});
