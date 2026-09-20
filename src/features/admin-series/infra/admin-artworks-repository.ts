import type { ArtworkInput } from '../types/artwork';

export const adminArtworksRepository = {
  listBySeries(seriesId: string) {
    return fetch(`/api/admin/artworks?seriesId=${seriesId}`);
  },

  create(input: ArtworkInput) {
    return fetch('/api/admin/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  update(input: ArtworkInput) {
    return fetch('/api/admin/artworks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  remove(id: number) {
    return fetch(`/api/admin/artworks?id=${id}`, { method: 'DELETE' });
  },
};
