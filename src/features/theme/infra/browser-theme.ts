import type { ResolvedTheme, ThemePreference } from '../types/theme';
import { isThemePreference, resolveThemePreference } from '../services/resolve-theme';

export const THEME_STORAGE_KEY = 'vero-theme';

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function readStoredThemePreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function persistThemePreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Theme preference is non-critical when browser storage is unavailable.
  }
}

export function applyThemePreference(
  preference: ThemePreference,
  systemTheme = getSystemTheme(),
): ResolvedTheme {
  const resolvedTheme = resolveThemePreference(preference, systemTheme);
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
}

export function subscribeToSystemTheme(onChange: (theme: ResolvedTheme) => void): () => void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (event: MediaQueryListEvent) => {
    onChange(event.matches ? 'dark' : 'light');
  };

  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}
