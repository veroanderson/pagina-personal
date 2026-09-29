export interface SeriesRecord {
  id: number;
  seriesId: number;
  title: string;
  bodyText?: string | null;
  imageUrl?: string;
  imagePath?: string | null;
  entryDate: string;
}

export type SeriesRecordInput = Omit<SeriesRecord, 'id' | 'imageUrl'> & {
  id?: number;
};
