import { adminSeriesRepository } from '../infra/admin-series-repository';

export const adminSeriesService = {
  listSeries: adminSeriesRepository.list,
  createSeries: adminSeriesRepository.create,
  updateSeries: adminSeriesRepository.update,
  removeSeries: adminSeriesRepository.remove,
};
