import type { Metadata, Viewport } from 'next';
import { Footer, Header } from '@/components/layout/site-chrome';
import { Starfield } from '@/components/layout/starfield';
import { themeInitScript } from '@/components/layout/theme';
import { ToastProvider } from '@/components/ui/toast';
import { t } from '@/shared/i18n';
import { beVietnam, fraunces } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: t('landing.meta_title'), template: '%s · noschadamus' },
  description: t('landing.meta_description'),
  openGraph: { locale: 'vi_VN', siteName: 'noschadamus', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#0E0F1A',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      data-theme="dark"
      className={`${fraunces.variable} ${beVietnam.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[var(--z-toast)] rounded-full bg-accent px-4 py-2 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t('common.skip_to_content')}
        </a>
        <div className="nd-glow" aria-hidden="true" />
        <Starfield />
        <ToastProvider label={t('common.toast_region')}>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
