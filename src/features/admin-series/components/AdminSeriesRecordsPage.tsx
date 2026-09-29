'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAdminMedia } from '@/features/admin-media';
import { useAdminSeries } from '../hooks/useAdminSeries';
import { useAdminSeriesRecords } from '../hooks/useAdminSeriesRecords';
import type { SeriesItem } from '../types/series';
import type { SeriesRecord } from '../types/series-record';

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function AdminSeriesRecordsPage() {
  const params = useParams();
  const seriesId = params.id as string;
  const { listSeries } = useAdminSeries();
  const { listBySeries, create, update, remove } = useAdminSeriesRecords();
  const { uploadMedia } = useAdminMedia();
  const [series, setSeries] = useState<SeriesItem | null>(null);
  const [records, setRecords] = useState<SeriesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SeriesRecord | null>(null);
  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([listSeries().then((res) => res.json()), listBySeries(seriesId).then((res) => res.json())])
      .then(([seriesList, recordList]) => {
        if (Array.isArray(seriesList)) setSeries(seriesList.find((item: SeriesItem) => String(item.id) === seriesId) || null);
        if (Array.isArray(recordList)) setRecords(recordList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => loadData(), [seriesId]);

  const openNewModal = () => {
    setEditing(null);
    setTitle('');
    setBodyText('');
    setEntryDate(today());
    setImageUrl('');
    setImagePath(null);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (record: SeriesRecord) => {
    setEditing(record);
    setTitle(record.title);
    setBodyText(record.bodyText || '');
    setEntryDate(record.entryDate);
    setImageUrl(record.imageUrl || '');
    setImagePath(record.imagePath || null);
    setMessage(null);
    setShowModal(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const response = await uploadMedia({ entity: 'series-record', id: editing ? editing.id : 'temp', file });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || data.error || 'No se pudo subir la imagen.');
      } else {
        setImageUrl(data.url);
        setImagePath(data.path);
      }
    } catch {
      setMessage('Error de red al subir la imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const input = {
      id: editing?.id,
      seriesId: Number(seriesId),
      title: title.trim(),
      bodyText: bodyText.trim(),
      entryDate,
      imagePath,
    };

    try {
      const response = editing ? await update(input) : await create(input);
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'No se pudo guardar el registro.');
      } else {
        setShowModal(false);
        loadData();
      }
    } catch {
      setMessage('Error de red al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: SeriesRecord) => {
    if (!confirm(`¿Seguro que deseas eliminar (soft delete) el registro "${record.title}"?`)) return;
    try {
      const response = await remove(record.id);
      if (response.ok) loadData();
      else alert('No se pudo eliminar el registro.');
    } catch {
      alert('Error de conexión.');
    }
  };

  if (loading) return <div className="p-4 text-ink-muted">Cargando Registros...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link href="/admin/series" className="text-xs font-mono text-accent hover:underline mb-2 inline-block">
            ← Volver al listado de Series
          </Link>
          <h1 className="font-serif-editorial text-3xl font-normal text-ink">
            Registros de la Serie: <span className="text-accent">{series?.title || 'Cargando...'}</span>
          </h1>
        </div>
        <button onClick={openNewModal} className="px-6 py-3 bg-accent text-accent-contrast font-medium text-sm rounded-lg hover:opacity-90 transition self-start sm:self-auto shadow-panel">
          + Nuevo Registro
        </button>
      </div>

      <div className="divide-y divide-line rounded border border-line bg-surface overflow-hidden">
        {records.length === 0 ? (
          <div className="p-12 text-center text-ink-muted text-sm space-y-3">
            <p>No hay registros en esta serie aún.</p>
            <button onClick={openNewModal} className="px-4 py-2 bg-surface-hover text-ink text-xs rounded border border-line hover:bg-line">
              Crear el primer registro
            </button>
          </div>
        ) : records.map((record) => (
          <div key={record.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-5 hover:bg-surface-hover/50 transition">
            <div className="flex items-start gap-4 min-w-0">
              {record.imageUrl ? (
                <img src={record.imageUrl} alt={record.title} className="h-24 w-24 object-cover rounded border border-line flex-shrink-0 bg-overlay/40" />
              ) : (
                <div className="h-24 w-24 rounded border border-dashed border-line flex items-center justify-center text-xs text-ink-muted flex-shrink-0">Sin foto</div>
              )}
              <div className="space-y-1 min-w-0">
                <div className="text-xs font-mono uppercase tracking-widest text-accent">{formatDate(record.entryDate)}</div>
                <h2 className="font-serif-editorial text-xl text-ink font-medium">{record.title}</h2>
                {record.bodyText && <p className="text-sm text-ink-muted line-clamp-2 whitespace-pre-line">{record.bodyText}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:pt-1">
              <button onClick={() => openEditModal(record)} className="px-4 py-2 bg-line/40 hover:bg-line text-ink text-xs font-medium rounded transition">Editar</button>
              <button onClick={() => handleDelete(record)} className="px-4 py-2 bg-danger/20 hover:bg-danger/40 text-danger text-xs font-medium rounded transition">Borrar</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-line bg-surface-raised p-6 shadow-modal space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="font-serif-editorial text-2xl text-ink">{editing ? 'Editar Registro' : 'Nuevo Registro'}</h3>
              <button onClick={() => setShowModal(false)} className="text-ink-muted hover:text-ink text-2xl p-2" aria-label="Cerrar">✕</button>
            </div>
            {message && <div className="p-3 bg-danger/20 border border-danger text-danger text-sm rounded">{message}</div>}
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-3 bg-canvas p-4 rounded-lg border border-line">
                <label className="block text-sm font-medium text-ink">Imagen del registro (opcional)</label>
                {imageUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={imageUrl} alt="Preview" className="h-28 w-28 object-cover rounded border border-line bg-overlay/40" />
                    <button type="button" onClick={() => { setImageUrl(''); setImagePath(null); }} className="text-xs text-danger hover:underline px-3 py-1.5 border border-danger/50 rounded bg-danger/20">Cambiar foto</button>
                  </div>
                ) : (
                  <input type="file" accept="image/*" capture="environment" disabled={uploading} onChange={(event) => { if (event.target.files?.[0]) handleFileUpload(event.target.files[0]); }} className="w-full text-sm text-ink-muted file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-contrast hover:file:opacity-90 cursor-pointer" />
                )}
                {uploading && <span className="text-xs text-accent block">Procesando y comprimiendo imagen...</span>}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Título *</label>
                <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} required className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Fecha del registro *</label>
                <input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required className="w-full rounded border border-line bg-canvas p-3 text-base text-ink font-mono focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Texto (opcional)</label>
                <textarea rows={7} value={bodyText} onChange={(event) => setBodyText(event.target.value)} className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-line">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-line text-ink-muted text-sm rounded hover:bg-surface-hover transition">Cancelar</button>
                <button type="submit" disabled={saving || uploading} className="px-8 py-3 bg-accent text-accent-contrast text-base font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-panel">{saving ? 'Guardando...' : 'Guardar Registro'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
