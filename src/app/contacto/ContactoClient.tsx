'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Input, Select, Textarea } from '@/shared/ui';

export default function ContactoClient() {
  const searchParams = useSearchParams();
  const artworkTitle = searchParams.get('title');
  const artworkTech = searchParams.get('tech');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('Consulta sobre obra');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (artworkTitle) {
      setRequestType('Consulta sobre obra');
      const techDecoded = artworkTech ? decodeURIComponent(artworkTech) : '';
      const titleDecoded = decodeURIComponent(artworkTitle);
      setDetails(
        `Hola Vero,\n\nQuisiera consultar sobre la disponibilidad / adquisición de la obra "${titleDecoded}"${
          techDecoded ? ` (${techDecoded})` : ''
        }.\n\nAgradezco tu atención.`
      );
    }
  }, [artworkTitle, artworkTech]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, requestType, details }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: 'Tu mensaje fue enviado con éxito. Vero Anderson se pondrá en contacto a la brevedad.',
        });
        setName('');
        setEmail('');
        if (!artworkTitle) setDetails('');
      } else {
        const err = await res.json();
        setMessage({
          type: 'error',
          text: err.error || 'Error al enviar el mensaje. Por favor reintentá en un momento.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: 'Error de conexión. Verificá tu red e intentá nuevamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-10 lg:space-y-14">
      {/* Header */}
      <div className="space-y-3">
        <span className="text-xs uppercase font-mono tracking-widest text-accent">
          Contacto Directo · Adquisiciones y Prensa
        </span>
        <h1 className="font-serif-editorial text-3xl lg:text-5xl tracking-editorial text-ink font-normal leading-tight">
          Contacto
        </h1>
        <div className="w-16 h-0.5 bg-accent/60"></div>
        <p className="text-ink-muted text-base font-light pt-1">
          Para consultas sobre disponibilidad de obras, exhibiciones o proyectos especiales.
        </p>
      </div>

      {artworkTitle && (
        <div className="p-4 bg-accent/10 border border-accent/40 rounded text-sm text-ink flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-accent text-lg">✉</span>
            <span>
              Consultando por la obra:{' '}
              <strong className="font-serif-editorial text-lg text-accent-contrast">
                "{decodeURIComponent(artworkTitle)}"
              </strong>
            </span>
          </div>
        </div>
      )}

      {message && (
        <Alert tone={message.type === 'success' ? 'success' : 'danger'}>
          {message.text}
        </Alert>
      )}

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-6 lg:p-10 rounded-lg border border-line shadow-panel">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Tu Nombre Completo *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y Apellido"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              Correo Electrónico *
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Tipo de Consulta
          </label>
          <Select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            <option value="Consulta sobre obra">Consulta sobre obra / Adquisición</option>
            <option value="Exhibición / Curaduría">Exhibición / Curaduría</option>
            <option value="Prensa / Entrevista">Prensa / Entrevista</option>
            <option value="Otro motivo">Otro motivo</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">
            Mensaje o Detalles *
          </label>
          <Textarea
            rows={7}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Escribí acá tu consulta..."
            required
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="w-full font-serif-editorial text-xl tracking-wide shadow-panel active:scale-98"
        >
          {submitting ? 'Enviando mensaje...' : 'Enviar Consulta →'}
        </Button>
      </form>
    </div>
  );
}
