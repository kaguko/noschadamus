'use client';

import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';

/** docs/04 mục 7.7: nhóm radio dạng thẻ lớn; mũi tên chuyển lựa chọn. */
export interface SpreadOptionItem<T extends string> {
  value: T;
  name: string;
  tagline: string;
  time: string;
  cards: 1 | 3;
}

function Illustration({ count }: { count: 1 | 3 }) {
  const angles = count === 1 ? [0] : [-6, 0, 6];
  return (
    <span aria-hidden className="relative flex h-14 w-16 shrink-0 items-center justify-center">
      {angles.map((a, i) => (
        <span
          key={i}
          className="absolute h-12 w-7 rounded-[4px] border border-line-strong bg-bg2"
          style={{
            transform: `translateX(${(i - (angles.length - 1) / 2) * 12}px) rotate(${a}deg)`,
          }}
        />
      ))}
    </span>
  );
}

export function SpreadOptionGroup<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly SpreadOptionItem<T>[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = value ? items.findIndex((i) => i.value === value) : 0;

  function onKey(e: KeyboardEvent, index: number) {
    const delta =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? -1
          : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + items.length) % items.length;
    onChange(items[next]!.value);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={label} className="grid gap-3 lg:grid-cols-2 lg:gap-4">
      {items.map((item, i) => {
        const checked = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === focusIndex ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKey(e, i)}
            className={clsx(
              'relative flex items-center gap-4 rounded-xl border p-5 text-left transition-colors duration-[var(--dur-base)]',
              'lg:min-h-36',
              checked
                ? 'border-accent bg-accent-soft [border-width:1.5px]'
                : 'border-line bg-bg1 hover:border-line-strong',
            )}
          >
            <Illustration count={item.cards} />
            <span className="min-w-0">
              <span className="t-h3 block">{item.name}</span>
              <span className="t-small block text-ink2">{item.tagline}</span>
              <span className="t-small mt-1 block text-ink3">{item.time}</span>
            </span>
            <span
              aria-hidden
              className={clsx(
                'absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-accent text-accent-ink transition-transform duration-[160ms]',
                checked ? 'scale-100' : 'scale-0',
              )}
            >
              <Check className="size-4" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
