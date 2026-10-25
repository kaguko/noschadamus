'use client';

import * as RadixSwitch from '@radix-ui/react-switch';
import clsx from 'clsx';
import { useId } from 'react';

/** docs/04 mục 7.5: hàng có nhãn + mô tả, cả hàng bấm được (cao ≥ 56). */
export interface SwitchRowProps {
  label: string;
  help?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function SwitchRow({
  label,
  help,
  checked,
  onCheckedChange,
  disabled,
  className,
}: SwitchRowProps) {
  const id = useId();
  return (
    <div
      className={clsx(
        'flex min-h-14 cursor-pointer items-start gap-4 py-2',
        disabled && 'cursor-not-allowed',
        className,
      )}
      onClick={() => !disabled && onCheckedChange(!checked)}
    >
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={help ? `${id}-help` : undefined}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'relative mt-0.5 inline-flex h-[26px] w-11 shrink-0 items-center rounded-full p-[3px]',
          // Chỉ làm mờ nút gạt; chữ giữ tương phản AA.
          'disabled:opacity-45',
          'transition-colors duration-[var(--dur-base)] bg-bg3 data-[state=checked]:bg-accent',
        )}
      >
        <RadixSwitch.Thumb
          className={clsx(
            'block size-5 rounded-full bg-ink2 transition-transform duration-[var(--dur-base)] ease-[var(--ease-standard)]',
            'data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-accent-ink',
          )}
        />
      </RadixSwitch.Root>
      <div className="min-w-0">
        <label
          htmlFor={id}
          className="block font-medium text-ink1"
          onClick={(e) => e.preventDefault()}
        >
          {label}
        </label>
        {help && (
          <p id={`${id}-help`} className="t-small text-ink2">
            {help}
          </p>
        )}
      </div>
    </div>
  );
}
