import { describe, expect, it } from 'vitest';
import type { BiographySection } from '../types/biography';
import { validateBiographyHierarchy } from './biography-validation';

function section(
  headingLevel: BiographySection['headingLevel'],
  options: Partial<BiographySection> = {},
): BiographySection {
  return {
    id: options.id ?? 1,
    subtitle: options.subtitle === undefined ? 'Título' : options.subtitle,
    bodyText: options.bodyText ?? 'Texto',
    headingLevel,
    displayOrder: options.displayOrder ?? 0,
    isActive: options.isActive ?? true,
    createdAt: options.createdAt ?? '',
    updatedAt: options.updatedAt ?? '',
    deletedAt: options.deletedAt ?? null,
  };
}

describe('validateBiographyHierarchy', () => {
  it('accepts a large heading as the first titled section', () => {
    expect(() => validateBiographyHierarchy([section('large')])).not.toThrow();
  });

  it('accepts medium after large and small after medium', () => {
    expect(() => validateBiographyHierarchy([
      section('large'),
      section('medium'),
      section('small'),
    ])).not.toThrow();
  });

  it('rejects medium without a previous large heading', () => {
    expect(() => validateBiographyHierarchy([section('medium')])).toThrow('subtítulo grande');
  });

  it('rejects small without a previous medium heading in the current branch', () => {
    expect(() => validateBiographyHierarchy([
      section('large'),
      section('small'),
    ])).toThrow('subtítulo mediano');
  });

  it('resets the branch after a new large heading', () => {
    expect(() => validateBiographyHierarchy([
      section('large'),
      section('medium'),
      section('large'),
      section('small'),
    ])).toThrow('subtítulo mediano');
  });

  it('ignores sections without subtitles and inactive sections', () => {
    expect(() => validateBiographyHierarchy([
      section('medium', { subtitle: null }),
      section('small', { isActive: false }),
      section('large'),
      section('small'),
    ])).toThrow('subtítulo mediano');
  });
});
