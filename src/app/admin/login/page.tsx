import { redirect } from 'next/navigation';
import { hasValidSession } from '@/lib/auth-guard';
import LoginForm from './login-form';

export default function LoginPage() {
  if (hasValidSession()) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-patagonia-bg px-4 text-patagonia-fg">
      <div className="w-full max-w-md rounded-xl border border-patagonia-border bg-patagonia-panel p-8 shadow-2xl space-y-6">
        <div className="space-y-2 text-center">
          <span className="font-serif-editorial text-2xl tracking-widest text-patagonia-accent font-medium block uppercase">
            VERO ANDERSON
          </span>
          <h1 className="text-xl font-normal text-patagonia-fg">Acceso de Administración</h1>
          <p className="text-xs text-patagonia-muted">Ingresá la clave del panel de gestión.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
