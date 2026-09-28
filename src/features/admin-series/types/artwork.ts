export interface Artwork {
  id: number;
  seriesId: number;
  title: string;
  year?: string;
  imageUrl?: string;
  imagePath?: string | null;
  displayOrder: number;
}

export type ArtworkInput = Omit<Artwork, 'id' | 'imageUrl' | 'displayOrder'> & {
  id?: number;
  displayOrder?: number;
};
