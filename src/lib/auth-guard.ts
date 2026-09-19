import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';

// Control de acceso real del panel admin. Corre en runtime Node (route
// handlers, server components, server actions), NO en el middleware.
//
// Por qué acá y no solo en `src/middleware.ts`: el middleware es una única
// capa, evaluada fuera del handler, y ya hubo al menos una vulnerabilidad de
// Next.js (CVE-2025-29927, header `x-middleware-subrequest`) que permitía
// saltearlo por completo. Toda app que confiaba solo en el middleware quedó con
// el admin abierto. La autorización tiene que vivir donde vive el efecto:
// dentro del handler que toca datos.

export function hasValidSession(): boolean {
  return verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value);
}

/**
 * Guard para route handlers bajo /api/admin/*.
 * Devuelve una respuesta 401 si no hay sesión válida, o `null` si la hay.
 *
 * Uso — primera línea de CADA handler, sin excepción:
 *   const unauthorized = requireSession();
 *   if (unauthorized) return unauthorized;
 */
export function requireSession(): NextResponse | null {
  if (hasValidSession()) return null;
  return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
}
