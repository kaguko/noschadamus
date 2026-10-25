'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { AXIS_LABEL_VI, AXIS_ORDER, type AxisId, type AxisVector } from '@/shared/kernel/axes';

/**
 * docs/04 mục 7.12: hàng chú giải trục, sắp giá trị giảm dần.
 * Thanh và số dùng GIÁ TRỊ THẬT (không dùng vector hiển thị).
 */
export interface AxisMeterListProps {
  values: AxisVector;
  dominant: AxisId;
  quiet: AxisId;
  balanced: boolean;
  badges: { dominant: string; quiet: string; dominantSoft: string; quietSoft: string };
  animate?: boolean;
  delayMs?: number;
  labels?: Readonly<Record<AxisId, string>>;
}

export function AxisMeterList({
  values,
  dominant,
  quiet,
  balanced,
  badges,
  animate = false,
  delayMs = 0,
  labels = AXIS_LABEL_VI,
}: AxisMeterListProps) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const id = window.setTimeout(() => setStarted(true), delayMs);
    return () => window.clearTimeout(id);
  }, [animate, delayMs]);
  const filled = !animate || started;

  const rows = [...AXIS_ORDER].sort(
    (a, b) => values[b] - values[a] || AXIS_ORDER.indexOf(a) - AXIS_ORDER.indexOf(b),
  );
  return (
    <ul className="space-y-3" aria-hidden>
      {rows.map((a, i) => {
        const pct = Math.round(values[a] * 100);
        const badge =
          a === dominant
            ? balanced
              ? badges.dominantSoft
              : badges.dominant
            : a === quiet
              ? balanced
                ? badges.quietSoft
                : badges.quiet
              : null;
        return (
          <li key={a} className="grid grid-cols-[10px_minmax(0,auto)_1fr_40px] items-center gap-3">
            <span className="size-2.5 rounded-full" style={{ background: `var(--axis-${a})` }} />
            <span className="flex min-w-[96px] items-center gap-2">
              <span
                className={clsx(
                  't-small',
                  a === dominant ? 'font-semibold text-ink1' : 'text-ink2',
                )}
              >
                {labels[a]}
              </span>
              {badge && (
                <span className="rounded-full border border-line-strong px-2 py-0.5 text-[11px] leading-none font-semibold text-ink2">
                  {badge}
                </span>
              )}
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-bg3">
              <span
                className="block h-full origin-left rounded-full transition-transform ease-[var(--ease-expo-out)]"
                style={{
                  background: `var(--axis-${a})`,
                  transform: `scaleX(${filled ? values[a] : 0})`,
                  transitionDuration: '900ms',
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </span>
            <span className="t-small t-num text-right text-ink2">{pct}</span>
          </li>
        );
      })}
    </ul>
  );
}
