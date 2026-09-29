export { POST as uploadAdminMedia } from './infra/server/upload-route';
export { POST as previewAdminMedia } from './infra/server/upload-preview-route';
export {
  GET as getAdminUploadSettings,
  PUT as updateAdminUploadSettings,
} from './infra/server/upload-settings-route';
export { GET as getLegacyUpload } from './infra/server/legacy-uploads-route';
