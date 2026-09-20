'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isNavigationLinkActive, PUBLIC_NAVIGATION_LINKS } from '../services/navigation-links';

type MobileNavigationMenuProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileNavigationMenu({ isOpen, onClose }: MobileNavigationMenuProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <nav className="lg:hidden fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-canvas px-6 py-6 text-center">
      <div className="flex items-center justify-between">
        <Link href="/" onClick={onClose} className="font-serif-editorial text-sm uppercase tracking-[0.2em] text-ink-muted">
          Vero Anderson
        </Link>
        <button onClick={onClose} className="p-2 text-ink hover:text-accent focus:outline-none" aria-label="Cerrar menú">
          <span className="block text-4xl font-light leading-none">×</span>
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          {PUBLIC_NAVIGATION_LINKS.map((link) => {
            const isActive = isNavigationLinkActive(pathname, link);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`font-serif-editorial text-4xl tracking-editorial transition sm:text-5xl ${
                  isActive ? 'text-accent font-medium' : 'text-ink hover:text-accent'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="pb-2 text-[10px] font-mono uppercase tracking-widest text-ink-muted/60">
        <Link href="/admin" onClick={onClose} className="transition hover:text-ink">
          Acceso Admin
        </Link>
      </div>
    </nav>
  );
}
