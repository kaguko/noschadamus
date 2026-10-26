import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getContainer } from '@/composition/container';
import { ToastProvider } from '@/components/ui/toast';
import { Skeleton, SkeletonText } from '@/components/ui/misc';
import { t } from '@/shared/i18n';
import { readOwner } from '../../_server/owner';
import { ReadingScreen } from '../_components/reading-screen';

export const metadata: Metadata = {
  title: t('reading.map.title'),
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reveal?: string }>;
}

/** docs/05 mục 3. Quyền chủ đã được proxy kiểm (404 thật); ở đây kiểm lại để phòng thủ nhiều lớp. */
export default function ReadingPage({ params, searchParams }: Props) {
  return (
    <ToastProvider label={t('common.toast_region')}>
      <Suspense fallback={<ReadingSkeleton />}>
        <ReadingLoader params={params} searchParams={searchParams} />
      </Suspense>
    </ToastProvider>
  );
}

async function ReadingLoader({ params, searchParams }: Props) {
  const [{ id }, { reveal }] = await Promise.all([params, searchParams]);
  const c = getContainer();
  const r = await c.reading.getReadingForOwner.execute({
    readingId: id,
    owner: await readOwner(c),
  });
  if (!r.ok) notFound();
  return <ReadingScreen view={r.value} mode="owner" reveal={reveal === '1'} />;
}

function ReadingSkeleton() {
  return (
    <div className="container-page space-y-8 pt-6 lg:pt-10" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-12 w-72" />
      <div className="flex justify-center gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[178px] w-[104px] rounded-[6px]" />
        ))}
      </div>
      <Skeleton className="mx-auto aspect-square w-full max-w-[420px] rounded-full" />
      <SkeletonText />
    </div>
  );
}
