import type {
  BiographyHeadingLevel,
  BiographySection,
  BiographySectionInput,
} from '../types/biography';

export class BiographyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BiographyValidationError';
  }
}

export class BiographySectionNotFoundError extends Error {
  constructor() {
    super('Sección de biografía no encontrada');
    this.name = 'BiographySectionNotFoundError';
  }
}

export function normalizeSubtitle(subtitle: string | null | undefined): string | null {
  const normalized = subtitle?.trim() ?? '';
  return normalized || null;
}

export function isBiographyHeadingLevel(value: unknown): value is BiographyHeadingLevel {
  return value === 'large' || value === 'medium' || value === 'small';
}

export function validateBiographySectionInput(input: BiographySectionInput): void {
  if (!input.bodyText.trim()) {
    throw new BiographyValidationError('El texto de la sección es obligatorio');
  }

  if (!isBiographyHeadingLevel(input.headingLevel)) {
    throw new BiographyValidationError('El tamaño del subtítulo no es válido');
  }

  if (typeof input.isActive !== 'boolean') {
    throw new BiographyValidationError('El estado de visibilidad no es válido');
  }
}

export function validateBiographyHierarchy(sections: BiographySection[]): void {
  let hasLargeHeading = false;
  let hasMediumHeading = false;

  for (const section of sections.filter((item) => item.isActive && item.subtitle)) {
    if (section.headingLevel === 'large') {
      hasLargeHeading = true;
      hasMediumHeading = false;
      continue;
    }

    if (section.headingLevel === 'medium') {
      if (!hasLargeHeading) {
        throw new BiographyValidationError('Un subtítulo mediano necesita un subtítulo grande anterior');
      }
      hasMediumHeading = true;
      continue;
    }

    if (!hasMediumHeading) {
      throw new BiographyValidationError('Un subtítulo chico necesita un subtítulo mediano anterior');
    }
  }
}
