import type { SeriesInput } from '../types/series';

export const adminSeriesRepository = {
  list() {
    return fetch('/api/admin/series');
  },

  create(input: SeriesInput) {
    return fetch('/api/admin/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  update(input: SeriesInput) {
    return fetch('/api/admin/series', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  remove(id: number) {
    return fetch(`/api/admin/series?id=${id}`, { method: 'DELETE' });
  },
};
