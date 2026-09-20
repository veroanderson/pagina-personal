export const adminBiographyRepository = {
  get() {
    return fetch('/api/admin/bio');
  },

  update(bioText: string) {
    return fetch('/api/admin/bio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bioText }),
    });
  },
};
