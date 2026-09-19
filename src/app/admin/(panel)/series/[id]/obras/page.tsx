'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Artwork {
  id: number;
  seriesId: number;
  title: string;
  year?: string;
  technique: string;
  heightCm?: number;
  widthCm?: number;
  availability: 'disponible' | 'coleccion_privada' | 'no_disponible';
  imageUrl?: string;
  imagePath?: string | null;
  microstory?: string;
  displayOrder: number;
}

interface SeriesItem {
  id: number;
  title: string;
}

export default function AdminSeriesArtworksPage() {
  const params = useParams();
  const router = useRouter();
  const seriesId = params.id as string;

  const [series, setSeries] = useState<SeriesItem | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [technique, setTechnique] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [availability, setAvailability] = useState<'disponible' | 'coleccion_privada' | 'no_disponible'>('disponible');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [microstory, setMicrostory] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = () => {
    // Load series info & artworks
    Promise.all([
      fetch(`/api/admin/series`).then((r) => r.json()),
      fetch(`/api/admin/artworks?seriesId=${seriesId}`).then((r) => r.json()),
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
    setTechnique('Acuarela sobre papel de algodón 300g');
    setHeightCm('');
    setWidthCm('');
    setAvailability('disponible');
    setImageUrl('');
    setImagePath(null);
    setMicrostory('');
    setDisplayOrder(artworks.length + 1);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (item: Artwork) => {
    setEditingArtwork(item);
    setTitle(item.title || '');
    setYear(item.year || '');
    setTechnique(item.technique || '');
    setHeightCm(item.heightCm ? String(item.heightCm) : '');
    setWidthCm(item.widthCm ? String(item.widthCm) : '');
    setAvailability(item.availability);
    setImageUrl(item.imageUrl || '');
    setImagePath(item.imagePath || null);
    setMicrostory(item.microstory || '');
    setDisplayOrder(item.displayOrder);
    setMessage(null);
    setShowModal(true);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/admin/upload?entity=artwork&id=${editingArtwork ? editingArtwork.id : 'temp'}`, {
        method: 'POST',
        body: formData,
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
      technique,
      heightCm: heightCm ? Number(heightCm) : undefined,
      widthCm: widthCm ? Number(widthCm) : undefined,
      availability,
      imagePath: imagePath || null,
      microstory: microstory || undefined,
      displayOrder: Number(displayOrder) || 0,
    };

    const method = editingArtwork ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/admin/artworks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

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
      const res = await fetch(`/api/admin/artworks?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      } else {
        alert('Error al eliminar la obra.');
      }
    } catch (err) {
      alert('Error de conexión.');
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
          artworks.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-hover/50 transition"
            >
              <div className="flex items-start gap-4">
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
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono uppercase border ${
                        item.availability === 'disponible'
                          ? 'bg-success/15 text-success border-success/40'
                          : item.availability === 'coleccion_privada'
                          ? 'bg-danger/20 text-danger border-danger/40'
                          : 'bg-surface-hover text-ink-muted border-line'
                      }`}
                    >
                      {item.availability.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-ink-muted">
                    {item.technique}
                    {(item.heightCm || item.widthCm) && (
                      <span className="font-mono tabular-nums text-xs ml-2">
                        • {item.heightCm || '?'} × {item.widthCm || '?'} cm
                      </span>
                    )}
                  </p>

                  {item.microstory && (
                    <p className="text-xs italic text-ink-muted/80 line-clamp-2 mt-1">
                      "{item.microstory}"
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-line/40 justify-end">
                <button
                  onClick={() => openEditModal(item)}
                  className="px-4 py-2 bg-line/40 hover:bg-line text-ink text-xs font-medium rounded transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="px-4 py-2 bg-danger/20 hover:bg-danger/40 text-danger text-xs font-medium rounded transition"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Técnica y Soporte *
                </label>
                <input
                  type="text"
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none"
                  placeholder="Ej: Acuarela sobre papel de algodón 300g"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Alto (cm)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full rounded border border-line bg-canvas p-3 text-base text-ink font-mono tabular-nums focus:border-accent focus:outline-none"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Ancho (cm)
                  </label>
                  <input
                    type="number"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    className="w-full rounded border border-line bg-canvas p-3 text-base text-ink font-mono tabular-nums focus:border-accent focus:outline-none"
                    placeholder="40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink mb-1">
                    Disponibilidad
                  </label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value as any)}
                    className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="coleccion_privada">Colección Privada</option>
                    <option value="no_disponible">No Disponible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Microrrelato / Diario de Proceso (Opcional)
                </label>
                <textarea
                  rows={4}
                  value={microstory}
                  onChange={(e) => setMicrostory(e.target.value)}
                  className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none"
                  placeholder="Pequeño poema o reflexión íntima sobre este cuadro..."
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-line">
                <div className="w-1/3">
                  <label className="block text-xs font-medium text-ink mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full rounded border border-line bg-canvas p-2 text-sm text-ink font-mono tabular-nums"
                  />
                </div>

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
