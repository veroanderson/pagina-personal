import type { NavigationLink } from '../types/navigation';

export const PUBLIC_NAVIGATION_LINKS: NavigationLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/series', label: 'Series' },
  { href: '/biografia', label: 'Biografía' },
  { href: '/contacto', label: 'Contacto' },
];

export function isNavigationLinkActive(pathname: string, link: NavigationLink) {
  return pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
}
