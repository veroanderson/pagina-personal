import type { NextRequest } from 'next/server';

// El proveedor de hosting debe entregar X-Forwarded-For con la IP del cliente.
// Se toma un unico proxy confiable al final de la cadena.
const TRUSTED_PROXY_HOPS = 1;

/**
 * Obtiene la IP del cliente desde X-Forwarded-For.
 *
 * El header lo controla el cliente y los proxies lo van agregando, por eso se
 * toma el elemento agregado por el proxy confiable mas cercano, contando desde
 * el final. Devuelve null si no se puede determinar.
 */
export function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return null;

  const hops = forwarded
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (hops.length === 0) return null;

  const ip = hops[Math.max(0, hops.length - TRUSTED_PROXY_HOPS)];
  return ip || null;
}

/** Rechaza cuerpos demasiado grandes antes de bufferizarlos. */
export function bodyTooLarge(request: NextRequest, maxBytes: number): boolean {
  const declared = Number(request.headers.get('content-length'));
  if (!Number.isFinite(declared)) return true;
  return declared > maxBytes;
}
