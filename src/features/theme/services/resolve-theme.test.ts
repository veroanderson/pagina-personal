import { describe, expect, it } from 'vitest';
import { isThemePreference, resolveThemePreference } from './resolve-theme';

describe('resolveThemePreference', () => {
  it('resolves system to the current operating-system theme', () => {
    expect(resolveThemePreference('system', 'light')).toBe('light');
    expect(resolveThemePreference('system', 'dark')).toBe('dark');
  });

  it('keeps explicit light and dark preferences', () => {
    expect(resolveThemePreference('light', 'dark')).toBe('light');
    expect(resolveThemePreference('dark', 'light')).toBe('dark');
  });
});

describe('isThemePreference', () => {
  it('accepts only supported preferences', () => {
    expect(isThemePreference('system')).toBe(true);
    expect(isThemePreference('light')).toBe(true);
    expect(isThemePreference('dark')).toBe(true);
    expect(isThemePreference('sepia')).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });
});
