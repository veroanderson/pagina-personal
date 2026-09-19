import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session';

// Cierre de sesión: borra la cookie del navegador.
//
// Es POST, no GET, para que no se dispare desde un <img> o un prefetch. La
// cookie es SameSite=Strict, así que un sitio de terceros no puede provocarlo.
//
// Nota sobre el alcance: el token sigue siendo criptográficamente válido hasta
// su expiración — no hay lista de revocación (no hay tabla de sesiones, por
// diseño). Para invalidar TODAS las sesiones emitidas de golpe (contraseña
// filtrada, notebook robada), hay que rotar `ADMIN_PASSWORD_HASH` o
// `SESSION_SECRET` en el .env y reiniciar: la clave de firma los incluye a los
// dos. Ver `04-SECURITY-PATTERNS.md` § 1.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
