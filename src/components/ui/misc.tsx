import clsx from 'clsx';
import { MoonStar, type LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

/** docs/04 mục 7.13 */
export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={clsx('nd-skeleton block rounded-md bg-bg2', className)}
      style={style}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <span aria-hidden className="block space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className="h-4" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </span>
  );
}

/** docs/04 mục 7.14 */
export function EmptyState({
  icon: Icon = MoonStar,
  title,
  body,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center pt-16 text-center">
      <Icon aria-hidden className="size-12 text-ink3" strokeWidth={1.5} />
      <h2 className="t-h3 mt-4">{title}</h2>
      <p className="mt-2 text-ink2">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** docs/04 mục 9: thẻ nền. */
export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx('rounded-xl border border-line bg-bg1 p-5 lg:p-8', className)}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={clsx('t-caption text-accent-text', className)}>{children}</p>;
}
