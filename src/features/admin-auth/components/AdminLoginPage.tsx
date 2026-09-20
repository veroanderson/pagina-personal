import { redirect } from 'next/navigation';
import { hasValidSession } from '../auth';
import { ThemeSelector } from '@/features/theme';
import LoginForm from './LoginForm';

export default function LoginPage() {
  if (hasValidSession()) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-ink">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-line bg-surface p-8 shadow-panel">
        <div className="flex justify-end">
          <ThemeSelector />
        </div>
        <div className="space-y-2 text-center">
          <span className="font-serif-editorial text-2xl tracking-widest text-accent font-medium block uppercase">
            VERO ANDERSON
          </span>
          <h1 className="text-xl font-normal text-ink">Acceso de Administración</h1>
          <p className="text-xs text-ink-muted">Ingresá la clave del panel de gestión.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
