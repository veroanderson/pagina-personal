import { adminAuthRepository } from '../infra/admin-auth-repository';

export const adminAuthService = {
  login(password: string) {
    return adminAuthRepository.login(password.trim());
  },

  logout() {
    return adminAuthRepository.logout();
  },
};
