export const BIOGRAPHY_HEADING_LEVELS = ['large', 'medium', 'small'] as const;

export type BiographyHeadingLevel = (typeof BIOGRAPHY_HEADING_LEVELS)[number];

export interface BiographySection {
  id: number;
  subtitle: string | null;
  bodyText: string;
  headingLevel: BiographyHeadingLevel;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BiographySectionInput {
  subtitle?: string | null;
  bodyText: string;
  headingLevel: BiographyHeadingLevel;
  isActive: boolean;
}
