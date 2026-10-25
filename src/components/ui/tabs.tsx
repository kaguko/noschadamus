'use client';

import * as RadixTabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
import type { ReactNode } from 'react';

export function Tabs<T extends string>({
  value,
  onValueChange,
  tabs,
  label,
  children,
}: {
  value: T;
  onValueChange: (v: T) => void;
  tabs: readonly { value: T; label: string }[];
  label: string;
  children: ReactNode;
}) {
  return (
    <RadixTabs.Root value={value} onValueChange={(v) => onValueChange(v as T)}>
      <RadixTabs.List
        aria-label={label}
        className="flex gap-1 rounded-full border border-line bg-bg2 p-1"
      >
        {tabs.map((t) => (
          <RadixTabs.Trigger
            key={t.value}
            value={t.value}
            className={clsx(
              'h-9 flex-1 rounded-full px-3 text-[14px] font-semibold text-ink2 transition-colors duration-[var(--dur-base)]',
              'hover:text-ink1 data-[state=active]:bg-bg1 data-[state=active]:text-ink1 data-[state=active]:shadow-[var(--shadow-card)]',
            )}
          >
            {t.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {children}
    </RadixTabs.Root>
  );
}

export const TabPanel = RadixTabs.Content;
