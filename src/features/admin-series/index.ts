export { default as AdminSeriesArtworksPage } from './components/AdminSeriesArtworksPage';
export { default as AdminSeriesPage } from './components/AdminSeriesPage';
export { default as AdminSeriesRecordsPage } from './components/AdminSeriesRecordsPage';

export {
  DELETE as deleteAdminSeriesRecord,
  GET as getAdminSeriesRecords,
  POST as createAdminSeriesRecord,
  PUT as updateAdminSeriesRecord,
} from './infra/server/series-records-route';
