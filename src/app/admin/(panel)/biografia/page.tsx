'use client';

import { useState, useEffect } from 'react';

export default function AdminBioPage() {
  const [bioText, setBioText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/bio')
      .then((res) => res.json())
      .then((data) => {
        if (data) setBioText(data.bioText || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bioText }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Biografía / CV actualizado correctamente.' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Error al guardar la biografía.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error de red al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-patagonia-muted">Cargando Biografía...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-serif-editorial text-3xl font-normal text-patagonia-fg">
          Biografía y CV
        </h1>
        <p className="text-sm text-patagonia-muted mt-1">
          Edición directa de la trayectoria, premios, becas y exposiciones de Vero Anderson.
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
            Biografía / CV (Soporta Markdown)
          </label>
          <textarea
            rows={16}
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            className="w-full rounded border border-patagonia-border bg-patagonia-panel p-4 text-base font-mono text-patagonia-fg placeholder-patagonia-muted focus:border-patagonia-accent focus:outline-none"
            placeholder="# Vero Anderson&#10;*Artista Visual*&#10;&#10;### Formación..."
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-patagonia-accent text-white font-medium text-sm rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Biografía'}
          </button>
        </div>
      </form>
    </div>
  );
}
