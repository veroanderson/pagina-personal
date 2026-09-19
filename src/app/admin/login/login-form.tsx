'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Input } from '@/shared/ui';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || 'No se pudo iniciar sesión');
        return;
      }

      setPassword('');
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-ink">Contraseña</span>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Ingresá la clave de admin"
            className="pr-10 py-2.5"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink text-sm p-1"
            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </label>

      {error && (
          <Alert tone="danger" className="p-2.5">
            {error}
          </Alert>
      )}

      <Button
        type="submit"
        disabled={pending || !password}
        className="w-full shadow-panel"
      >
        {pending ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  );
}
