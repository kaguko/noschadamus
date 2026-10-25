import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'noschadamus',
  description: 'Rút tarot, nhận bản đồ linh hồn.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
