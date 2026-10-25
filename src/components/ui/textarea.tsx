'use client';

import clsx from 'clsx';
import { forwardRef, type ComponentProps } from 'react';

/** docs/04 mục 7.4: đếm ký tự; dán quá giới hạn thì cắt và báo qua onTruncate. */
export interface CountedTextareaProps extends Omit<
  ComponentProps<'textarea'>,
  'value' | 'onChange'
> {
  value: string;
  onValueChange: (v: string) => void;
  max: number;
  onTruncate?: () => void;
}

const length = (s: string) => [...s].length;
const cut = (s: string, max: number) => [...s].slice(0, max).join('');

export const CountedTextarea = forwardRef<HTMLTextAreaElement, CountedTextareaProps>(
  function CountedTextarea({ value, onValueChange, max, onTruncate, className, id, ...rest }, ref) {
    const n = length(value);
    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            if (length(next) > max) {
              onValueChange(cut(next, max));
              onTruncate?.();
            } else {
              onValueChange(next);
            }
          }}
          aria-describedby={id ? `${id}-count` : undefined}
          className={clsx(
            'block min-h-[120px] w-full resize-none rounded-lg border border-line-strong bg-bg1 p-4 pb-8 text-base text-ink1',
            'placeholder:text-ink3 transition-[border-color,box-shadow] duration-[var(--dur-base)]',
            'focus:border-accent focus:shadow-[0_0_0_4px_var(--accent-soft)] focus:outline-none',
            className,
          )}
          {...rest}
        />
        <span
          id={id ? `${id}-count` : undefined}
          aria-live="polite"
          className={clsx(
            't-caption t-num pointer-events-none absolute right-4 bottom-3 normal-case tracking-normal',
            n >= max ? 'text-danger' : 'text-ink3',
          )}
        >
          {n}/{max}
        </span>
      </div>
    );
  },
);
