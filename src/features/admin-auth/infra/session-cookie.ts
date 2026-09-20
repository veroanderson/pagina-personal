// Solo el nombre de la cookie, sin dependencias de `node:crypto`.
//
// Existe como archivo aparte para que `src/middleware.ts` (Edge Runtime) pueda
// leer el nombre de la cookie sin arrastrar `infra/server/session.ts`, que usa
// `node:crypto` y solo funciona en runtime Node.
export const SESSION_COOKIE_NAME = 'admin_session';
