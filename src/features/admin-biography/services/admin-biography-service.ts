import { adminBiographyRepository } from '../infra/admin-biography-repository';

export const adminBiographyService = {
  getBiography() {
    return adminBiographyRepository.get();
  },

  updateBiography(bioText: string) {
    return adminBiographyRepository.update(bioText);
  },
};
