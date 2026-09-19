import type { HTMLAttributes } from 'react';
import { cn } from './cn';

export interface ToneProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
}

export function Alert({ className, tone = 'info', ...props }: HTMLAttributes<HTMLDivElement> & ToneProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded border p-4 text-sm',
        {
          info: 'border-accent bg-accent/10 text-accent',
          success: 'border-success bg-success/10 text-success',
          warning: 'border-warning bg-warning/10 text-warning',
          danger: 'border-danger bg-danger/10 text-danger',
        }[tone],
        className,
      )}
      role="status"
    />
  );
}

export function Badge({ className, tone = 'neutral', ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' }) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-mono uppercase tracking-wider',
        {
          neutral: 'border border-line bg-surface-hover text-ink-muted',
          accent: 'bg-accent text-accent-contrast',
          success: 'border border-success/40 bg-success/15 text-success',
          warning: 'border border-warning/40 bg-warning/15 text-warning',
          danger: 'border border-danger/40 bg-danger/15 text-danger',
        }[tone],
        className,
      )}
    />
  );
}
