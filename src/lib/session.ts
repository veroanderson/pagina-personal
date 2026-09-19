import crypto from 'crypto';

// Sesión del admin: token firmado con HMAC-SHA256 y expiración embebida.
//
// IMPORTANTE — este módulo usa `node:crypto` y por lo tanto SOLO puede
// importarse desde código que corre en el runtime de Node (route handlers,
// server components, server actions). NO importarlo desde `src/middleware.ts`:
// el middleware de Next 14 corre siempre en Edge Runtime, donde `node:crypto`
// no existe. Ver `04-SECURITY-PATTERNS.md` § 1 y § 2.

export { SESSION_COOKIE_NAME } from './session-cookie';

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días, en segundos

// La clave de firma mezcla SESSION_SECRET con el hash de la contraseña actual.
// Consecuencia deseada: rotar ADMIN_PASSWORD_HASH invalida automáticamente
// todas las sesiones ya emitidas, sin necesidad de una tabla de sesiones ni de
// consultar la base desde el path de verificación.
//
// Se lee en cada llamada (no a nivel de módulo) para que el `next build` dentro
// de build no falle: en build time el .env todavía no está montado.
function signingKey(): string {
  const secret = process.env.SESSION_SECRET;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD;

  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET no está definido o es demasiado corto (mínimo 32 caracteres). Generarlo con: openssl rand -hex 32'
    );
  }
  if (!passwordHash) {
    throw new Error(
      'Ni ADMIN_PASSWORD_HASH ni ADMIN_PASSWORD están definidos en el entorno.'
    );
  }

  return `${secret}:${passwordHash}`;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', signingKey()).update(payload).digest('hex');
}

export function createSessionToken(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [role, expiresAtRaw, signature] = parts;

  // Expiración primero: es un chequeo barato y no depende de secretos.
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  if (role !== 'admin') return false;

  const expectedSignature = sign(`${role}.${expiresAtRaw}`);

  const sigBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  if (sigBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
