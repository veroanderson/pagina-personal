export const adminContactsRepository = {
  list() {
    return fetch('/api/admin/contactos');
  },

  markAsRead(id: number) {
    return fetch('/api/admin/contactos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'markRead' }),
    });
  },

  remove(id: number) {
    return fetch(`/api/admin/contactos?id=${id}`, { method: 'DELETE' });
  },
};
