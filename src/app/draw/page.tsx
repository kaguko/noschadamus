import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/toast';
import { t } from '@/shared/i18n';
import { DrawFlow } from './_components/draw-flow';

export const metadata: Metadata = {
  title: t('draw.meta_title'),
  robots: { index: false, follow: false },
};

export default function DrawPage() {
  return (
    // data-focus-page: ẩn footer bằng CSS để người dùng tập trung (docs/05 mục 2).
    <div data-focus-page>
      <ToastProvider label={t('common.toast_region')}>
        <DrawFlow />
      </ToastProvider>
    </div>
  );
}
