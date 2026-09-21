'use client';

import { useEffect, useState } from 'react';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { useAdminBiography } from '../hooks/useAdminBiography';
import type { AdminBiographySection, AdminBiographySectionInput } from '../types/biography';

const HEADING_OPTIONS = [
  { value: 'large', label: 'Grande' },
  { value: 'medium', label: 'Mediano' },
  { value: 'small', label: 'Chico' },
] as const;

function createDraft(): AdminBiographySection {
  const id = -Date.now();
  return {
    id,
    subtitle: null,
    bodyText: '',
    headingLevel: 'large',
    displayOrder: Number.MAX_SAFE_INTEGER,
    isActive: true,
    createdAt: '',
    updatedAt: '',
    deletedAt: null,
  };
}

function moveSection<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function SortableBiographyCard({
  section,
  index,
  saving,
  onChange,
  onSave,
  onDelete,
}: {
  section: AdminBiographySection;
  index: number;
  saving: boolean;
  onChange: (id: number, changes: Partial<AdminBiographySection>) => void;
  onSave: (section: AdminBiographySection) => void;
  onDelete: (section: AdminBiographySection) => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: section.id,
    index,
    disabled: section.id < 0,
  });

  return (
    <article
      ref={ref}
      className={`rounded border border-line bg-surface p-5 space-y-4 transition ${isDragging ? 'opacity-60 shadow-lg' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-mono text-ink-muted">
            Sección {index + 1}
          </p>
          {!section.isActive && (
            <span className="inline-block mt-2 text-xs font-mono uppercase bg-warning/15 text-warning border border-warning/40 px-2 py-0.5 rounded">
              Oculta
            </span>
          )}
        </div>
        <button
          ref={handleRef}
          type="button"
          disabled={section.id < 0}
          aria-label={`Reordenar sección ${index + 1}`}
          className="cursor-grab rounded border border-line px-3 py-1 text-lg text-ink-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          ⋮⋮
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div>
          <label className="block text-sm font-medium text-ink mb-2" htmlFor={`subtitle-${section.id}`}>
            Subtítulo <span className="font-normal text-ink-muted">(opcional)</span>
          </label>
          <input
            id={`subtitle-${section.id}`}
            value={section.subtitle ?? ''}
            onChange={(event) => onChange(section.id, { subtitle: event.target.value || null })}
            className="w-full rounded border border-line bg-surface p-3 text-base text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            placeholder="Ej. Formación y primeras exposiciones"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2" htmlFor={`heading-${section.id}`}>
            Jerarquía
          </label>
          <select
            id={`heading-${section.id}`}
            value={section.headingLevel}
            onChange={(event) => onChange(section.id, { headingLevel: event.target.value as AdminBiographySection['headingLevel'] })}
            className="w-full rounded border border-line bg-surface p-3 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {HEADING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-2" htmlFor={`body-${section.id}`}>
          Texto
        </label>
        <textarea
          id={`body-${section.id}`}
          rows={8}
          required
          value={section.bodyText}
          onChange={(event) => onChange(section.id, { bodyText: event.target.value })}
          className="w-full rounded border border-line bg-surface p-3 text-base text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
          placeholder="Escribí el texto de esta sección. Podés usar párrafos y saltos de línea."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={section.isActive}
            onChange={(event) => onChange(section.id, { isActive: event.target.checked })}
            className="accent-accent"
          />
          Visible en la página pública
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onDelete(section)}
            className="px-4 py-2 text-sm text-danger border border-danger/40 rounded hover:bg-danger/10 transition"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => onSave(section)}
            disabled={saving || !section.bodyText.trim()}
            className="px-5 py-2 bg-accent text-accent-contrast font-medium text-sm rounded hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar sección'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function AdminBiographyPage() {
  const {
    listBiography,
    createBiographySection,
    updateBiographySection,
    reorderBiographySections,
    deleteBiographySection,
  } = useAdminBiography();
  const [sections, setSections] = useState<AdminBiographySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSections = async () => {
    try {
      const response = await listBiography();
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo cargar la biografía.');
      setSections(data.sections || []);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo cargar la biografía.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSections();
  }, []);

  const updateLocalSection = (id: number, changes: Partial<AdminBiographySection>) => {
    setSections((current) => current.map((section) => section.id === id ? { ...section, ...changes } : section));
  };

  const handleSave = async (section: AdminBiographySection) => {
    setSavingId(section.id);
    setMessage(null);
    const input: AdminBiographySectionInput = {
      subtitle: section.subtitle,
      bodyText: section.bodyText,
      headingLevel: section.headingLevel,
      isActive: section.isActive,
    };

    try {
      const response = section.id < 0
        ? await createBiographySection(input)
        : await updateBiographySection(section.id, input);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar la sección.');

      setSections((current) => {
        const next = section.id < 0
          ? [...current.filter((item) => item.id !== section.id), data.section]
          : current.map((item) => item.id === section.id ? data.section : item);
        return next.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
      });
      setMessage({ type: 'success', text: 'Sección guardada correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo guardar la sección.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (section: AdminBiographySection) => {
    if (!window.confirm(`¿Seguro que deseas eliminar la sección ${section.subtitle ? `"${section.subtitle}"` : ''}?`)) return;
    if (section.id < 0) {
      setSections((current) => current.filter((item) => item.id !== section.id));
      return;
    }

    setSavingId(section.id);
    setMessage(null);
    try {
      const response = await deleteBiographySection(section.id);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo eliminar la sección.');
      setSections((current) => current.filter((item) => item.id !== section.id));
      setMessage({ type: 'success', text: 'Sección eliminada correctamente.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo eliminar la sección.' });
    } finally {
      setSavingId(null);
    }
  };

  const handleDragEnd = async (event: Parameters<NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>>[0]) => {
    if (event.canceled || !isSortable(event.operation.source)) return;
    const { initialIndex, index } = event.operation.source;
    if (initialIndex === index) return;

    const previous = sections;
    const next = moveSection(previous, initialIndex, index);
    setSections(next);
    setMessage(null);

    try {
      const response = await reorderBiographySections(next.filter((section) => section.id > 0).map((section) => section.id));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo guardar el orden.');
      setMessage({ type: 'success', text: 'Orden actualizado correctamente.' });
    } catch (error) {
      setSections(previous);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo guardar el orden.' });
    }
  };

  if (loading) return <div className="p-4 text-ink-muted">Cargando biografía...</div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-serif-editorial text-3xl font-normal text-ink">Biografía</h1>
          <p className="text-sm text-ink-muted mt-1">
            Administrá las secciones, jerarquías y visibilidad de la biografía pública.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSections((current) => [...current, createDraft()])}
          className="px-5 py-2.5 bg-accent text-accent-contrast font-medium text-sm rounded hover:opacity-90 transition self-start"
        >
          + Nueva sección
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded border text-sm ${message.type === 'success' ? 'bg-accent/10 border-accent text-accent' : 'bg-danger/10 border-danger text-danger'}`}>
          {message.text}
        </div>
      )}

      {sections.length === 0 ? (
        <div className="rounded border border-dashed border-line p-8 text-center text-ink-muted text-sm">
          Todavía no hay secciones. Creá la primera para comenzar.
        </div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <SortableBiographyCard
                key={section.id}
                section={section}
                index={index}
                saving={savingId === section.id}
                onChange={updateLocalSection}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </DragDropProvider>
      )}
    </div>
  );
}
