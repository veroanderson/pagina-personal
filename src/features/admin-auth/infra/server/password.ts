import crypto from 'crypto';

// Verificación de la contraseña del admin contra un hash scrypt, nunca contra
// la contraseña en texto plano.
//
// Por qué no guardar ADMIN_PASSWORD en el entorno: una variable de entorno con
// la contraseña real puede quedar legible en /proc/<pid>/environ,
// en el .env del host y en cualquier backup o snapshot de esa carpeta. Con un
// hash, filtrar el entorno no entrega la credencial.
//
// Formato almacenado (una sola línea, apta para .env):
//   scrypt$<N>$<r>$<p>$<salt-hex>$<hash-hex>

const SCRYPT_N = 16384; // ~16 MB de memoria por verificación
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return [
    'scrypt',
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString('hex'),
    hash.toString('hex'),
  ].join('$');
}

export function verifyPassword(password: string, stored: string): boolean {
  // Limpiar posibles comillas, barras invertidas (\$) o dólares duplicados ($$)
  // introducidos por formateadores de .env
  const cleaned = stored
    .replace(/^["']|["']$/g, '')
    .replace(/\\\$|\$\$/g, '$')
    .replace(/\\/g, '')
    .trim();

  const parts = cleaned.split('$').filter(Boolean);
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, 'hex');
    expected = Buffer.from(hashHex, 'hex');
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  // scrypt es deliberadamente lento y con costo de memoria fijo, así que el
  // tiempo de cómputo no depende de la contraseña ingresada. La comparación
  // final igual se hace en tiempo constante.
  const actual = crypto.scryptSync(password, salt, expected.length, { N, r, p });
  return crypto.timingSafeEqual(actual, expected);
}
