'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { useAdminMedia } from '@/features/admin-media';
import { useAdminArtworks } from '../hooks/useAdminArtworks';
import { useAdminSeries } from '../hooks/useAdminSeries';
import type { Artwork } from '../types/artwork';
import type { SeriesItem } from '../types/series';

function moveArtwork<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function SortableArtworkCard({
  item,
  index,
  onEdit,
  onDelete,
}: {
  item: Artwork;
  index: number;
  onEdit: (item: Artwork) => void;
  onDelete: (id: number, title: string) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: item.id, index });

  return (
    <div
      ref={ref}
      className={`p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-hover/50 transition ${isDragging ? 'opacity-60 shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-4">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Reordenar obra ${index + 1}`}
          className="cursor-grab rounded border border-line px-2 py-1 text-lg text-ink-muted hover:text-ink active:cursor-grabbing"
        >
          ⋮⋮
        </button>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-24 w-24 object-cover rounded border border-line flex-shrink-0 bg-overlay/40"
          />
        ) : (
          <div className="h-24 w-24 rounded border border-dashed border-line flex items-center justify-center text-xs text-ink-muted flex-shrink-0">
            Sin foto
          </div>
        )}

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-serif-editorial text-xl text-ink font-medium">
              {item.title}
            </span>
            {item.year && (
              <span className="text-xs font-mono text-ink-muted tabular-nums">
                ({item.year})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-line/40 justify-end">
        <button
          onClick={() => onEdit(item)}
          className="px-4 py-2 bg-line/40 hover:bg-line text-ink text-xs font-medium rounded transition"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(item.id, item.title)}
          className="px-4 py-2 bg-danger/20 hover:bg-danger/40 text-danger text-xs font-medium rounded transition"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}

export default function AdminSeriesArtworksPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;
  const { listSeries } = useAdminSeries();
  const { createArtwork, listArtworksBySeries, removeArtwork, updateArtwork, reorderArtworks } = useAdminArtworks();
  const { uploadMedia } = useAdminMedia();

  const [series, setSeries] = useState<SeriesItem | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    // Load series info & artworks
    Promise.all([
      listSeries().then((r) => r.json()),
      listArtworksBySeries(seriesId).then((r) => r.json()),
    ])
      .then(([allSeries, artworkList]) => {
        if (Array.isArray(allSeries)) {
          const s = allSeries.find((item: any) => String(item.id) === seriesId);
          setSeries(s || null);
        }
        if (Array.isArray(artworkList)) setArtworks(artworkList);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [seriesId]);

  const openNewModal = () => {
    setEditingArtwork(null);
    setTitle('');
    setYear('');
    setImageUrl('');
    setImagePath(null);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (item: Artwork) => {
    setEditingArtwork(item);
    setTitle(item.title || '');
    setYear(item.year || '');
    setImageUrl(item.imageUrl || '');
    setImagePath(item.imagePath || null);
    setMessage(null);
    setShowModal(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);

    try {
      const res = await uploadMedia({
        entity: 'artwork',
        id: editingArtwork ? editingArtwork.id : 'temp',
        file,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        setImagePath(data.path);
      } else {
        const err = await res.json();
        setMessage(err.message || err.error || 'Error al subir imagen de la obra.');
      }
    } catch (err) {
      setMessage('Error de red al subir imagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      id: editingArtwork ? editingArtwork.id : undefined,
      seriesId: Number(seriesId),
      title: title || 'Sin título',
      year: year || undefined,
      imagePath: imagePath || null,
    };

    try {
      const res = editingArtwork
        ? await updateArtwork(payload)
        : await createArtwork(payload);

      if (res.ok) {
        setShowModal(false);
        loadData();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Error al guardar la obra.');
      }
    } catch (err) {
      setMessage('Error de red al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Seguro que deseas eliminar (soft delete) la obra "${title}"?`)) return;

    try {
      const res = await removeArtwork(id);
      if (res.ok) {
        loadData();
      } else {
        alert('Error al eliminar la obra.');
      }
    } catch (err) {
      alert('Error de conexión.');
    }
  };

  const handleDragEnd = async (event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0]) => {
    if (event.canceled || !isSortable(event.operation.source)) return;
    const { initialIndex, index } = event.operation.source;
    if (initialIndex === index) return;

    const previous = artworks;
    const next = moveArtwork(previous, initialIndex, index);
    setArtworks(next);
    setMessage(null);

    try {
      const response = await reorderArtworks(Number(seriesId), next.map((item) => item.id));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el orden.');
      setMessage('Orden actualizado correctamente.');
    } catch (error) {
      setArtworks(previous);
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el orden.');
    }
  };

  if (loading) {
    return <div className="p-4 text-ink-muted">Cargando Obras...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <Link
            href="/admin/series"
            className="text-xs font-mono text-accent hover:underline mb-2 inline-block"
          >
            ← Volver al listado de Series
          </Link>
          <h1 className="font-serif-editorial text-3xl font-normal text-ink">
            Obras de la Serie: <span className="text-accent">{series?.title || 'Cargando...'}</span>
          </h1>
        </div>

        <button
          onClick={openNewModal}
          className="px-6 py-3 bg-accent text-accent-contrast font-medium text-sm rounded-lg hover:opacity-90 transition self-start sm:self-auto shadow-panel active:scale-95"
        >
          + Cargar Nueva Obra
        </button>
      </div>

      {/* Artworks List */}
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="divide-y divide-line rounded border border-line bg-surface overflow-hidden">
        {artworks.length === 0 ? (
          <div className="p-12 text-center text-ink-muted text-sm space-y-3">
            <p>No hay obras registradas en esta serie aún.</p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-surface-hover text-ink text-xs rounded border border-line hover:bg-line"
            >
              Cargar la primera obra desde el celular o cámara
            </button>
          </div>
        ) : (
          artworks.map((item, index) => (
            <SortableArtworkCard
              key={item.id}
              item={item}
              index={index}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))
        )}
        </div>
      </DragDropProvider>

      {/* Touch-optimized Modal for mobile photo capture & creation */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-xl border border-line bg-surface-raised p-6 shadow-modal space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="font-serif-editorial text-2xl text-ink">
                {editingArtwork ? 'Editar Obra' : 'Cargar Nueva Obra'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-muted hover:text-ink text-2xl p-2"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className="p-3 bg-danger/20 border border-danger text-danger text-sm rounded">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Photo Upload area optimized for Mobile Camera thumb */}
              <div className="space-y-3 bg-canvas p-4 rounded-lg border border-line">
                <label className="block text-sm font-medium text-ink">
                  Imagen de la Obra (Foto directa desde cámara o galería)
                </label>

                {imageUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-28 w-28 object-cover rounded border border-line bg-overlay/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImagePath(null);
                      }}
                      className="text-xs text-danger hover:underline px-3 py-1.5 border border-danger/50 rounded bg-danger/20"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      // @ts-ignore
                      capture="environment"
                      disabled={uploading}
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                      }}
                      className="w-full text-sm text-ink-muted file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-contrast hover:file:opacity-90 cursor-pointer"
                    />
                    <p className="text-xs text-ink-muted">
                      💡 En celular se abrirá la cámara de fotos directamente.
                    </p>
                  </div>
                )}
                {uploading && <span className="text-xs text-accent block">Procesando y comprimiendo imagen...</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Título de la Obra *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none"
                    placeholder="Ej: Contemplación de Campo I"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Año de creación
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded border border-line bg-canvas p-3 text-base text-ink font-mono tabular-nums focus:border-accent focus:outline-none"
                    placeholder="Ej: 2023 o 2022–2023"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end border-t border-line">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-line text-ink-muted text-sm rounded hover:bg-surface-hover transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-accent text-accent-contrast text-base font-medium rounded-lg hover:opacity-90 transition disabled:opacity-50 shadow-panel"
                  >
                    {saving ? 'Guardando...' : 'Guardar Obra'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
