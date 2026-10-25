import { AXIS_ORDER, clamp01, type AxisId, type AxisVector } from '../../src/shared/kernel/axes';
import type { MinorRank, Suit } from '../../src/contexts/tarot/domain/card';

/**
 * Công thức vector 56 lá phụ: docs/02 mục 4.
 * Vector cơ sở đã tinh chỉnh (Cửa kiểm 1) để mỗi trục nổi bật ở khoảng 14-20%.
 */
export const SUIT_BASE: Readonly<Record<Suit, AxisVector>> = {
  wands: {
    energy: 0.85,
    emotion: 0.45,
    connection: 0.38,
    grounding: 0.44,
    mind: 0.46,
    change: 0.7,
  },
  cups: { energy: 0.4, emotion: 0.88, connection: 0.82, grounding: 0.45, mind: 0.38, change: 0.4 },
  swords: {
    energy: 0.55,
    emotion: 0.3,
    connection: 0.22,
    grounding: 0.38,
    mind: 0.76,
    change: 0.6,
  },
  pentacles: {
    energy: 0.4,
    emotion: 0.4,
    connection: 0.6,
    grounding: 0.7,
    mind: 0.5,
    change: 0.25,
  },
};

export const RANK_K: Readonly<Record<MinorRank, number>> = {
  ace: 0.3,
  '2': -0.2,
  '3': 0,
  '4': -0.1,
  '5': 0.4,
  '6': -0.1,
  '7': 0.1,
  '8': 0,
  '9': 0.2,
  '10': 0.5,
  page: 0,
  knight: 0,
  queen: 0,
  king: 0,
};

export const COURT_OFFSET: Readonly<Partial<Record<MinorRank, Partial<Record<AxisId, number>>>>> = {
  page: { change: 0.15, mind: 0.05 },
  knight: { energy: 0.2, change: 0.1 },
  queen: { emotion: 0.15, connection: 0.1 },
  king: { mind: 0.15, grounding: 0.1 },
};

const round3 = (x: number) => Math.round((x + Number.EPSILON) * 1000) / 1000;

export function minorVector(suit: Suit, rank: MinorRank): AxisVector {
  const base = SUIT_BASE[suit];
  const k = RANK_K[rank];
  const offset = COURT_OFFSET[rank] ?? {};
  const out = {} as Record<AxisId, number>;
  for (const a of AXIS_ORDER) {
    out[a] = round3(clamp01(base[a] + k * (base[a] - 0.5) + (offset[a] ?? 0)));
  }
  return out;
}

export const SUIT_NAME: Readonly<Record<Suit, { vi: string; en: string }>> = {
  wands: { vi: 'Gậy', en: 'Wands' },
  cups: { vi: 'Cốc', en: 'Cups' },
  swords: { vi: 'Kiếm', en: 'Swords' },
  pentacles: { vi: 'Tiền', en: 'Pentacles' },
};

export const RANK_NAME: Readonly<Record<MinorRank, { vi: string; en: string; number: number }>> = {
  ace: { vi: 'Át', en: 'Ace', number: 1 },
  '2': { vi: 'Hai', en: 'Two', number: 2 },
  '3': { vi: 'Ba', en: 'Three', number: 3 },
  '4': { vi: 'Bốn', en: 'Four', number: 4 },
  '5': { vi: 'Năm', en: 'Five', number: 5 },
  '6': { vi: 'Sáu', en: 'Six', number: 6 },
  '7': { vi: 'Bảy', en: 'Seven', number: 7 },
  '8': { vi: 'Tám', en: 'Eight', number: 8 },
  '9': { vi: 'Chín', en: 'Nine', number: 9 },
  '10': { vi: 'Mười', en: 'Ten', number: 10 },
  page: { vi: 'Thị Đồng', en: 'Page', number: 11 },
  knight: { vi: 'Hiệp Sĩ', en: 'Knight', number: 12 },
  queen: { vi: 'Hoàng Hậu', en: 'Queen', number: 13 },
  king: { vi: 'Vua', en: 'King', number: 14 },
};

export const minorName = (suit: Suit, rank: MinorRank) => ({
  vi: `${RANK_NAME[rank].vi} ${SUIT_NAME[suit].vi}`,
  en: `${RANK_NAME[rank].en} of ${SUIT_NAME[suit].en}`,
});
