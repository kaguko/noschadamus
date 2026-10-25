import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'noschadamus',
    short_name: 'noschadamus',
    description: 'Rút tarot, nhận bản đồ linh hồn.',
    lang: 'vi',
    start_url: '/',
    display: 'standalone',
    theme_color: '#0E0F1A',
    background_color: '#0E0F1A',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
