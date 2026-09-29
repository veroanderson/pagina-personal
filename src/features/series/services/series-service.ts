import { getArtworksBySeries, getSeries, getSeriesBySlug, getSeriesRecordsBySeries } from '@/lib/db';

export const seriesService = {
  listPublished: () => getSeries(false),
  getBySlug: getSeriesBySlug,
  listArtworks: getArtworksBySeries,
  listRecords: getSeriesRecordsBySeries,
};
