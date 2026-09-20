import type { UploadAdminMediaInput } from '../types/media';

export const adminMediaRepository = {
  upload({ entity, id, file }: UploadAdminMediaInput) {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`/api/admin/upload?entity=${encodeURIComponent(entity)}&id=${id}`, {
      method: 'POST',
      body: formData,
    });
  },
};
