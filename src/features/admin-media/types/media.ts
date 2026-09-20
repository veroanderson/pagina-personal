export type AdminMediaEntity = 'artwork' | 'home' | 'manifesto';

export interface UploadAdminMediaInput {
  entity: AdminMediaEntity;
  id: number | 'temp';
  file: File;
}
