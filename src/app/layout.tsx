import type { Metadata, Viewport } from 'next';
import { Starfield } from '@/components/layout/starfield';
import { themeInitScript } from '@/components/layout/theme';
import { beVietnam, fraunces } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'noschadamus', template: '%s · noschadamus' },
  description: 'Rút tarot, nhận bản đồ linh hồn.',
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
      <body>
        <div className="nd-glow" aria-hidden="true" />
        <Starfield />
        {children}
      </body>
    </html>
  );
}
