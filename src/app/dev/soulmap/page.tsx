import { notFound } from 'next/navigation';
import {
  GOLDEN_EXAMPLE_ITEMS,
  soulMapPreview,
} from '@/contexts/reading/application/soul-map-preview';
import { SoulMapDemo } from './soul-map-demo';

export const metadata = { title: 'Soul Map', robots: { index: false } };

export default function DevSoulMapPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const golden2 = soulMapPreview(GOLDEN_EXAMPLE_ITEMS);
  const golden1 = soulMapPreview([GOLDEN_EXAMPLE_ITEMS[2]]);
  // Bản đồ ba lá phẳng (chênh < 0.15): minh họa kéo giãn hiển thị.
  const flat = soulMapPreview([
    {
      weight: 0.8,
      vector: {
        energy: 0.55,
        emotion: 0.62,
        connection: 0.58,
        grounding: 0.5,
        mind: 0.6,
        change: 0.52,
      },
    },
    {
      weight: 1.2,
      vector: {
        energy: 0.6,
        emotion: 0.55,
        connection: 0.6,
        grounding: 0.58,
        mind: 0.57,
        change: 0.5,
      },
    },
    {
      weight: 1.0,
      vector: {
        energy: 0.52,
        emotion: 0.6,
        connection: 0.62,
        grounding: 0.55,
        mind: 0.6,
        change: 0.55,
      },
    },
  ]);
  return (
    <SoulMapDemo
      maps={[
        { name: 'Ví dụ vàng 2 (ba lá)', map: golden2, reversed: [false, false, true] },
        { name: 'Ví dụ vàng 1 (Ngôi Sao ngược)', map: golden1, reversed: [true] },
        { name: 'Bản đồ phẳng (kéo giãn ×2.5)', map: flat, reversed: [false, false, false] },
      ]}
    />
  );
}
