/**
 * "Cảnh" Soul Map: mọi thứ cần vẽ, đã tính sẵn (docs/06 mục 2).
 * Component React và renderSoulMapSvg cùng vẽ từ đây nên hình học luôn trùng khớp.
 */
import { AXIS_LABEL_VI, AXIS_ORDER, type AxisId, type AxisVector } from '@/shared/kernel/axes';
import {
  CX,
  CY,
  labelFor,
  pointsFor,
  radiusFor,
  RING_STEPS,
  smoothClosedPath,
  type LabelPos,
} from './geometry';

export interface SoulMapSceneInput {
  /** Vector để VẼ (soulMap.display.vector). */
  vector: AxisVector;
  perCard?: readonly AxisVector[];
  reversed?: readonly boolean[];
  dominant: AxisId;
  quiet: AxisId;
  showLabels: boolean;
  showLayers: boolean;
  labels?: Readonly<Record<AxisId, string>>;
}

export type VertexKind = 'dominant' | 'quiet' | 'normal';

export interface SoulMapScene {
  accentAxis: AxisId;
  rings: { r: number; dashed: boolean }[];
  spokes: { x2: number; y2: number }[];
  layers: { d: string; dashed: boolean }[];
  main: string;
  vertices: { axis: AxisId; x: number; y: number; kind: VertexKind }[];
  labels: ({ axis: AxisId; text: string; kind: VertexKind } & LabelPos)[];
}

const kindOf = (a: AxisId, dominant: AxisId, quiet: AxisId): VertexKind =>
  a === dominant ? 'dominant' : a === quiet ? 'quiet' : 'normal';

/**
 * @param progress tiến độ từng trục cho hoạt ảnh (mặc định 1 = trạng thái cuối)
 */
export function buildSoulMapScene(
  input: SoulMapSceneInput,
  progress?: readonly number[],
): SoulMapScene {
  const pts = pointsFor(input.vector, progress);
  const labels = input.labels ?? AXIS_LABEL_VI;
  return {
    accentAxis: input.dominant,
    rings: RING_STEPS.map((t) => ({ r: radiusFor(t), dashed: t === 1 })),
    spokes: AXIS_ORDER.map((_, k) => {
      const a = -Math.PI / 2 + (k * Math.PI) / 3;
      return { x2: CX + radiusFor(1) * Math.cos(a), y2: CY + radiusFor(1) * Math.sin(a) };
    }),
    layers:
      input.showLayers && input.perCard && input.perCard.length > 1
        ? input.perCard.map((v, j) => ({
            d: smoothClosedPath(pointsFor(v, progress)),
            dashed: input.reversed?.[j] ?? false,
          }))
        : [],
    main: smoothClosedPath(pts),
    vertices: AXIS_ORDER.map((axis, k) => ({
      axis,
      x: pts[k]!.x,
      y: pts[k]!.y,
      kind: kindOf(axis, input.dominant, input.quiet),
    })),
    labels: input.showLabels
      ? AXIS_ORDER.map((axis, k) => ({
          axis,
          text: labels[axis],
          kind: kindOf(axis, input.dominant, input.quiet),
          ...labelFor(k),
        }))
      : [],
  };
}
