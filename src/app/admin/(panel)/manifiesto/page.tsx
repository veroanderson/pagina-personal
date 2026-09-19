'use client';

import { useState, useEffect } from 'react';

export default function AdminManifiestoPage() {
  const [statementText, setStatementText] = useState('');
  const [imagePath1, setImagePath1] = useState<string | null>(null);
  const [imagePath2, setImagePath2] = useState<string | null>(null);
  const [imageUrl1, setImageUrl1] = useState<string | null>(null);
  const [imageUrl2, setImageUrl2] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingImg1, setUploadingImg1] = useState(false);
  const [uploadingImg2, setUploadingImg2] = useState(false);

  useEffect(() => {
    fetch('/api/admin/manifesto')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setStatementText(data.statementText || '');
          setImagePath1(data.imagePath1 || null);
          setImagePath2(data.imagePath2 || null);
          setImageUrl1(data.imageUrl1 || null);
          setImageUrl2(data.imageUrl2 || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/manifesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementText, imagePath1, imagePath2 }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Manifiesto guardado correctamente.' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Error al guardar el manifiesto.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error de red al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, imgNum: 1 | 2) => {
    const setUploading = imgNum === 1 ? setUploadingImg1 : setUploadingImg2;
    const setUrl = imgNum === 1 ? setImageUrl1 : setImageUrl2;
    const setPath = imgNum === 1 ? setImagePath1 : setImagePath2;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload?entity=manifesto&id=1', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUrl(data.url);
        setPath(data.path);
        setMessage({ type: 'success', text: `Imagen ${imgNum} subida correctamente.` });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.message || err.error || `Error al subir imagen ${imgNum}.` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de conexión al subir la imagen.' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-patagonia-muted">Cargando Manifiesto...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif-editorial text-3xl font-normal text-patagonia-fg">
          Manifiesto (Artist Statement)
        </h1>
        <p className="text-sm text-patagonia-muted mt-1">
          Texto de bienvenida e imágenes de fondo/textura para la página principal del portfolio.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded border text-sm ${
            message.type === 'success'
              ? 'bg-patagonia-accent/10 border-patagonia-accent text-patagonia-accent'
              : 'bg-patagonia-bordo/10 border-patagonia-bordo text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-patagonia-fg mb-2">
            Texto del Manifiesto (Soporta Markdown)
          </label>
          <textarea
            rows={12}
            value={statementText}
            onChange={(e) => setStatementText(e.target.value)}
            className="w-full rounded border border-patagonia-border bg-patagonia-panel p-4 text-base text-patagonia-fg placeholder-patagonia-muted focus:border-patagonia-accent focus:outline-none"
            placeholder="Escribí acá el manifiesto o declaración artística..."
            required
          />
        </div>

        {/* Uploads de imágenes grandes de textura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-patagonia-border pt-6">
          {/* Imagen 1 */}
          <div className="space-y-3 bg-patagonia-panel p-4 rounded border border-patagonia-border">
            <span className="block text-sm font-medium text-patagonia-fg">
              Imagen Principal de Textura (Opcional)
            </span>

            {imageUrl1 ? (
              <div className="space-y-2">
                <img
                  src={imageUrl1}
                  alt="Manifiesto 1"
                  className="h-40 w-full object-cover rounded border border-patagonia-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl1(null);
                    setImagePath1(null);
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-patagonia-border rounded text-xs text-patagonia-muted">
                Sin imagen seleccionada
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              disabled={uploadingImg1}
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 1);
              }}
              className="text-xs text-patagonia-muted file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-patagonia-hover file:text-patagonia-fg hover:file:bg-patagonia-border"
            />
            {uploadingImg1 && <span className="text-xs text-patagonia-accent">Subiendo...</span>}
          </div>

          {/* Imagen 2 */}
          <div className="space-y-3 bg-patagonia-panel p-4 rounded border border-patagonia-border">
            <span className="block text-sm font-medium text-patagonia-fg">
              Segunda Imagen de Textura (Opcional)
            </span>

            {imageUrl2 ? (
              <div className="space-y-2">
                <img
                  src={imageUrl2}
                  alt="Manifiesto 2"
                  className="h-40 w-full object-cover rounded border border-patagonia-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl2(null);
                    setImagePath2(null);
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-patagonia-border rounded text-xs text-patagonia-muted">
                Sin imagen seleccionada
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              disabled={uploadingImg2}
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 2);
              }}
              className="text-xs text-patagonia-muted file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:bg-patagonia-hover file:text-patagonia-fg hover:file:bg-patagonia-border"
            />
            {uploadingImg2 && <span className="text-xs text-patagonia-accent">Subiendo...</span>}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-patagonia-accent text-white font-medium text-sm rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Manifiesto'}
          </button>
        </div>
      </form>
    </div>
  );
}
