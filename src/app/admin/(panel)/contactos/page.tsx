'use client';

import { useState, useEffect } from 'react';

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  requestType: string;
  details: string;
  isRead: number;
  createdAt: string;
}

export default function AdminContactosPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = () => {
    fetch('/api/admin/contactos')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setContacts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch('/api/admin/contactos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'markRead' }),
      });
      if (res.ok) loadContacts();
    } catch (err) {
      alert('Error al actualizar contacto.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar (soft delete) esta consulta?')) return;

    try {
      const res = await fetch(`/api/admin/contactos?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadContacts();
    } catch (err) {
      alert('Error al eliminar contacto.');
    }
  };

  if (loading) {
    return <div className="p-4 text-patagonia-muted">Cargando Contactos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-patagonia-border pb-6">
        <h1 className="font-serif-editorial text-3xl font-normal text-patagonia-fg">
          Mensajes de Contacto
        </h1>
        <p className="text-sm text-patagonia-muted mt-1">
          Consultas recibidas desde el formulario web del portfolio.
        </p>
      </div>

      <div className="divide-y divide-patagonia-border rounded border border-patagonia-border bg-patagonia-panel overflow-hidden">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-patagonia-muted text-sm">
            No hay mensajes de contacto registrados.
          </div>
        ) : (
          contacts.map((item) => (
            <div
              key={item.id}
              className={`p-6 space-y-3 transition ${
                item.isRead === 0 ? 'bg-patagonia-hover/80 border-l-4 border-patagonia-accent' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-patagonia-fg text-base">{item.name}</span>
                  <a
                    href={`mailto:${item.email}`}
                    className="text-xs font-mono text-patagonia-accent hover:underline"
                  >
                    {item.email}
                  </a>
                  {item.isRead === 0 && (
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-patagonia-accent text-white font-semibold">
                      Nuevo
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-patagonia-muted tabular-nums">
                  {new Date(item.createdAt).toLocaleString('es-AR')}
                </span>
              </div>

              <div className="text-xs font-mono text-patagonia-muted uppercase tracking-wider">
                Asunto / Tipo: <span className="text-patagonia-fg">{item.requestType}</span>
              </div>

              <p className="text-sm text-patagonia-fg/90 bg-patagonia-bg p-4 rounded border border-patagonia-border/60 whitespace-pre-wrap">
                {item.details}
              </p>

              <div className="flex items-center gap-3 pt-2 justify-end">
                {item.isRead === 0 && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="px-3 py-1.5 bg-patagonia-accent/20 text-patagonia-accent hover:bg-patagonia-accent/40 text-xs font-medium rounded transition"
                  >
                    Marcar como leído
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-patagonia-bordo/20 hover:bg-patagonia-bordo/40 text-red-300 text-xs font-medium rounded transition"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
