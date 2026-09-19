'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SeriesItem {
  id: number;
  title: string;
  slug: string;
  essayText?: string;
  displayOrder: number;
  isActive: number;
}

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [essayText, setEssayText] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadSeries = () => {
    fetch('/api/admin/series')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSeriesList(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const openNewModal = () => {
    setEditingSeries(null);
    setTitle('');
    setSlug('');
    setEssayText('');
    setDisplayOrder(seriesList.length + 1);
    setIsActive(true);
    setMessage(null);
    setShowModal(true);
  };

  const openEditModal = (item: SeriesItem) => {
    setEditingSeries(item);
    setTitle(item.title);
    setSlug(item.slug);
    setEssayText(item.essayText || '');
    setDisplayOrder(item.displayOrder);
    setIsActive(item.isActive === 1);
    setMessage(null);
    setShowModal(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingSeries) {
      // Auto generate slug on create
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const method = editingSeries ? 'PUT' : 'POST';
    const bodyPayload = editingSeries
      ? { id: editingSeries.id, title, slug, essayText, displayOrder, isActive }
      : { title, slug, essayText, displayOrder, isActive };

    try {
      const res = await fetch('/api/admin/series', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        setShowModal(false);
        loadSeries();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Error al guardar la serie.');
      }
    } catch (err) {
      setMessage('Error de red al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`¿Seguro que deseas eliminar (soft delete) la serie "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/series?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadSeries();
      } else {
        alert('Error al eliminar la serie.');
      }
    } catch (err) {
      alert('Error de conexión.');
    }
  };

  if (loading) {
    return <div className="p-4 text-ink-muted">Cargando Series...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-serif-editorial text-3xl font-normal text-ink">
            Series (Colecciones Temáticas)
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Administrá las colecciones artísticas de Vero Anderson.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-5 py-2.5 bg-accent text-accent-contrast font-medium text-sm rounded hover:opacity-90 transition self-start sm:self-auto"
        >
          + Nueva Serie
        </button>
      </div>

      {/* Series list */}
      <div className="divide-y divide-line rounded border border-line bg-surface overflow-hidden">
        {seriesList.length === 0 ? (
          <div className="p-8 text-center text-ink-muted text-sm">
            No hay series registradas. Creá la primera con el botón "+ Nueva Serie".
          </div>
        ) : (
          seriesList.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover/50 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-serif-editorial text-xl text-ink font-medium">
                    {item.title}
                  </span>
                  {item.isActive === 0 && (
                    <span className="text-xs font-mono uppercase bg-warning/15 text-warning border border-warning/40 px-2 py-0.5 rounded">
                      Oculta (Inactiva)
                    </span>
                  )}
                  <span className="text-xs text-ink-muted font-mono tabular-nums">
                    Orden: {item.displayOrder}
                  </span>
                </div>

                <div className="text-xs font-mono text-accent">
                  /series/{item.slug}
                </div>

                {item.essayText && (
                  <p className="text-sm text-ink-muted line-clamp-2 mt-1">
                    {item.essayText}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-line/40">
                <Link
                  href={`/admin/series/${item.id}/obras`}
                  className="px-3 py-1.5 bg-line/60 hover:bg-line text-ink text-xs font-medium rounded transition"
                >
                  Obras ↗
                </Link>
                <button
                  onClick={() => openEditModal(item)}
                  className="px-3 py-1.5 bg-line/40 hover:bg-line text-ink text-xs font-medium rounded transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="px-3 py-1.5 bg-danger/20 hover:bg-danger/40 text-danger text-xs font-medium rounded transition"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-lg border border-line bg-surface-raised p-6 shadow-modal space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="font-serif-editorial text-2xl text-ink">
                {editingSeries ? 'Editar Serie' : 'Nueva Serie'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-muted hover:text-ink text-xl"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className="p-3 bg-danger/20 border border-danger text-danger text-sm rounded">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Título de la Serie *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none"
                  placeholder="Ej: Botánica de Campo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Slug de la URL *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded border border-line bg-canvas p-3 text-base text-ink font-mono focus:border-accent focus:outline-none"
                  placeholder="botanica-de-campo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Ensayo / Descripción de la Serie (Opcional)
                </label>
                <textarea
                  rows={5}
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full rounded border border-line bg-canvas p-3 text-base text-ink focus:border-accent focus:outline-none"
                  placeholder="Texto descriptivo o ensayo teórico de este conjunto..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full rounded border border-line bg-canvas p-3 text-base text-ink font-mono tabular-nums focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer pb-3">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-5 w-5 rounded border-line bg-canvas text-accent focus:ring-0"
                    />
                    <span className="text-sm font-medium text-ink">
                      Serie Activa (Visible)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-line">
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
                  className="px-6 py-2 bg-accent text-accent-contrast text-sm font-medium rounded hover:opacity-90 transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Serie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
