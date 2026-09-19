import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size = 'md', variant = 'primary', ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50',
        {
          sm: 'px-3 py-1.5 text-xs',
          md: 'px-4 py-2.5 text-sm',
          lg: 'px-6 py-3 text-base',
        }[size],
        {
          primary: 'bg-accent text-accent-contrast hover:opacity-90',
          secondary: 'border border-accent bg-surface text-ink hover:bg-accent hover:text-accent-contrast',
          ghost: 'border border-line bg-transparent text-ink-muted hover:bg-surface-hover hover:text-ink',
          danger: 'bg-danger/15 text-danger hover:bg-danger/25',
        }[variant],
        className,
      )}
    />
  );
});
