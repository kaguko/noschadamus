import { NextResponse, type NextRequest } from 'next/server';
import { OWNER_COOKIE, OwnerCookieCodec } from '@/shared/http/owner-cookie';

/**
 * Trang bản đọc riêng: kiểm quyền chủ TRƯỚC khi render để trả đúng HTTP 404
 * (trang stream sau <Suspense> không đổi được mã trạng thái). Trang vẫn tự kiểm lại.
 */
export function proxy(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/')[2] ?? '';
  const secret = process.env.OWNER_COOKIE_SECRET ?? '';
  const owned = secret
    ? new OwnerCookieCodec(secret).decode(req.cookies.get(OWNER_COOKIE)?.value)
    : [];
  if (!owned.includes(id)) {
    // Đường dẫn không tồn tại → trang not-found với mã 404, không lộ bản đọc có tồn tại hay không.
    return NextResponse.rewrite(new URL('/_nd/not-found', req.url), { status: 404 });
  }
  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = {
  matcher: ['/reading/:id'],
};
