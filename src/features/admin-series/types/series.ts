export interface SeriesItem {
  id: number;
  title: string;
  slug: string;
  essayText?: string;
  displayOrder: number;
  isActive: number;
}

export type SeriesInput = {
  id?: number;
  title: string;
  slug: string;
  essayText: string;
  displayOrder: number;
  isActive: boolean;
};
