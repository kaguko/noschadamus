import type { Card } from './card';
import type { Spread } from './spread';

/** Bộ 78 lá giả cho test (không phải dữ liệu thật). */
export function fakeDeck(size = 78): Card[] {
  return Array.from({ length: size }, (_, i) => ({
    id: `card-${String(i).padStart(2, '0')}`,
    arcana: i < 22 ? 'major' : 'minor',
    suit: null,
    rank: null,
    number: i,
    name: { vi: `Lá ${i}`, en: `Card ${i}` },
    keywords: { upright: ['a', 'b', 'c'], reversed: ['d', 'e', 'f'] },
    meaning: { upright: 'xuôi', reversed: 'ngược' },
    prompts: { upright: ['p1?', 'p2?'], reversed: ['q1?', 'q2?'] },
    vector: { energy: 0.5, emotion: 0.5, connection: 0.5, grounding: 0.5, mind: 0.5, change: 0.5 },
  }));
}

export const SINGLE: Spread = {
  id: 'single',
  name: { vi: 'Một lá' },
  tagline: { vi: '' },
  positions: [
    { index: 0, key: 'single', label: { vi: 'Hôm nay' }, description: { vi: '' }, weight: 1 },
  ],
};

export const THREE: Spread = {
  id: 'three',
  name: { vi: 'Ba lá' },
  tagline: { vi: '' },
  positions: [
    { index: 0, key: 'past', label: { vi: 'Quá khứ' }, description: { vi: '' }, weight: 0.8 },
    { index: 1, key: 'present', label: { vi: 'Hiện tại' }, description: { vi: '' }, weight: 1.2 },
    { index: 2, key: 'opening', label: { vi: 'Hướng mở' }, description: { vi: '' }, weight: 1.0 },
  ],
};
