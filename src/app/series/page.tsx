import PublicLayout from '@/components/PublicLayout';
import { getSeries, getArtworksBySeries } from '@/lib/db';
import Link from 'next/link';

export const revalidate = 0;

export default async function SeriesListPage() {
  const seriesList = await getSeries(false); // Only active series
  const seriesWithArtworks = await Promise.all(
    seriesList.map(async (series) => ({ series, artworks: await getArtworksBySeries(series.id) })),
  );

  return (
    <PublicLayout>
      <div className="max-w-4xl space-y-10 lg:space-y-14">
        {/* Page Title */}
        <div className="space-y-3">
          <span className="text-xs uppercase font-mono tracking-widest text-patagonia-accent">
            Colecciones Temáticas
          </span>
          <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-patagonia-fg font-normal leading-tight">
            Series
          </h1>
          <p className="text-patagonia-muted text-base font-light">
            Conjuntos de acuarelas, óleos y bitácoras de campo estructurados por investigación conceptual.
          </p>
        </div>

        {/* Divider Grid Layout (no shadow cards) */}
        <div className="divide-y divide-patagonia-border border-t border-b border-patagonia-border">
          {seriesList.length === 0 ? (
            <div className="py-12 text-center text-patagonia-muted text-sm font-mono">
              No hay series publicadas en este momento.
            </div>
          ) : (
            seriesWithArtworks.map(({ series, artworks }) => {
              const previewArtwork = artworks.find((a) => a.imageUrl) || artworks[0];

              return (
                <div
                  key={series.id}
                  className="py-8 lg:py-12 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:bg-patagonia-hover/30 transition px-2 lg:px-4"
                >
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-patagonia-muted tabular-nums">
                        SERIE #{series.displayOrder || series.id}
                      </span>
                      <span className="text-xs font-mono text-patagonia-accent">
                        • {artworks.length} {artworks.length === 1 ? 'pieza' : 'piezas'}
                      </span>
                    </div>

                    <Link href={`/series/${series.slug}`} className="block group-hover:text-patagonia-accent transition">
                      <h2 className="font-serif-editorial text-2xl lg:text-4xl text-patagonia-fg font-normal group-hover:underline">
                        {series.title}
                      </h2>
                    </Link>

                    {series.essayText && (
                      <p className="text-sm lg:text-base text-patagonia-muted font-light line-clamp-3 leading-relaxed">
                        {series.essayText}
                      </p>
                    )}

                    <div className="pt-2">
                      <Link
                        href={`/series/${series.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-patagonia-accent hover:text-white transition"
                      >
                        <span>Explorar serie</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>

                  {/* Series Thumbnail Preview */}
                  {previewArtwork?.imageUrl && (
                    <Link
                      href={`/series/${series.slug}`}
                      className="w-full md:w-64 h-48 lg:h-56 overflow-hidden rounded border border-patagonia-border bg-patagonia-panel flex-shrink-0 group-hover:border-patagonia-accent/60 transition"
                    >
                      <img
                        src={previewArtwork.imageUrl}
                        alt={series.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100"
                      />
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
