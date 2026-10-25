'use client';

import clsx from 'clsx';
import { useEffect, useId, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/hooks/use-reduced-motion';
import { AXIS_LABEL_VI, AXIS_ORDER, type AxisId, type AxisVector } from '@/shared/kernel/axes';
import { axisProgress, CX, CY, R, VIEW } from '@/shared/soul-map/geometry';
import { buildSoulMapScene } from '@/shared/soul-map/scene';

/** Tổng thời lượng: trục cuối bắt đầu sau 5×60ms, vẽ 900ms. */
const DRAW_TOTAL_MS = 60 * 5 + 900;
const LAYER_START_MS = 400;
const LAYER_STAGGER_MS = 150;
const LAYER_FADE_MS = 300;

/**
 * docs/06 mục 3: t (ms) từ khi bắt đầu; Infinity = trạng thái cuối.
 * Dừng rAF khi xong; giảm chuyển động hoặc enabled=false → trạng thái cuối ngay.
 */
export function useSoulMapProgress({
  enabled,
  delayMs = 0,
}: {
  enabled: boolean;
  delayMs?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const active = enabled && !reduced;
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const end = delayMs + DRAW_TOTAL_MS + LAYER_FADE_MS + 600;
    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < end) {
        setT(elapsed);
        raf = requestAnimationFrame(tick);
      } else {
        setT(Infinity);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, delayMs]);
  return active ? t : Infinity;
}

export interface SoulMapProps {
  /** Vector để VẼ (soulMap.display). */
  display: { vector: AxisVector; perCard: readonly AxisVector[] };
  /** Giá trị thật, dùng cho bảng đọc màn hình. */
  values: AxisVector;
  reversed?: readonly boolean[];
  dominant: AxisId;
  quiet: AxisId;
  showLabels?: boolean;
  showLayers?: boolean;
  animate?: boolean;
  delayMs?: number;
  title: string;
  description: string;
  tableCaption: string;
  labels?: Readonly<Record<AxisId, string>>;
  className?: string;
}

export function SoulMap({
  display,
  values,
  reversed,
  dominant,
  quiet,
  showLabels = true,
  showLayers = true,
  animate = false,
  delayMs = 0,
  title,
  description,
  tableCaption,
  labels = AXIS_LABEL_VI,
  className,
}: SoulMapProps) {
  const uid = useId().replace(/:/g, '');
  const t = useSoulMapProgress({ enabled: animate, delayMs });
  const done = t === Infinity;
  const progress = done ? undefined : axisProgress(t, delayMs);
  const scene = buildSoulMapScene(
    {
      vector: display.vector,
      perCard: display.perCard,
      reversed,
      dominant,
      quiet,
      showLabels,
      showLayers,
      labels,
    },
    progress,
  );
  const accent = `var(--axis-${scene.accentAxis})`;
  const shown = (k: number) => done || (progress?.[k] ?? 1) > 0.6;
  const layerOpacity = (j: number) =>
    done
      ? 1
      : Math.min(
          1,
          Math.max(0, (t - delayMs - LAYER_START_MS - LAYER_STAGGER_MS * j) / LAYER_FADE_MS),
        );

  return (
    <figure className={clsx('relative m-0', className)}>
      <svg
        role="img"
        aria-labelledby={`${uid}-t ${uid}-d`}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="block h-auto w-full overflow-visible"
        data-state={done ? 'done' : 'drawing'}
      >
        <title id={`${uid}-t`}>{title}</title>
        <desc id={`${uid}-d`}>{description}</desc>
        <defs>
          <radialGradient id={`${uid}-fill`} cx={CX} cy={CY} r={R} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={accent} stopOpacity={0.5} />
            <stop offset="1" stopColor={accent} stopOpacity={0.1} />
          </radialGradient>
        </defs>
        <g stroke="var(--line)" fill="none" strokeWidth={1}>
          {scene.rings.map((ring, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={ring.r}
              strokeOpacity={0.7}
              strokeDasharray={ring.dashed ? '3 4' : undefined}
            />
          ))}
          {scene.spokes.map((sp, i) => (
            <line key={i} x1={CX} y1={CY} x2={sp.x2} y2={sp.y2} strokeOpacity={0.5} />
          ))}
        </g>
        {scene.layers.map((l, j) => (
          <path
            key={j}
            d={l.d}
            fill="none"
            stroke="var(--text-1)"
            strokeOpacity={0.28 * layerOpacity(j)}
            strokeWidth={1.25}
            strokeDasharray={l.dashed ? '4 4' : undefined}
            data-layer={j}
          />
        ))}
        <path
          d={scene.main}
          fill="none"
          stroke={accent}
          strokeOpacity={0.18}
          strokeWidth={10}
          strokeLinejoin="round"
        />
        <path
          d={scene.main}
          fill={`url(#${uid}-fill)`}
          stroke={accent}
          strokeWidth={2.25}
          strokeLinejoin="round"
          data-main=""
        />
        {scene.vertices.map((v, k) => {
          const c = `var(--axis-${v.axis})`;
          const style = { opacity: shown(k) ? 1 : 0, transition: 'opacity 150ms' };
          if (v.kind === 'dominant') {
            return (
              <g key={v.axis} style={style}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={12}
                  fill="none"
                  stroke={c}
                  strokeOpacity={0.45}
                  strokeWidth={1.5}
                />
                <circle cx={v.x} cy={v.y} r={7} fill={c} />
              </g>
            );
          }
          return v.kind === 'quiet' ? (
            <circle
              key={v.axis}
              cx={v.x}
              cy={v.y}
              r={4.5}
              fill="var(--bg-0)"
              stroke={c}
              strokeWidth={2}
              style={style}
            />
          ) : (
            <circle key={v.axis} cx={v.x} cy={v.y} r={4.5} fill={c} style={style} />
          );
        })}
        <circle cx={CX} cy={CY} r={2.5} fill="var(--text-1)" fillOpacity={0.5} />
      </svg>
      {/* Nhãn là chữ HTML 12px thật (không co theo hình) để luôn đọc được trên màn nhỏ. */}
      {scene.labels.map((l, k) => (
        <span
          key={l.axis}
          aria-hidden
          className={clsx(
            'pointer-events-none absolute text-[12px] leading-4 whitespace-nowrap',
            l.kind === 'dominant'
              ? 'font-semibold text-ink1'
              : l.kind === 'quiet'
                ? 'font-medium text-ink3'
                : 'font-medium text-ink2',
          )}
          style={{
            left: `${(l.x / VIEW) * 100}%`,
            top: `${(l.y / VIEW) * 100}%`,
            transform: `translate(${l.anchor === 'start' ? '0' : l.anchor === 'middle' ? '-50%' : '-100%'}, ${l.baseline === 'auto' ? '-100%' : l.baseline === 'middle' ? '-50%' : '0'})`,
            opacity: shown(k) ? 1 : 0,
            transition: 'opacity 150ms',
          }}
        >
          {l.text}
        </span>
      ))}
      <table className="sr-only">
        <caption>{tableCaption}</caption>
        <tbody>
          {AXIS_ORDER.map((a) => (
            <tr key={a}>
              <th scope="row">{labels[a]}</th>
              <td>{Math.round(values[a] * 100)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
