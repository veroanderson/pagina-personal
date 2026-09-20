'use client';

import { useEffect, useState } from 'react';
import { useAdminMedia } from '@/features/admin-media';
import { useAdminHome } from '../hooks/useAdminHome';
import type { HomeTitlePosition } from '@/features/home/types/home';

export default function AdminHomePage() {
  const { getHomeSettings, updateHomeSettings } = useAdminHome();
  const { uploadMedia } = useAdminMedia();
  const [eyebrow, setEyebrow] = useState('');
  const [title, setTitle] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [titlePosition, setTitlePosition] = useState<HomeTitlePosition>('top-left');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getHomeSettings()
      .then((res) => res.json())
      .then((data) => {
        setEyebrow(data?.eyebrow || '');
        setTitle(data?.title || data?.statementText || '');
        setImageSrc(data?.imageSrc || data?.imageUrl1 || null);
        setImageAlt(data?.imageAlt || '');
        setTitlePosition(data?.titlePosition || 'top-left');
        setImagePath(data?.imagePath1 || null);
        setImageUrl(data?.imageUrl1 || null);
      })
      .catch(() => setMessage({ type: 'error', text: 'No se pudo cargar la configuración de inicio.' }))
      .finally(() => setLoading(false));
  }, [getHomeSettings]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await updateHomeSettings({ eyebrow, title, imageSrc: imagePath || imageSrc, imageAlt, titlePosition });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'No se pudo guardar la configuración de inicio.');
      }
      setMessage({ type: 'success', text: 'Configuración de inicio guardada correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error de red al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const response = await uploadMedia({ entity: 'home', id: 1, file });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'No se pudo subir la imagen.');
      setImagePath(data.path);
      setImageSrc(data.path);
      setImageUrl(data.url);
      setMessage({ type: 'success', text: 'Imagen hero subida correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al subir la imagen.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-4 text-ink-muted">Cargando configuración de Inicio...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-serif-editorial text-3xl font-normal text-ink">Configuración de Inicio</h1>
      </div>

      {message && (
        <div className={`rounded border p-4 text-sm ${message.type === 'success' ? 'border-accent bg-accent/10 text-accent' : 'border-danger bg-danger/10 text-danger'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Título</label>
          <textarea
            rows={4}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded border border-line bg-surface p-4 text-base text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            placeholder="Escribí el texto que acompaña la imagen hero..."
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Antetítulo</label>
            <input value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} className="w-full rounded border border-line bg-surface p-3 text-base text-ink focus:border-accent focus:outline-none" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Texto alternativo de la imagen (Accesibilidad)</label>
            <input value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} className="w-full rounded border border-line bg-surface p-3 text-base text-ink focus:border-accent focus:outline-none" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Posición del título</label>
            <select value={titlePosition} onChange={(event) => setTitlePosition(event.target.value as HomeTitlePosition)} className="w-full rounded border border-line bg-surface p-3 text-base text-ink focus:border-accent focus:outline-none">
              <option value="top-left">Arriba a la izquierda</option>
              <option value="top-right">Arriba a la derecha</option>
              <option value="bottom-left">Abajo a la izquierda</option>
              <option value="bottom-right">Abajo a la derecha</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-6">
          <label className="block text-sm font-medium text-ink">Imagen de inicio</label>
          {imageUrl ? (
            <div className="space-y-2">
              <img src={imageUrl} alt={imageAlt} className="h-72 w-full rounded border border-line object-cover" />
              <button type="button" onClick={() => { setImageUrl(null); setImagePath(null); setImageSrc(null); }} className="text-xs text-danger hover:underline">
                Quitar imagen
              </button>
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded border border-dashed border-line text-xs text-ink-muted">Sin imagen seleccionada</div>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(event) => { if (event.target.files?.[0]) void handleImageUpload(event.target.files[0]); }}
            className="text-xs text-ink-muted file:mr-3 file:rounded file:border-0 file:bg-surface-hover file:px-4 file:py-2 file:text-xs file:text-ink hover:file:bg-line"
          />
          {uploading && <span className="text-xs text-accent">Subiendo...</span>}
        </div>

        <button type="submit" disabled={saving || uploading} className="w-full rounded bg-accent px-8 py-3 text-sm font-medium text-accent-contrast transition hover:opacity-90 disabled:opacity-50 sm:w-auto">
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </form>
    </div>
  );
}
