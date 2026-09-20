import type { UpdateHomeSettingsInput } from '../types/home';

export const adminHomeRepository = {
  get() {
    return fetch('/api/admin/home');
  },

  update(input: UpdateHomeSettingsInput) {
    return fetch('/api/admin/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  },
};
