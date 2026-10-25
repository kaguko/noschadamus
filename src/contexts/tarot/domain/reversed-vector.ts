import { AXIS_ORDER, clamp01, type AxisId, type AxisVector } from '@/shared/kernel/axes';

/**
 * Vector của lá ngược: đảo hồ sơ quanh trung bình của chính lá (docs/01 mục 2.2).
 * v'_i = clamp01(2m − v_i), m = trung bình 6 trục.
 */
export function reversedVector(v: AxisVector): AxisVector {
  const m = AXIS_ORDER.reduce((sum, a) => sum + v[a], 0) / AXIS_ORDER.length;
  const out = {} as Record<AxisId, number>;
  for (const a of AXIS_ORDER) out[a] = clamp01(2 * m - v[a]);
  return out;
}
