import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from './session';
import { verifyPassword } from './password';
import { isRateLimited, clearRateLimit } from '@/lib/rate-limit';
import { bodyTooLarge, getClientIp } from '@/lib/http';

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_LOGIN_ATTEMPTS_PER_IP = 5;
// Límite global, además del límite por IP: acota una fuerza bruta distribuida
// (muchas IPs, pocos intentos cada una) contra la única cuenta que existe.
const MAX_LOGIN_ATTEMPTS_GLOBAL = 50;
const MAX_BODY_BYTES = 4 * 1024;

export async function POST(request: NextRequest) {
  if (bodyTooLarge(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ success: false, message: 'Payload demasiado grande' }, { status: 413 });
  }

  const ip = getClientIp(request);
  // Sin IP determinable no se puede aplicar un límite por cliente. Se rechaza
  // en vez de agrupar todo bajo una clave común: ese bucket compartido lo
  // podría llenar un atacante para bloquear el login de todos.
  if (!ip) {
    return NextResponse.json(
      { success: false, message: 'No se pudo determinar el origen de la solicitud' },
      { status: 400 }
    );
  }

  if (await isRateLimited('login:ip', ip, LOGIN_WINDOW_MS, MAX_LOGIN_ATTEMPTS_PER_IP)) {
    return NextResponse.json(
      { success: false, message: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
      { status: 429 }
    );
  }
  if (await isRateLimited('login:global', 'all', LOGIN_WINDOW_MS, MAX_LOGIN_ATTEMPTS_GLOBAL)) {
    return NextResponse.json(
      { success: false, message: 'Demasiados intentos. Probá de nuevo en unos minutos.' },
      { status: 429 }
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  if (!adminPassword && !passwordHash) {
    console.error('Ni ADMIN_PASSWORD ni ADMIN_PASSWORD_HASH están definidos en el entorno.');
    return NextResponse.json({ success: false, message: 'Error de configuración' }, { status: 500 });
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ success: false, message: 'JSON inválido' }, { status: 400 });
  }

  let isValid = false;
  if (typeof password === 'string') {
    if (adminPassword && password === adminPassword) {
      isValid = true;
    } else if (passwordHash && verifyPassword(password, passwordHash)) {
      isValid = true;
    }
  }

  if (!isValid) {
    return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
  }

  try {
    await clearRateLimit('login:ip', ip);
  } catch (error) {
    // A successful login should not become a 500 because bucket cleanup failed.
    console.warn('No se pudo resetear el rate limit de login:', error);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  return response;
}
