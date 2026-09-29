export type AdminMediaEntity = 'artwork' | 'home' | 'manifesto' | 'series-record';

export interface UploadAdminMediaInput {
  entity: AdminMediaEntity;
  id: number | 'temp';
  file: File;
}
