import { AXIS_ORDER, type AxisId, type AxisVector } from '@/shared/kernel/axes';

export interface SoulMap {
  /** Vector tổng hợp, làm tròn 4 chữ số. */
  readonly vector: AxisVector;
  readonly dominant: AxisId;
  readonly second: AxisId;
  readonly quiet: AxisId;
  /** Vector hiệu lực của từng lá theo thứ tự vị trí, làm tròn 4 chữ số. */
  readonly perCard: readonly AxisVector[];
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
  };
}
