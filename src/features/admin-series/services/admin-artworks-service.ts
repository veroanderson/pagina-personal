import { adminArtworksRepository } from '../infra/admin-artworks-repository';

export const adminArtworksService = {
  listArtworksBySeries: adminArtworksRepository.listBySeries,
  createArtwork: adminArtworksRepository.create,
  updateArtwork: adminArtworksRepository.update,
  removeArtwork: adminArtworksRepository.remove,
};
