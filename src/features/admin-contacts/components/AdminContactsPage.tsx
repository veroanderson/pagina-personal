'use client';

import { useState, useEffect } from 'react';
import { useAdminContacts } from '../hooks/useAdminContacts';
import type { ContactRequest } from '../types/contact';

export default function AdminContactosPage() {
  const { listContacts, markContactAsRead, removeContact } = useAdminContacts();
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = () => {
    listContacts()
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
      const res = await markContactAsRead(id);
      if (res.ok) loadContacts();
    } catch (err) {
      alert('Error al actualizar contacto.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar (soft delete) esta consulta?')) return;

    try {
      const res = await removeContact(id);
      if (res.ok) loadContacts();
    } catch (err) {
      alert('Error al eliminar contacto.');
    }
  };

  if (loading) {
    return <div className="p-4 text-ink-muted">Cargando Contactos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-line pb-6">
        <h1 className="font-serif-editorial text-3xl font-normal text-ink">
          Mensajes de Contacto
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Consultas recibidas desde el formulario web del portfolio.
        </p>
      </div>

      <div className="divide-y divide-line rounded border border-line bg-surface overflow-hidden">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-ink-muted text-sm">
            No hay mensajes de contacto registrados.
          </div>
        ) : (
          contacts.map((item) => (
            <div
              key={item.id}
              className={`p-6 space-y-3 transition ${
                item.isRead === 0 ? 'bg-surface-hover/80 border-l-4 border-accent' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink text-base">{item.name}</span>
                  <a
                    href={`mailto:${item.email}`}
                    className="text-xs font-mono text-accent hover:underline"
                  >
                    {item.email}
                  </a>
                  {item.isRead === 0 && (
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-accent text-accent-contrast font-semibold">
                      Nuevo
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-ink-muted tabular-nums">
                  {new Date(item.createdAt).toLocaleString('es-AR')}
                </span>
              </div>

              <div className="text-xs font-mono text-ink-muted uppercase tracking-wider">
                Asunto / Tipo: <span className="text-ink">{item.requestType}</span>
              </div>

              <p className="text-sm text-ink/90 bg-canvas p-4 rounded border border-line/60 whitespace-pre-wrap">
                {item.details}
              </p>

              <div className="flex items-center gap-3 pt-2 justify-end">
                {item.isRead === 0 && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="px-3 py-1.5 bg-accent/20 text-accent hover:bg-accent/40 text-xs font-medium rounded transition"
                  >
                    Marcar como leído
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 bg-danger/20 hover:bg-danger/40 text-danger text-xs font-medium rounded transition"
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
