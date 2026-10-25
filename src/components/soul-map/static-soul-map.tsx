/** Soul Map tĩnh, render ở server (không JS): cho phần trang trí. */
import clsx from 'clsx';
import { renderSoulMapSvg, type SoulMapRenderInput } from '@/shared/soul-map/render-svg';

export function StaticSoulMap({
  className,
  ...input
}: Omit<SoulMapRenderInput, 'palette'> & { className?: string }) {
  return (
    <div
      aria-hidden
      className={clsx('[&>svg]:block [&>svg]:h-auto [&>svg]:w-full', className)}
      dangerouslySetInnerHTML={{ __html: renderSoulMapSvg({ ...input, palette: 'css' }) }}
    />
  );
}
