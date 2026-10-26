import 'server-only';
import { cookies } from 'next/headers';
import type { OwnerContext } from '@/contexts/reading/application/ports';
import type { Container } from '@/composition/container';
import { OWNER_COOKIE } from '@/shared/http/owner-cookie';

/** Đọc danh tính chủ từ cookie đã ký (docs/03 mục 6). Phải gọi bên trong <Suspense>. */
export async function readOwner(c: Container): Promise<OwnerContext> {
  const store = await cookies();
  return { ownedReadingIds: c.infra.ownerCookie.decode(store.get(OWNER_COOKIE)?.value) };
}
