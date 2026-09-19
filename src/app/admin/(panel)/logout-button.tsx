'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      disabled={pending}
      className="px-3 py-1.5 text-xs font-mono text-patagonia-muted hover:text-red-400 rounded border border-patagonia-border hover:bg-patagonia-hover transition disabled:opacity-50"
    >
      {pending ? 'Saliendo...' : 'Cerrar sesión 🔒'}
    </button>
  );
}
