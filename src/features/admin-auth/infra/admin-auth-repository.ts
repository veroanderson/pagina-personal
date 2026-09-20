export const adminAuthRepository = {
  login(password: string) {
    return fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
  },

  logout() {
    return fetch('/api/auth/logout', { method: 'POST' });
  },
};
