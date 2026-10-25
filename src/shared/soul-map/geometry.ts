/** Hình học Soul Map (docs/06 mục 1), hệ tọa độ viewBox 0 0 400 400. Thuần, không React. */
import { AXIS_ORDER, type AxisVector } from '@/shared/kernel/axes';

export const VIEW = 400;
export const CX = 200;
export const CY = 200;
export const R = 128;
export const RL = 158;
export const MIN = 0.14;
/** Cỡ chữ nhãn (đơn vị viewBox): ≥ 12px thật khi hình rộng ≥ 320px. */
export const LABEL_SIZE = 15;

/** k = 0 ở đỉnh, theo chiều kim đồng hồ. */
export const axisAngle = (k: number) => -Math.PI / 2 + (k * Math.PI) / 3;
export const radiusFor = (v: number, r = R) => r * (MIN + (1 - MIN) * v);

export interface Pt {
  x: number;
  y: number;
}

export const pointFor = (k: number, v: number, cx = CX, cy = CY, r = R): Pt => {
  const rad = radiusFor(v, r);
  const a = axisAngle(k);
  return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
};

/** `progress[k]` ∈ [0,1] co giãn từng trục (dùng cho hoạt ảnh); mặc định 1. */
export const pointsFor = (vec: AxisVector, progress?: readonly number[]): Pt[] =>
  AXIS_ORDER.map((id, k) => pointFor(k, vec[id] * (progress?.[k] ?? 1)));

/** Đường cong kín mượt: Catmull-Rom → Bézier bậc ba, hệ số 1/6. */
export function smoothClosedPath(pts: readonly Pt[]): string {
  const n = pts.length;
  const f = (x: number) => x.toFixed(2);
  let d = `M${f(pts[0]!.x)} ${f(pts[0]!.y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d + ' Z';
}

export interface LabelPos {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'auto' | 'middle' | 'hanging';
}

/** Vị trí nhãn trục, đã cộng độ lệch dy theo baseline (docs/06 mục 2, lớp 8). */
export function labelFor(k: number): LabelPos {
  const a = axisAngle(k);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const baseline = s < -0.3 ? 'auto' : s > 0.3 ? 'hanging' : 'middle';
  return {
    x: CX + RL * c,
    y: CY + RL * s + (baseline === 'auto' ? -4 : baseline === 'hanging' ? 4 : 0),
    anchor: c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle',
    baseline,
  };
}

/** Vòng lưới: t ∈ {0, .25, .5, .75, 1}. */
export const RING_STEPS = [0, 0.25, 0.5, 0.75, 1] as const;

export const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

/** Tiến độ từng trục tại thời điểm t (ms) của hoạt ảnh vẽ (docs/06 mục 3). */
export function axisProgress(t: number, delayMs = 0, durationMs = 900, staggerMs = 60): number[] {
  return AXIS_ORDER.map((_, k) => {
    const x = (t - delayMs - staggerMs * k) / durationMs;
    return easeOutExpo(Math.min(1, Math.max(0, x)));
  });
}
