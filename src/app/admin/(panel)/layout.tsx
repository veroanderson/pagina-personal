import { redirect } from 'next/navigation';
import Link from 'next/link';
import { hasValidSession } from '@/lib/auth-guard';
import { ThemeSelector } from '@/features/theme';
import LogoutButton from './logout-button';

const tabs = [
  { href: '/admin/manifiesto', label: 'Manifiesto' },
  { href: '/admin/series', label: 'Series y Obras' },
  { href: '/admin/biografia', label: 'Biografía' },
  { href: '/admin/contactos', label: 'Contactos' },
  { href: '/admin/uploads', label: 'Config Uploads' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasValidSession()) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-surface sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="font-serif-editorial text-lg tracking-widest text-accent font-semibold">
              VERO ANDERSON
            </span>
            <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-surface-hover text-ink-muted font-mono">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSelector variant="compact" />
            <Link
              href="/"
              target="_blank"
              className="text-xs tracking-wider text-ink-muted hover:text-ink px-3 py-1.5 rounded border border-line hover:bg-surface-hover transition"
            >
              Ver Sitio ↗
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Horizontal scrollable tab menu for thumb-friendly touch UX */}
        <nav className="mx-auto flex max-w-6xl overflow-x-auto px-4 border-t border-line/40 scrollbar-none">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-ink-muted hover:border-accent hover:text-ink aria-[current=page]:border-accent aria-[current=page]:text-accent transition"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
