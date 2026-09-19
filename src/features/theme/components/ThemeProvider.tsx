'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  applyThemePreference,
  getSystemTheme,
  persistThemePreference,
  readStoredThemePreference,
  subscribeToSystemTheme,
  THEME_STORAGE_KEY,
} from '../infra/browser-theme';
import { isThemePreference, resolveThemePreference } from '../services/resolve-theme';
import type { ResolvedTheme, ThemePreference } from '../types/theme';

interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialPreference = readStoredThemePreference();
    const initialResolvedTheme = resolveThemePreference(initialPreference, getSystemTheme());

    setPreference(initialPreference);
    setResolvedTheme(initialResolvedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const syncPreference = (nextPreference: ThemePreference) => {
      persistThemePreference(nextPreference);
      setResolvedTheme(applyThemePreference(nextPreference));
    };

    syncPreference(preference);

    const unsubscribeSystemTheme =
      preference === 'system'
        ? subscribeToSystemTheme((systemTheme) => {
            setResolvedTheme(applyThemePreference('system', systemTheme));
          })
        : () => undefined;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;

      const nextPreference = isThemePreference(event.newValue) ? event.newValue : 'system';
      setPreference(nextPreference);
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribeSystemTheme();
      window.removeEventListener('storage', handleStorage);
    };
  }, [mounted, preference]);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
