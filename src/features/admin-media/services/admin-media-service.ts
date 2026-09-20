import { adminMediaRepository } from '../infra/admin-media-repository';

export const adminMediaService = {
  uploadMedia: adminMediaRepository.upload,
};
