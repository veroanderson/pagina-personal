import 'server-only';
import { getManifesto } from '@/lib/db';
import type { HomeContent } from '../types/home';

const DEFAULT_HOME_CONTENT: HomeContent = {
  eyebrow: 'Vero Anderson · Artista visual',
  title: 'La contemplación del horizonte y la botánica de campo.',
  imageSrc: '/images/home.png',
  imageAlt: 'Obra pictórica de nenúfares sobre el agua',
};

export async function getHomeContent(): Promise<HomeContent> {
  try {
    const settings = await getManifesto();
    return { 
      ...DEFAULT_HOME_CONTENT, 
      eyebrow: settings.eyebrow || DEFAULT_HOME_CONTENT.eyebrow,
      title: settings.title || settings.statementText || DEFAULT_HOME_CONTENT.title,
      imageSrc: settings.imageSrc || settings.imageUrl1 || DEFAULT_HOME_CONTENT.imageSrc,
      imageAlt: settings.imageAlt || DEFAULT_HOME_CONTENT.imageAlt };
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}
