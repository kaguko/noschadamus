'use client';

import * as RadixAccordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';

/** docs/04 mục 7.11: một mục mở tại một thời điểm. */
export function Accordion({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <RadixAccordion.Root type="single" collapsible className="border-t border-line">
      {items.map((it, i) => (
        <RadixAccordion.Item key={i} value={String(i)} className="border-b border-line">
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left">
              <span className="t-h3 text-[18px]">{it.q}</span>
              <Plus
                aria-hidden
                className="size-5 shrink-0 text-ink2 transition-transform duration-[var(--dur-slow)] group-data-[state=open]:rotate-45"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="nd-accordion overflow-hidden">
            <p className="measure pb-5 text-ink2">{it.a}</p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
