import type { SeriesRecordInput } from '../types/series-record';

export const adminSeriesRecordsRepository = {
  listBySeries(seriesId: string) {
    return fetch(`/api/admin/series-records?seriesId=${encodeURIComponent(seriesId)}`);
  },

  create(input: SeriesRecordInput) {
    return fetch('/api/admin/series-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  update(input: SeriesRecordInput) {
    return fetch('/api/admin/series-records', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  remove(id: number) {
    return fetch(`/api/admin/series-records?id=${id}`, { method: 'DELETE' });
  },
};
