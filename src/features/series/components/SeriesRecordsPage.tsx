import Link from 'next/link';
import PublicLayout from '@/components/PublicLayout';
import { notFound } from 'next/navigation';
import { seriesService } from '../services/series-service';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export default async function SeriesRecordsPage({ params }: { params: { slug: string } }) {
  const series = await seriesService.getBySlug(params.slug);
  if (!series) notFound();
  const records = await seriesService.listRecords(series.id);
  return (
    <PublicLayout>
      <div className="max-w-5xl space-y-12 lg:space-y-16">
        <div className="space-y-4">
          <Link href="/series" className="text-xs font-mono uppercase tracking-widest text-accent hover:underline inline-block">← Volver a Series</Link>
          <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-ink font-normal leading-tight">{series.title}</h1>
          <div className="w-16 h-0.5 bg-accent/60" />
          {series.essayText && <p className="text-ink-muted text-base lg:text-lg font-light leading-relaxed max-w-3xl pt-2">{series.essayText}</p>}
        </div>
        <section aria-labelledby="records-heading" className="space-y-6">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 id="records-heading" className="font-serif-editorial text-2xl lg:text-3xl text-ink font-normal">Registros</h2>
            <span className="text-xs font-mono uppercase tracking-widest text-ink-muted">{records.length} registros</span>
          </div>
          {records.length === 0 ? <div className="py-12 text-center text-ink-muted text-sm font-mono border-y border-line">Todavía no hay registros en esta serie.</div> : <div className="space-y-4">{records.map((record) => <article key={record.id} className="border border-line bg-surface rounded-lg overflow-hidden p-5 sm:p-6 space-y-4"><div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2"><h3 className="font-serif-editorial text-2xl text-ink font-normal">{record.title}</h3><time dateTime={record.entryDate} className="text-xs font-mono uppercase tracking-widest text-accent whitespace-nowrap">{formatDate(record.entryDate)}</time></div>{record.bodyText && <p className="text-sm lg:text-base text-ink-muted font-light leading-relaxed whitespace-pre-line">{record.bodyText}</p>}{record.imageUrl && <div className="rounded border border-line bg-canvas overflow-hidden"><img src={record.imageUrl} alt={record.title} className="block w-full h-auto" /></div>}</article>)}</div>}
        </section>
        <Link href={`/series/${series.slug}`} className="inline-flex items-center gap-3 border border-line px-5 py-3 text-xs font-mono uppercase tracking-widest text-accent hover:bg-surface-hover transition">Ver Obras <span aria-hidden="true">↗</span></Link>
      </div>
    </PublicLayout>
  );
}
