import { MoonStar } from 'lucide-react';
import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/misc';
import { t } from '@/shared/i18n';

export const metadata: Metadata = {
  title: t('errors.not_found_title'),
  robots: { index: false },
};

/** docs/05 mục 9 */
export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60dvh] items-center justify-center">
      <EmptyState
        icon={MoonStar}
        title={t('errors.not_found_title')}
        body={t('errors.not_found_body')}
        action={<ButtonLink href="/">{t('common.home')}</ButtonLink>}
      />
    </div>
  );
}
