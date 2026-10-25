import clsx from 'clsx';
import { forwardRef, type ComponentProps } from 'react';

/** docs/04 mục 7.2: 40×40 (vùng chạm 44), bắt buộc aria-label. */
export interface IconButtonProps extends Omit<ComponentProps<'button'>, 'aria-label'> {
  'aria-label': string;
}

export const iconButtonClass = clsx(
  'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink2',
  'transition-colors duration-[var(--dur-base)] hover:bg-bg2 hover:text-ink1',
  'after:absolute after:-inset-0.5 [&_svg]:size-5',
  'disabled:pointer-events-none disabled:opacity-45',
);

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={clsx(iconButtonClass, className)}
      {...rest}
    />
  );
});
