export type HomeTitlePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface HomeContent {
  eyebrow: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  titlePosition: HomeTitlePosition;
}
