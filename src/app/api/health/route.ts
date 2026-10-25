import { NextResponse } from 'next/server';
import { getContainer } from '@/composition/container';
import { handle } from '@/shared/http/api';

/** Không lộ phiên bản hay chi tiết lỗi (docs/03 mục 12). */
export const GET = handle(async () => {
  let db = false;
  try {
    await getContainer().db.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    db = false;
  }
  return NextResponse.json(
    { ok: db, db },
    { status: db ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
});
