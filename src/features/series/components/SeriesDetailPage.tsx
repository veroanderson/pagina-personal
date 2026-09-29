import PublicLayout from '@/components/PublicLayout';
import { notFound } from 'next/navigation';
import { seriesService } from '../services/series-service';
import SeriesDetailClient from './SeriesDetailClient';

export default async function SeriesDetailPage({ params }: { params: { slug: string } }) {
  const series = await seriesService.getBySlug(params.slug);
  if (!series) notFound();
  const artworks = await seriesService.listArtworks(series.id);
  return <PublicLayout><SeriesDetailClient series={series} artworks={artworks} /></PublicLayout>;
}
