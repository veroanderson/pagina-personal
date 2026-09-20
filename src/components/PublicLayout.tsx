'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  isNavigationLinkActive,
  MobileNavigationMenu,
  PUBLIC_NAVIGATION_LINKS,
} from '@/features/navigation';
import { ThemeSelector } from '@/features/theme';

type PublicLayoutProps = {
  children: React.ReactNode;
  fullBleed?: boolean;
};

export default function PublicLayout({ children, fullBleed = false }: PublicLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`${fullBleed ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'} bg-canvas text-ink flex flex-col lg:flex-row`}>
      {/* MOBILE TOP HEADER (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-line px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Subtle Patagonia Botánic Symbol */}
          <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
            <path d="M12 3v18M3 12h18" strokeDasharray="2 2" strokeOpacity="0.4" />
            <path d="M12 6c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z" strokeWidth="1" />
          </svg>
          <span className="font-serif-editorial text-xl tracking-editorial text-ink font-normal uppercase">
            Vero Anderson
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeSelector variant="compact" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink-muted hover:text-ink focus:outline-none"
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
          >
            <div className="space-y-1.5 w-6">
              <span className="block h-0.5 bg-ink"></span>
              <span className="block h-0.5 bg-ink-muted"></span>
              <span className="block h-0.5 bg-accent"></span>
            </div>
          </button>
        </div>
      </header>

      <MobileNavigationMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* DESKTOP BIFURCATED SIDEBAR (≥ lg) */}
      <aside className="hidden lg:flex w-80 flex-col justify-between border-r border-line p-10 h-screen sticky top-0 bg-canvas flex-shrink-0">
        <div className="space-y-12">
          {/* Brand Header & Symbol */}
          <div className="space-y-4">
            <Link href="/" className="block space-y-2 group">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-accent group-hover:rotate-45 transition duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.4" />
                  <path d="M12 3v18M3 12h18" strokeDasharray="2 2" strokeOpacity="0.4" />
                  <path d="M12 6c3 0 6 3 6 6s-3 6-6 6-6-3-6-6 3-6 6-6z" strokeWidth="1" />
                </svg>
                <span className="text-xs uppercase font-mono tracking-widest text-ink-muted">
                  Portfolio Personal
                </span>
              </div>
              <h1 className="font-serif-editorial text-3xl tracking-editorial text-ink font-normal uppercase leading-tight">
                Vero Anderson
              </h1>
            </Link>
            <p className="font-cursive-gestual text-xl text-ink-muted italic leading-relaxed">
              "La contemplación del horizonte y la botánica de campo."
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            {PUBLIC_NAVIGATION_LINKS.map((link) => {
              const isActive = isNavigationLinkActive(pathname, link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center justify-between text-lg tracking-wide font-serif-editorial transition py-1 ${
                    isActive ? 'text-accent font-semibold border-b border-accent/60' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <span>{link.label}</span>
                  <span className={`text-xs font-mono transition transform group-hover:translate-x-1 ${isActive ? 'opacity-100 text-accent' : 'opacity-0'}`}>
                    →
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="space-y-3 pt-8 border-t border-line/40 text-xs font-mono text-ink-muted">
          <div>Patagonia, Argentina</div>
          <div className="flex items-center justify-between">
            <span>© {new Date().getFullYear()} Vero Anderson</span>
            <Link href="/admin" className="hover:text-ink transition opacity-40 hover:opacity-100">
              [Admin]
            </Link>
          </div>
          <div className="pt-2">
            <ThemeSelector />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 min-w-0 ${fullBleed ? 'min-h-0' : 'px-4 py-8 lg:px-16 lg:py-16'}`}>
        {children}
      </main>
    </div>
  );
}
