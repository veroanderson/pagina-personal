'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Artwork {
  id: number;
  seriesId: number;
  title: string;
  year?: string | null;
  technique: string;
  heightCm?: number | null;
  widthCm?: number | null;
  availability: 'disponible' | 'coleccion_privada' | 'no_disponible';
  imageUrl?: string | null;
  microstory?: string | null;
  displayOrder: number;
}

interface Series {
  id: number;
  title: string;
  slug: string;
  essayText?: string | null;
  displayOrder: number;
}

export default function SeriesDetailClient({ series, artworks }: { series: Series; artworks: Artwork[] }) {
  const router = useRouter();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const handleInquire = (artwork: Artwork) => {
    const encodedTitle = encodeURIComponent(artwork.title);
    const encodedTech = encodeURIComponent(`${artwork.technique}${artwork.year ? ` (${artwork.year})` : ''}`);
    router.push(`/contacto?artworkId=${artwork.id}&title=${encodedTitle}&tech=${encodedTech}`);
  };

  return (
    <div className="max-w-5xl space-y-12 lg:space-y-16">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/series" className="text-xs font-mono uppercase tracking-widest text-patagonia-accent hover:underline inline-block">
          ← Volver a Series
        </Link>
        <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-patagonia-fg font-normal leading-tight">
          {series.title}
        </h1>
        <div className="w-16 h-0.5 bg-patagonia-accent/60"></div>

        {series.essayText && (
          <p className="text-patagonia-muted text-base lg:text-lg font-light leading-relaxed max-w-3xl pt-2">
            {series.essayText}
          </p>
        )}
      </div>

      {/* Artworks List Layout (Divider Grid Panel - no floating cards) */}
      <div className="divide-y divide-patagonia-border border-t border-b border-patagonia-border">
        {artworks.length === 0 ? (
          <div className="py-12 text-center text-patagonia-muted text-sm font-mono">
            No hay obras registradas en esta serie aún.
          </div>
        ) : (
          artworks.map((artwork) => (
            <div
              key={artwork.id}
              onClick={() => setSelectedArtwork(artwork)}
              className="py-8 lg:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer group hover:bg-patagonia-hover/40 transition px-2 lg:px-4"
            >
              {/* Artwork Image (Full width on mobile, 250px on desktop) */}
              {artwork.imageUrl ? (
                <div className="w-full md:w-64 h-64 md:h-44 overflow-hidden rounded border border-patagonia-border bg-patagonia-panel flex-shrink-0 group-hover:border-patagonia-accent/60 transition">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100"
                  />
                </div>
              ) : (
                <div className="w-full md:w-64 h-64 md:h-44 rounded border border-dashed border-patagonia-border flex items-center justify-center text-xs font-mono text-patagonia-muted bg-patagonia-panel">
                  Sin imagen disponible
                </div>
              )}

              {/* Artwork Metadata */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-serif-editorial text-2xl lg:text-3xl text-patagonia-fg font-normal group-hover:text-patagonia-accent transition">
                    {artwork.title}
                  </h2>
                  {artwork.year && (
                    <span className="text-sm font-mono text-patagonia-muted tabular-nums">
                      ({artwork.year})
                    </span>
                  )}
                </div>

                <div className="text-sm text-patagonia-muted font-light">
                  {artwork.technique}
                  {(artwork.heightCm || artwork.widthCm) && (
                    <span className="font-mono tabular-nums text-xs ml-3 text-patagonia-muted/80">
                      • {artwork.heightCm || '?'} × {artwork.widthCm || '?'} cm
                    </span>
                  )}
                </div>

                {artwork.microstory && (
                  <p className="text-xs lg:text-sm font-serif-editorial italic text-patagonia-fg/70 line-clamp-2 pt-1">
                    "{artwork.microstory}"
                  </p>
                )}
              </div>

              {/* Availability Badge & Click CTA */}
              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-patagonia-border/40">
                <span
                  className={`text-xs px-3 py-1 rounded font-mono uppercase tracking-wider border ${
                    artwork.availability === 'disponible'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                      : artwork.availability === 'coleccion_privada'
                      ? 'bg-patagonia-bordo/20 text-red-300 border-patagonia-bordo/40'
                      : 'bg-gray-900 text-gray-400 border-gray-800'
                  }`}
                >
                  {artwork.availability.replace('_', ' ')}
                </span>

                <span className="text-xs font-mono uppercase tracking-widest text-patagonia-accent group-hover:underline">
                  Ver detalle ↗
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PRODUCTION-READY LIGHTBOX / MODAL */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 lg:p-12 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="w-full max-w-4xl rounded-lg border border-patagonia-border bg-patagonia-panel p-6 lg:p-10 shadow-2xl space-y-8 my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 text-patagonia-muted hover:text-patagonia-fg text-3xl font-light p-2 transition"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Artwork High Res Image */}
              <div className="overflow-hidden rounded border border-patagonia-border bg-black/50">
                {selectedArtwork.imageUrl ? (
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-xs font-mono text-patagonia-muted">
                    Sin imagen disponible
                  </div>
                )}
              </div>

              {/* Artwork Info & Inquire Action */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-patagonia-accent block mb-1">
                    {series.title}
                  </span>
                  <h3 className="font-serif-editorial text-3xl lg:text-4xl text-patagonia-fg font-normal leading-tight">
                    {selectedArtwork.title}
                  </h3>
                  {selectedArtwork.year && (
                    <span className="text-sm font-mono text-patagonia-muted tabular-nums block mt-1">
                      Año {selectedArtwork.year}
                    </span>
                  )}
                </div>

                <div className="space-y-2 border-t border-b border-patagonia-border py-4 text-sm font-light text-patagonia-fg/90">
                  <div>
                    <span className="font-mono text-xs uppercase text-patagonia-muted block">Técnica y Soporte</span>
                    {selectedArtwork.technique}
                  </div>

                  {(selectedArtwork.heightCm || selectedArtwork.widthCm) && (
                    <div>
                      <span className="font-mono text-xs uppercase text-patagonia-muted block">Dimensiones</span>
                      <span className="font-mono tabular-nums">
                        {selectedArtwork.heightCm || '?'} cm (alto) × {selectedArtwork.widthCm || '?'} cm (ancho)
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="font-mono text-xs uppercase text-patagonia-muted block">Estado</span>
                    <span
                      className={`inline-block mt-1 text-xs px-2.5 py-0.5 rounded font-mono uppercase border ${
                        selectedArtwork.availability === 'disponible'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                          : selectedArtwork.availability === 'coleccion_privada'
                          ? 'bg-patagonia-bordo/20 text-red-300 border-patagonia-bordo/40'
                          : 'bg-gray-900 text-gray-400 border-gray-800'
                      }`}
                    >
                      {selectedArtwork.availability.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {selectedArtwork.microstory && (
                  <div className="space-y-1">
                    <span className="font-mono text-xs uppercase tracking-wider text-patagonia-accent block">
                      Microrrelato / Diario de Proceso
                    </span>
                    <p className="font-serif-editorial text-lg italic text-patagonia-fg/90 leading-relaxed">
                      "{selectedArtwork.microstory}"
                    </p>
                  </div>
                )}

                {/* PRODUCTION-READY ACTION BUTTON */}
                <div className="pt-2">
                  <button
                    onClick={() => handleInquire(selectedArtwork)}
                    className="w-full py-4 px-6 bg-patagonia-accent text-white font-serif-editorial text-lg tracking-wide rounded hover:opacity-90 transition shadow-lg active:scale-98 flex items-center justify-center gap-3"
                  >
                    <span>✉ Consultar sobre esta obra</span>
                    <span className="text-xs font-mono">→</span>
                  </button>
                  <p className="text-xs font-mono text-patagonia-muted text-center mt-2">
                    Pre-completa la consulta en la sección de contacto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
