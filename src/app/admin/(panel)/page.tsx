import { redirect } from 'next/navigation';

// /admin no tiene contenido propio: redirige a la primera tab del panel.
export default function AdminIndexPage() {
  redirect('/admin/uploads');
}
