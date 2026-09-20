export type ArtworkAvailability = 'disponible' | 'coleccion_privada' | 'no_disponible';

export interface Artwork {
  id: number;
  seriesId: number;
  title: string;
  year?: string;
  technique: string;
  heightCm?: number;
  widthCm?: number;
  availability: ArtworkAvailability;
  imageUrl?: string;
  imagePath?: string | null;
  microstory?: string;
  displayOrder: number;
}

export type ArtworkInput = Omit<Artwork, 'id' | 'imageUrl'> & {
  id?: number;
};
