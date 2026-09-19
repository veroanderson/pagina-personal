import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyThemePreference,
  getSystemTheme,
  persistThemePreference,
  readStoredThemePreference,
  subscribeToSystemTheme,
  THEME_STORAGE_KEY,
} from './browser-theme';

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

describe('browser theme infrastructure', () => {
  beforeEach(() => {
    installMatchMedia(false);
  });

  it('falls back to system when storage is empty or invalid', () => {
    expect(readStoredThemePreference()).toBe('system');

    window.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');
    expect(readStoredThemePreference()).toBe('system');
  });

  it('persists a supported preference', () => {
    persistThemePreference('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('resolves and applies the system theme to the document', () => {
    expect(getSystemTheme()).toBe('light');
    expect(applyThemePreference('system')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.dataset.themePreference).toBe('system');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('applies explicit preferences without depending on the system', () => {
    installMatchMedia(true);

    expect(applyThemePreference('light')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(applyThemePreference('dark')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('notifies subscribers when the system preference changes', () => {
    const media = installMatchMedia(false);
    const onChange = vi.fn();
    const unsubscribe = subscribeToSystemTheme(onChange);

    media.change(true);
    expect(onChange).toHaveBeenCalledWith('dark');

    unsubscribe();
    media.change(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
