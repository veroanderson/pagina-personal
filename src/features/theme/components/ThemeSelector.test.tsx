import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { ThemeSelector } from './ThemeSelector';

function installMatchMedia(matches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: () => true,
  } as unknown as MediaQueryList;

  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));

  return {
    change(nextMatches: boolean) {
      Object.defineProperty(mediaQuery, 'matches', { value: nextMatches, configurable: true });
      listeners.forEach((listener) => listener({ matches: nextMatches } as MediaQueryListEvent));
    },
  };
}

function renderThemeSelector() {
  return render(
    <ThemeProvider>
      <ThemeSelector />
    </ThemeProvider>,
  );
}

describe('ThemeSelector', () => {
  beforeEach(() => {
    installMatchMedia(false);
  });

  it('starts in system mode and resolves the current system theme', async () => {
    renderThemeSelector();

    await waitFor(() => expect(screen.getByRole('button', { name: 'Sistema' })).toHaveAttribute('aria-pressed', 'true'));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('persists explicit choices and updates the document theme', async () => {
    renderThemeSelector();

    fireEvent.click(screen.getByRole('button', { name: 'Oscuro' }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
      expect(window.localStorage.getItem('vero-theme')).toBe('dark');
      expect(screen.getByRole('button', { name: 'Oscuro' })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('returns to system mode and follows later system changes', async () => {
    const media = installMatchMedia(false);
    renderThemeSelector();

    fireEvent.click(screen.getByRole('button', { name: 'Oscuro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sistema' }));

    await waitFor(() => expect(window.localStorage.getItem('vero-theme')).toBe('system'));
    media.change(true);

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
  });

  it('accepts a theme change received from another tab', async () => {
    renderThemeSelector();

    window.dispatchEvent(new StorageEvent('storage', { key: 'vero-theme', newValue: 'dark' }));

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe('dark'));
  });
});
