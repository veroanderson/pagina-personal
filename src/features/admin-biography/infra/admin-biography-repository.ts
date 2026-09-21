import type { AdminBiographySectionInput } from '../types/biography';

export const adminBiographyRepository = {
  list() {
    return fetch('/api/admin/bio');
  },

  create(input: AdminBiographySectionInput) {
    return fetch('/api/admin/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: AdminBiographySectionInput) {
    return fetch('/api/admin/bio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...input }),
    });
  },

  reorder(orderedIds: number[]) {
    return fetch('/api/admin/bio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
  },

  remove(id: number) {
    return fetch(`/api/admin/bio?id=${id}`, { method: 'DELETE' });
  },
};
