'use client';

import clsx from 'clsx';
import { History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { iconButtonClass } from '@/components/ui/icon-button';
import { t } from '@/shared/i18n';
import { ThemeToggle } from './theme-toggle';

/** docs/04 mục 6: dấu trăng + chữ noschadamus. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-2', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG tĩnh 18px */}
      <img src="/icons/mark.svg" alt="" width={18} height={18} className="size-[18px]" />
      <span className="font-[family-name:var(--font-fraunces-italic),var(--font-display)] text-[19px] font-medium italic tracking-[-0.01em] text-ink1">
        {t('common.brand')}
      </span>
    </span>
  );
}

/** docs/04 mục 7.14 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const onDraw = pathname?.startsWith('/draw');

  return (
    <header
      data-scrolled={scrolled}
      className={clsx(
        'sticky top-0 z-[var(--z-header)] h-14 border-b transition-[background-color,border-color] duration-[var(--dur-base)] lg:h-[72px]',
        scrolled
          ? 'border-line bg-[color-mix(in_oklab,var(--bg-0)_72%,transparent)] backdrop-blur-[12px]'
          : 'border-transparent',
      )}
    >
      <div className="container-page flex h-full items-center justify-between">
        <Link href="/" aria-label={t('header.home_label')} className="-ml-1 rounded-md p-1">
          <Wordmark />
        </Link>
        <nav aria-label={t('header.nav_label')} className="flex items-center gap-1 lg:gap-2">
          <Link
            href="/about"
            className="hidden rounded-full px-3 py-2 text-[15px] font-medium text-ink2 hover:text-ink1 lg:inline-block"
          >
            {t('header.about')}
          </Link>
          <Link
            href="/history"
            className="hidden rounded-full px-3 py-2 text-[15px] font-medium text-ink2 hover:text-ink1 lg:inline-block"
          >
            {t('header.history')}
          </Link>
          <Link
            href="/history"
            aria-label={t('header.history_label')}
            className={clsx(iconButtonClass, 'lg:hidden')}
          >
            <History />
          </Link>
          <ThemeToggle />
          {!onDraw && (
            // Bọc ngoài để `hidden` không xung đột với `inline-flex` của nút.
            <span className="ml-1 hidden lg:block">
              <ButtonLink href="/draw" size="sm">
                {t('common.draw_cta')}
              </ButtonLink>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}

/**
 * docs/04 mục 7.17: dính đáy trên di động (đặt --actionbar-h để toast và nội dung chừa chỗ),
 * nằm trong luồng ở ≥ 1024px.
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => {
      const fixed = getComputedStyle(el).position === 'fixed';
      root.style.setProperty('--actionbar-h', fixed ? `${el.offsetHeight}px` : '0px');
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      root.style.setProperty('--actionbar-h', '0px');
    };
  }, []);
  return (
    <>
      <div
        ref={ref}
        className={clsx(
          'fixed inset-x-0 bottom-0 z-[var(--z-actionbar)] flex gap-3 border-t border-line px-5 pt-3',
          'pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur-[12px]',
          'bg-[color-mix(in_oklab,var(--bg-0)_86%,transparent)]',
          'lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none',
          className,
        )}
      >
        {children}
      </div>
      {/* Chừa chỗ để ActionBar dính đáy không che nội dung cuối trang. */}
      <div aria-hidden className="h-[var(--actionbar-h,0px)] lg:hidden" />
    </>
  );
}
