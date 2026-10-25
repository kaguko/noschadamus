import type { AxisVector } from '@/shared/kernel/axes';
import { computeSoulMap, displaySoulMap } from '../domain';
import type { ReadingView } from './dto';

/**
 * Soul Map dạng ReadingView từ các vector có trọng số, cho trang mẫu (landing, /dev).
 * Dùng đúng thuật toán của bản đọc thật.
 */
export function soulMapPreview(
  items: readonly { weight: number; vector: AxisVector }[],
): ReadingView['soulMap'] {
  const map = computeSoulMap(items);
  return { ...map, display: displaySoulMap(map) };
}

/** Ví dụ vàng 2 (docs/01 mục 3.2): Chàng Khờ xuôi, Tòa Tháp xuôi, Ngôi Sao ngược. */
export const GOLDEN_EXAMPLE_ITEMS = [
  {
    weight: 0.8,
    vector: {
      energy: 0.75,
      emotion: 0.55,
      connection: 0.45,
      grounding: 0.15,
      mind: 0.25,
      change: 0.9,
    },
  },
  {
    weight: 1.2,
    vector: {
      energy: 0.95,
      emotion: 0.7,
      connection: 0.2,
      grounding: 0.05,
      mind: 0.35,
      change: 0.95,
    },
  },
  {
    weight: 1.0,
    vector: {
      energy: 0.7667,
      emotion: 0.3667,
      connection: 0.4667,
      grounding: 0.6667,
      mind: 0.6167,
      change: 0.6167,
    },
  },
] as const satisfies readonly { weight: number; vector: AxisVector }[];
