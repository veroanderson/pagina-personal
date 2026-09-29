'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Artwork, Series } from '@/lib/db';

export default function SeriesDetailClient({ series, artworks }: { series: Series; artworks: Artwork[] }) {
  const router = useRouter();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const handleInquire = (artwork: Artwork) => {
    const encodedTitle = encodeURIComponent(artwork.title);
    router.push(`/contacto?artworkId=${artwork.id}&title=${encodedTitle}`);
  };

  return (
    <div className="max-w-6xl space-y-12 lg:space-y-16">
      <div className="space-y-4">
        <Link href="/series" className="text-xs font-mono uppercase tracking-widest text-accent hover:underline inline-block">← Volver a Series</Link>
        <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-ink font-normal leading-tight">{series.title}</h1>
        <div className="w-16 h-0.5 bg-accent/60" />
        {series.essayText && <p className="text-ink-muted text-base lg:text-lg font-light leading-relaxed max-w-3xl pt-2">{series.essayText}</p>}
      </div>

      <div className="divide-y divide-line border-t border-b border-line">
        {artworks.length === 0 ? <div className="py-12 text-center text-ink-muted text-sm font-mono">No hay obras registradas en esta serie aún.</div> : artworks.map((artwork) => (
          <div key={artwork.id} onClick={() => setSelectedArtwork(artwork)} className="py-8 lg:py-10 flex flex-col gap-4 cursor-pointer group hover:bg-surface-hover/40 transition">
            <h2 className="font-serif-editorial text-2xl lg:text-3xl text-ink font-normal group-hover:text-accent transition">{artwork.title}</h2>
            <div className="w-full flex flex-col gap-4">
              {artwork.imageUrl ? <div className="w-full overflow-hidden rounded border border-line bg-surface group-hover:border-accent/60 transition"><img src={artwork.imageUrl} alt={artwork.title} className="block w-full h-auto opacity-90 group-hover:opacity-100 transition duration-700" /></div> : <div className="w-full h-64 rounded border border-dashed border-line flex items-center justify-center text-xs font-mono text-ink-muted bg-surface">Sin imagen disponible</div>}
              <div className="flex items-center justify-end w-full gap-4 pt-2"><span className="text-xs font-mono uppercase tracking-widest text-accent group-hover:underline">Ver detalle ↗</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Link href={`/series/${series.slug}/registros`} className="inline-flex items-center gap-3 border border-line px-5 py-3 text-xs font-mono uppercase tracking-widest text-accent hover:bg-surface-hover transition">Ver registros <span aria-hidden="true">↗</span></Link>
      </div>

      {selectedArtwork && <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/85 p-4 lg:p-12 backdrop-blur-md overflow-y-auto" onClick={() => setSelectedArtwork(null)}>
        <div className="w-full max-w-4xl rounded-lg border border-line bg-surface-raised p-6 lg:p-10 shadow-modal space-y-8 my-auto relative" onClick={(event) => event.stopPropagation()}>
          <button onClick={() => setSelectedArtwork(null)} className="absolute top-4 right-4 text-ink-muted hover:text-ink text-3xl font-light p-2 transition" aria-label="Cerrar modal">✕</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="overflow-hidden rounded border border-line bg-overlay/50">{selectedArtwork.imageUrl ? <img src={selectedArtwork.imageUrl} alt={selectedArtwork.title} className="w-full h-auto max-h-[70vh] object-contain mx-auto" /> : <div className="h-64 flex items-center justify-center text-xs font-mono text-ink-muted">Sin imagen disponible</div>}</div>
            <div className="space-y-6">
              <div><span className="text-xs font-mono uppercase tracking-widest text-accent block mb-1">{series.title}</span><h3 className="font-serif-editorial text-3xl lg:text-4xl text-ink font-normal leading-tight">{selectedArtwork.title}</h3>{selectedArtwork.year && <span className="text-sm font-mono text-ink-muted tabular-nums block mt-1">Año {selectedArtwork.year}</span>}</div>
              <button onClick={() => handleInquire(selectedArtwork)} className="w-full py-4 px-6 bg-accent text-accent-contrast font-serif-editorial text-lg tracking-wide rounded hover:opacity-90 transition shadow-panel active:scale-98 flex items-center justify-center gap-3"><span>✉ Consultar sobre esta obra</span><span className="text-xs font-mono">→</span></button>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
