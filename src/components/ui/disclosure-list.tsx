/**
 * FAQ bằng <details> gốc (không JS). Thuộc tính `name` chung giúp chỉ một mục mở một lúc
 * trên trình duyệt hỗ trợ (docs/04 mục 7.11).
 */
import { Plus } from 'lucide-react';

export function DisclosureList({
  items,
  name,
}: {
  items: readonly { q: string; a: string }[];
  name: string;
}) {
  return (
    <div className="border-t border-line">
      {items.map((it, i) => (
        <details key={i} name={name} className="group border-b border-line">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span className="t-h3 text-[18px]">{it.q}</span>
            <Plus
              aria-hidden
              className="size-5 shrink-0 text-ink2 transition-transform duration-[var(--dur-slow)] group-open:rotate-45"
            />
          </summary>
          <p className="measure pb-5 text-ink2">{it.a}</p>
        </details>
      ))}
    </div>
  );
}
