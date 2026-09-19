import PublicLayout from '@/components/PublicLayout';
import { getSeriesBySlug, getArtworksBySeries } from '@/lib/db';
import { notFound } from 'next/navigation';
import SeriesDetailClient from './SeriesDetailClient';

export const revalidate = 0;

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await getSeriesBySlug(params.slug);

  if (!series) {
    notFound();
  }

  const artworks = await getArtworksBySeries(series.id);

  return (
    <PublicLayout>
      <SeriesDetailClient series={series} artworks={artworks} />
    </PublicLayout>
  );
}
