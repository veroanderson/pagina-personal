'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Manifiesto' },
    { href: '/series', label: 'Series' },
    { href: '/biografia', label: 'Biografía' },
    { href: '/contacto', label: 'Contacto' },
  ];

  return (
    <div className="min-h-screen bg-patagonia-bg text-patagonia-fg flex flex-col lg:flex-row">
      {/* MOBILE TOP HEADER (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-patagonia-bg/95 backdrop-blur-md border-b border-patagonia-border px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Subtle Patagonia Botánic Symbol */}
          <svg className="w-5 h-5 text-patagonia-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
            <path d="M12 3v18M3 12h18" strokeDasharray="2 2" strokeOpacity="0.4" />
            <path d="M12 6c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z" strokeWidth="1" />
          </svg>
          <span className="font-serif-editorial text-xl tracking-editorial text-patagonia-fg font-normal uppercase">
            Vero Anderson
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-patagonia-muted hover:text-patagonia-fg focus:outline-none"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <div className="space-y-1.5 w-6">
              <span className="block h-0.5 bg-patagonia-fg"></span>
              <span className="block h-0.5 bg-patagonia-muted"></span>
              <span className="block h-0.5 bg-patagonia-accent"></span>
            </div>
          )}
        </button>
      </header>

      {/* MOBILE DROPDOWN NAV MENU */}
      {mobileMenuOpen && (
        <nav className="lg:hidden sticky top-16 z-30 bg-patagonia-panel border-b border-patagonia-border px-6 py-6 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block font-serif-editorial text-2xl tracking-editorial transition ${
                  isActive ? 'text-patagonia-accent font-medium' : 'text-patagonia-muted hover:text-patagonia-fg'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-4 border-t border-patagonia-border/40 text-xs font-mono text-patagonia-muted">
            <Link href="/admin" className="hover:text-patagonia-fg">
              Acceso Admin 🔒
            </Link>
          </div>
        </nav>
      )}

      {/* DESKTOP BIFURCATED SIDEBAR (≥ lg) */}
      <aside className="hidden lg:flex w-80 flex-col justify-between border-r border-patagonia-border p-10 h-screen sticky top-0 bg-patagonia-bg flex-shrink-0">
        <div className="space-y-12">
          {/* Brand Header & Symbol */}
          <div className="space-y-4">
            <Link href="/" className="block space-y-2 group">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-patagonia-accent group-hover:rotate-45 transition duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
                  <path d="M12 3v18M3 12h18" strokeDasharray="2 2" strokeOpacity="0.4" />
                  <path d="M12 6c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z" strokeWidth="1" />
                </svg>
                <span className="text-xs uppercase font-mono tracking-widest text-patagonia-muted">
                  Portfolio Personal
                </span>
              </div>
              <h1 className="font-serif-editorial text-3xl tracking-editorial text-patagonia-fg font-normal uppercase leading-tight">
                Vero Anderson
              </h1>
            </Link>
            <p className="font-cursive-gestual text-xl text-patagonia-muted italic leading-relaxed">
              "La contemplación del horizonte y la botánica de campo."
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center justify-between text-lg tracking-wide font-serif-editorial transition py-1 ${
                    isActive ? 'text-patagonia-accent font-semibold border-b border-patagonia-accent/60' : 'text-patagonia-muted hover:text-patagonia-fg'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className={`text-xs font-mono transition transform group-hover:translate-x-1 ${isActive ? 'opacity-100 text-patagonia-accent' : 'opacity-0'}`}>
                    →
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="space-y-3 pt-8 border-t border-patagonia-border/40 text-xs font-mono text-patagonia-muted">
          <div>Patagonia, Argentina</div>
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} Vero Anderson</span>
            <Link href="/admin" className="hover:text-patagonia-fg transition opacity-40 hover:opacity-100">
              [Admin]
            </Link>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 px-4 py-8 lg:px-16 lg:py-16">
        {children}
      </main>
    </div>
  );
}
