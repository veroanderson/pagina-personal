import { Suspense } from 'react';
import PublicLayout from '@/components/PublicLayout';
import ContactForm from './ContactForm';

export default function ContactPage() {
  return <PublicLayout><Suspense fallback={<div className="p-8 text-ink-muted">Cargando formulario de contacto...</div>}><ContactForm /></Suspense></PublicLayout>;
}
