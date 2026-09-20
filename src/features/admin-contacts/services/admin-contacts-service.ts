import { adminContactsRepository } from '../infra/admin-contacts-repository';

export const adminContactsService = {
  listContacts: adminContactsRepository.list,
  markContactAsRead: adminContactsRepository.markAsRead,
  removeContact: adminContactsRepository.remove,
};
