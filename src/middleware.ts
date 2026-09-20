import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/features/admin-auth/edge';

// ATENCIÓN — este middleware NO es el control de acceso del panel admin.
//
// Es una capa de UX (redirigir a /admin/login antes de renderizar) más un
// backstop que rechaza lo obviamente anónimo. La autorización real —verificar
// la firma HMAC y la expiración del token— vive en `requireSession()`
// (`src/features/admin-auth/infra/server/auth-guard.ts`), llamada dentro de cada route handler de
// /api/admin/* y en el layout del panel. Ver `04-SECURITY-PATTERNS.md` § 2.
//
// Dos razones por las que la verificación no puede vivir acá:
//
// 1. Runtime: el middleware de Next 14 corre siempre en Edge Runtime, donde
//    `node:crypto` (createHmac / timingSafeEqual) no existe. Importarlo compila
//    igual pero solo emite un warning en el build — falla recién en runtime.
//    Además Next inlinea `process.env` en el bundle de Edge en build time, y en
//    el build el .env todavía no está montado: el secreto llegaría
//    como `undefined`.
//
// 2. Seguridad: el middleware es salteable ante bugs del framework
//    (CVE-2025-29927 permitía saltearlo entero con un header). Una autorización
//    que se evalúa fuera del handler es una autorización que se puede desviar.
//
// Por eso acá solo se mira si *existe* la cookie, nunca si es válida. Nada de
// secretos ni de criptografía en este archivo.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith('/api/admin') && !hasSessionCookie) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !hasSessionCookie) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
