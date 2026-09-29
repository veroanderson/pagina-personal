import { adminSeriesRecordsRepository } from '../infra/admin-series-records-repository';

export const adminSeriesRecordsService = {
  listBySeries: adminSeriesRecordsRepository.listBySeries,
  create: adminSeriesRecordsRepository.create,
  update: adminSeriesRecordsRepository.update,
  remove: adminSeriesRecordsRepository.remove,
};
