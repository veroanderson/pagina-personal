export interface AdminHomeSettings {
  eyebrow?: string;
  title?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  imagePath1?: string | null;
  imageUrl1?: string | null;
}

export type UpdateHomeSettingsInput = {
  eyebrow: string;
  title: string;
  imageSrc: string | null;
  imageAlt: string;
};
