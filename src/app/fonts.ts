import { Be_Vietnam_Pro, Fraunces } from 'next/font/google';

// Bản tĩnh, chỉ subset latin + vietnamese: giảm từ ~650 KB phông xuống còn vài chục KB (đo ở T20).
export const fraunces = Fraunces({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600'],
  style: ['normal'],
  variable: '--font-fraunces',
  display: 'swap',
});

/** Chỉ dùng cho wordmark: không preload để không chặn LCP. */
export const frauncesItalic = Fraunces({
  subsets: ['latin', 'vietnamese'],
  weight: ['500'],
  style: ['italic'],
  variable: '--font-fraunces-italic',
  display: 'swap',
  preload: false,
});

export const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  variable: '--font-be-vietnam',
  display: 'swap',
});
