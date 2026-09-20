import PublicLayout from '@/components/PublicLayout';
import { homeService } from '../services/home-service';

import { HomeHero } from './HomeHero';

export default async function HomePage() {
  const content = await homeService.getContent();
  return (
    <PublicLayout fullBleed>
      <HomeHero content={content} />
    </PublicLayout>
  );
}
