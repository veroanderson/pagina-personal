import { adminHomeRepository } from '../infra/admin-home-repository';

export const adminHomeService = {
  getHomeSettings: adminHomeRepository.get,
  updateHomeSettings: adminHomeRepository.update,
};
