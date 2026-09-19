import { Suspense } from 'react';
import PublicLayout from '@/components/PublicLayout';
import ContactoClient from './ContactoClient';

export const revalidate = 0;

export default function ContactoPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<div className="p-8 text-ink-muted">Cargando formulario de contacto...</div>}>
        <ContactoClient />
      </Suspense>
    </PublicLayout>
  );
}
