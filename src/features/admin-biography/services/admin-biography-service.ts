import { adminBiographyRepository } from '../infra/admin-biography-repository';
import type { AdminBiographySectionInput } from '../types/biography';

export const adminBiographyService = {
  listBiography() {
    return adminBiographyRepository.list();
  },

  createBiographySection(input: AdminBiographySectionInput) {
    return adminBiographyRepository.create(input);
  },

  updateBiographySection(id: number, input: AdminBiographySectionInput) {
    return adminBiographyRepository.update(id, input);
  },

  reorderBiographySections(orderedIds: number[]) {
    return adminBiographyRepository.reorder(orderedIds);
  },

  deleteBiographySection(id: number) {
    return adminBiographyRepository.remove(id);
  },
};
