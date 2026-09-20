import type { HomeTitlePosition } from '@/features/home/types/home';

export interface AdminHomeSettings {
  eyebrow?: string;
  title?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  titlePosition?: HomeTitlePosition;
  imagePath1?: string | null;
  imageUrl1?: string | null;
}

export type UpdateHomeSettingsInput = {
  eyebrow: string;
  title: string;
  imageSrc: string | null;
  imageAlt: string;
  titlePosition: HomeTitlePosition;
};
