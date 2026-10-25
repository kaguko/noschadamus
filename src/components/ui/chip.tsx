import clsx from 'clsx';
import { RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AxisId } from '@/shared/kernel/axes';

/** docs/04 mục 7.3 */
const BASE =
  'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] leading-none whitespace-nowrap';

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={clsx(BASE, 'border border-line bg-bg2 font-medium text-ink2', className)}>
      {children}
    </span>
  );
}

export function KeywordChip({ children }: { children: ReactNode }) {
  return <span className={clsx(BASE, 'border border-line bg-bg2 text-ink2')}>{children}</span>;
}

export function AxisChip({ axis, children }: { axis: AxisId; children: ReactNode }) {
  const color = `var(--axis-${axis})`;
  return (
    <span
      className={clsx(BASE, 'border font-medium text-ink1')}
      style={{
        background: `color-mix(in oklab, ${color} 14%, var(--bg-1))`,
        borderColor: `color-mix(in oklab, ${color} 40%, transparent)`,
      }}
    >
      <span aria-hidden className="size-2 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

export function OrientationChip({ reversed, label }: { reversed: boolean; label: string }) {
  return reversed ? (
    <span
      className={clsx(BASE, 'border border-dashed border-line-strong bg-bg2 font-medium text-ink1')}
    >
      <RotateCcw aria-hidden className="size-3.5" />
      {label}
    </span>
  ) : (
    <Chip>{label}</Chip>
  );
}
