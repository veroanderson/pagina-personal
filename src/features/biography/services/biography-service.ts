import {
  createBiographySection,
  listBiographySections,
  reorderBiographySections,
  softDeleteBiographySection,
  updateBiographySection,
} from '../infra/biography-repository';
import type { BiographySection, BiographySectionInput } from '../types/biography';
import {
  BiographySectionNotFoundError,
  BiographyValidationError,
  normalizeSubtitle,
  validateBiographyHierarchy,
  validateBiographySectionInput,
} from './biography-validation';

function normalizeInput(input: BiographySectionInput): BiographySectionInput {
  return { ...input, subtitle: normalizeSubtitle(input.subtitle) };
}

function validateInput(input: BiographySectionInput): BiographySectionInput {
  const normalized = normalizeInput(input);
  validateBiographySectionInput(normalized);
  return normalized;
}

function withReplacement(
  sections: BiographySection[],
  id: number,
  input: BiographySectionInput,
): BiographySection[] {
  const index = sections.findIndex((section) => section.id === id);
  if (index === -1) throw new BiographySectionNotFoundError();

  const nextSections = [...sections];
  nextSections[index] = { ...nextSections[index], ...input };
  return nextSections;
}

export const biographyService = {
  async getPublishedSections() {
    return listBiographySections(false);
  },

  async getAdminSections() {
    return listBiographySections(true);
  },

  async createSection(input: BiographySectionInput) {
    const normalized = validateInput(input);
    const sections = await listBiographySections(true);
    const draft: BiographySection = {
      id: -1,
      subtitle: normalized.subtitle ?? null,
      bodyText: normalized.bodyText,
      headingLevel: normalized.headingLevel,
      displayOrder: sections.length,
      isActive: normalized.isActive,
      createdAt: '',
      updatedAt: '',
      deletedAt: null,
    };

    validateBiographyHierarchy([...sections, draft]);
    return createBiographySection(normalized, sections.length);
  },

  async updateSection(id: number, input: BiographySectionInput) {
    const normalized = validateInput(input);
    const sections = await listBiographySections(true);
    validateBiographyHierarchy(withReplacement(sections, id, normalized));
    return updateBiographySection(id, normalized);
  },

  async deleteSection(id: number) {
    const sections = await listBiographySections(true);
    const nextSections = sections.filter((section) => section.id !== id);
    if (nextSections.length === sections.length) throw new BiographySectionNotFoundError();
    validateBiographyHierarchy(nextSections);
    return softDeleteBiographySection(id);
  },

  async reorderSections(orderedIds: number[]) {
    if (!Array.isArray(orderedIds) || orderedIds.some((id) => !Number.isInteger(id))) {
      throw new BiographyValidationError('La lista de orden no es válida');
    }

    const sections = await listBiographySections(true);
    if (orderedIds.length !== sections.length || new Set(orderedIds).size !== orderedIds.length) {
      throw new BiographyValidationError('La lista de orden debe incluir todas las secciones una sola vez');
    }

    // Reordering is intentionally independent from heading hierarchy.
    const byId = new Map(sections.map((section) => [section.id, section]));
    orderedIds.forEach((id) => {
      const section = byId.get(id);
      if (!section) throw new BiographyValidationError('La lista de orden contiene una sección inválida');
      return;
    });

    return reorderBiographySections(orderedIds);
  },
};

export {
  BiographySectionNotFoundError,
  BiographyValidationError,
  isBiographyHeadingLevel,
} from './biography-validation';
