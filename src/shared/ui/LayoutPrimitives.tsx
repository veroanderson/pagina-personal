import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('rounded-lg border border-line bg-surface shadow-panel', className)}
    />
  );
}

export function ModalFrame({
  children,
  className,
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-overlay/85 p-4 backdrop-blur-sm lg:p-12">
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={cn('my-auto w-full max-w-4xl rounded-lg border border-line bg-surface-raised p-6 shadow-modal lg:p-10', className)}
        role="dialog"
      >
        {children}
      </div>
    </div>
  );
}

export function RichText({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('ui-rich-text', className)} />;
}

export function PageHeading({
  children,
  description,
  eyebrow,
  className,
}: {
  children: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {eyebrow && <span className="text-xs uppercase font-mono tracking-widest text-accent">{eyebrow}</span>}
      <h1 className="font-serif-editorial text-3xl font-normal leading-tight tracking-editorial text-ink lg:text-5xl">
        {children}
      </h1>
      <div className="h-0.5 w-16 bg-accent/60" />
      {description && <p className="text-base font-light text-ink-muted">{description}</p>}
    </div>
  );
}
