'use client';

import React, { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/ui';
import { useTheme } from '../hooks/useTheme';
import type { ThemePreference } from '../types/theme';

const options: Array<{ value: ThemePreference; label: string; compactLabel: string }> = [
  { value: 'system', label: 'Sistema', compactLabel: 'S' },
  { value: 'light', label: 'Claro', compactLabel: 'C' },
  { value: 'dark', label: 'Oscuro', compactLabel: 'O' },
];

interface ThemeSelectorProps {
  variant?: 'compact' | 'full';
}

export function ThemeSelector({ variant = 'full' }: ThemeSelectorProps) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      aria-label="Preferencia de tema"
      className={cn(
        'inline-flex items-center rounded border border-line bg-surface p-0.5',
        variant === 'compact' ? 'gap-0.5' : 'gap-1',
      )}
      role="group"
    >
      {options.map((option) => (
        <ThemeOptionButton
          key={option.value}
          active={preference === option.value}
          compact={variant === 'compact'}
          label={option.label}
          onClick={() => setPreference(option.value)}
        >
          {variant === 'compact' ? option.compactLabel : option.label}
        </ThemeOptionButton>
      ))}
    </div>
  );
}

function ThemeOptionButton({
  active,
  compact,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  compact: boolean;
  label: string;
}) {
  return (
    <button
      {...props}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        compact ? 'min-w-7' : 'min-w-16',
        active ? 'bg-accent text-accent-contrast' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
      )}
      type="button"
    />
  );
}
