import clsx from 'clsx';
import { LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { forwardRef, type ComponentProps, type ReactNode } from 'react';

/** docs/04 mục 7.1 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-ink shadow-[var(--glow-accent)] hover:bg-accent-hover active:bg-accent-press',
  secondary: 'border border-line-strong text-ink1 hover:bg-bg2',
  ghost: 'text-ink2 hover:bg-bg2 hover:text-ink1',
  danger:
    'border border-danger text-danger hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[14px] gap-2 [--icon:16px] after:absolute after:-inset-1',
  md: 'h-11 px-6 text-[16px] gap-2 [--icon:20px]',
  lg: 'h-[52px] px-7 text-[17px] gap-2.5 [--icon:20px]',
};

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  full = false,
) {
  return clsx(
    'relative inline-flex select-none items-center justify-center rounded-full font-semibold whitespace-nowrap',
    'transition-[background-color,color,transform,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-standard)]',
    'active:translate-y-px disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
    'aria-disabled:pointer-events-none aria-disabled:opacity-45',
    '[&_svg]:size-[var(--icon)] [&_svg]:shrink-0',
    VARIANT[variant],
    SIZE[size],
    full && 'w-full',
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export interface ButtonProps extends ComponentProps<'button'>, CommonProps {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    full,
    icon,
    iconEnd,
    loading = false,
    className,
    children,
    disabled,
    onClick,
    type,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={clsx(buttonClass(variant, size, full), className)}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={loading ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconEnd}
    </button>
  );
});

export interface ButtonLinkProps extends ComponentProps<typeof Link>, CommonProps {}

export function ButtonLink({
  variant,
  size,
  full,
  icon,
  iconEnd,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={clsx(buttonClass(variant, size, full), className)} {...rest}>
      {icon}
      {children}
      {iconEnd}
    </Link>
  );
}
