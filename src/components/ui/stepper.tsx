import clsx from 'clsx';

/** docs/04 mục 7.6 */
export function Stepper({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <p className="t-caption text-ink2">{label}</p>
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={label}
      >
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-bg3">
            <span
              className={clsx(
                'absolute inset-0 origin-left rounded-full bg-accent transition-transform duration-[var(--dur-slow)] ease-[var(--ease-standard)]',
                i < current ? 'scale-x-100' : 'scale-x-0',
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
