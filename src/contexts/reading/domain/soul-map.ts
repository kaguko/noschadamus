import { AXIS_ORDER, clamp01, type AxisId, type AxisVector } from '@/shared/kernel/axes';

export interface SoulMap {
  /** Vector tổng hợp, làm tròn 4 chữ số. */
  readonly vector: AxisVector;
  readonly dominant: AxisId;
  readonly second: AxisId;
  readonly quiet: AxisId;
  /** Vector hiệu lực của từng lá theo thứ tự vị trí, làm tròn 4 chữ số. */
  readonly perCard: readonly AxisVector[];
  /** Chênh lệch giữa trục cao nhất và thấp nhất < BALANCED_RANGE. */
  readonly balanced: boolean;
}

/** Dưới ngưỡng này (thang 0-1), bản đồ được coi là cân bằng (Cửa kiểm 1). */
export const BALANCED_RANGE = 0.15;

/** Độ chênh mục tiêu khi kéo giãn hiển thị, xấp xỉ trung vị của bản đọc một lá. */
export const DISPLAY_TARGET_RANGE = 0.55;
export const DISPLAY_MAX_STRETCH = 2.5;

export interface SoulMapDisplay {
  readonly vector: AxisVector;
  readonly perCard: readonly AxisVector[];
  /** Hệ số kéo giãn đã dùng (1 = giữ nguyên). */
  readonly stretch: number;
}

export interface WeightedVector {
  readonly weight: number;
  readonly vector: AxisVector;
}

const round4 = (x: number) => Math.round((x + Number.EPSILON) * 10_000) / 10_000;

const roundVector = (v: AxisVector): AxisVector =>
  Object.fromEntries(AXIS_ORDER.map((a) => [a, round4(v[a])])) as Record<AxisId, number>;

/** Trục lớn nhất; hòa thì trục đứng trước trong AXIS_ORDER thắng. */
function argMax(v: AxisVector, exclude?: AxisId): AxisId {
  let best: AxisId | null = null;
  for (const a of AXIS_ORDER) {
    if (a === exclude) continue;
    if (best === null || v[a] > v[best]) best = a;
  }
  return best!;
}

/** Trục nhỏ nhất; hòa thì trục đứng trước trong AXIS_ORDER thắng. */
function argMin(v: AxisVector): AxisId {
  let best: AxisId = AXIS_ORDER[0];
  for (const a of AXIS_ORDER) if (v[a] < v[best]) best = a;
  return best;
}

/**
 * Trung bình có trọng số của các vector hiệu lực (docs/01 mục 3.2).
 * Chọn dominant/second/quiet bằng giá trị CHƯA làm tròn, rồi mới làm tròn đầu ra.
 */
export function computeSoulMap(items: readonly WeightedVector[]): SoulMap {
  if (items.length === 0) throw new Error('computeSoulMap cần ít nhất một lá');
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const raw = {} as Record<AxisId, number>;
  for (const a of AXIS_ORDER) {
    raw[a] = items.reduce((s, i) => s + i.weight * i.vector[a], 0) / totalWeight;
  }
  const dominant = argMax(raw);
  const second = argMax(raw, dominant);
  let quiet = argMin(raw);
  if (quiet === dominant) {
    quiet = [...AXIS_ORDER].reverse().find((a) => a !== dominant)!;
  }
  return {
    vector: roundVector(raw),
    dominant,
    second,
    quiet,
    perCard: items.map((i) => roundVector(i.vector)),
    balanced: raw[dominant] - raw[quiet] < BALANCED_RANGE,
  };
}

/**
 * Vector CHỈ để vẽ: kéo giãn tương phản quanh trung bình của bản đồ, để bản đồ ba lá
 * không gần như lục giác đều. Dữ liệu lưu, số hiển thị và chữ vẫn dùng giá trị thật.
 *   k = clamp(DISPLAY_TARGET_RANGE / range, 1, DISPLAY_MAX_STRETCH)
 *   v' = clamp01(mean + (v − mean) · k)   (cùng một phép biến đổi cho cả lớp từng lá)
 */
export function displaySoulMap(map: Pick<SoulMap, 'vector' | 'perCard'>): SoulMapDisplay {
  const xs = AXIS_ORDER.map((a) => map.vector[a]);
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  const range = Math.max(...xs) - Math.min(...xs);
  const k =
    range <= 0
      ? DISPLAY_MAX_STRETCH
      : Math.min(DISPLAY_MAX_STRETCH, Math.max(1, DISPLAY_TARGET_RANGE / range));
  const stretch = (v: AxisVector): AxisVector =>
    roundVector(
      Object.fromEntries(AXIS_ORDER.map((a) => [a, clamp01(mean + (v[a] - mean) * k)])) as Record<
        AxisId,
        number
      >,
    );
  return { vector: stretch(map.vector), perCard: map.perCard.map(stretch), stretch: round4(k) };
}
