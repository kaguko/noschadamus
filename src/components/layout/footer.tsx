/** docs/04 mục 7.15-7.16. Server component (không JS); trang /draw ẩn footer bằng CSS :has(). */
import clsx from 'clsx';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { t } from '@/shared/i18n';
import { CookieNote } from './cookie-note';

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={clsx('t-small flex gap-2 text-ink3', className)}>
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{t('footer.disclaimer')}</span>
    </p>
  );
}

const LINKS = [
  ['/about', 'footer.about'],
  ['/privacy', 'footer.privacy'],
  ['/terms', 'footer.terms'],
] as const;

export function Footer() {
  return (
    <footer className="nd-footer mt-24 border-t border-line bg-bg1 py-10">
      <div className="container-page space-y-5">
        <nav aria-label={t('footer.about')} className="flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map(([href, key]) => (
            <Link
              key={href}
              href={href}
              className="text-[15px] font-medium text-ink2 hover:text-ink1"
            >
              {t(key)}
            </Link>
          ))}
        </nav>
        <Disclaimer className="measure" />
        <div>
          <p className="t-small text-ink3">{t('footer.art_credit')}</p>
          <p className="t-small text-ink3">
            {t('footer.copyright', { year: process.env.NEXT_PUBLIC_BUILD_YEAR ?? '' })}
          </p>
          <CookieNote />
        </div>
      </div>
    </footer>
  );
}
