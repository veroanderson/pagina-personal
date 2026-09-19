import { NextRequest, NextResponse } from 'next/server';
import { createContactRequest } from '@/lib/db';
import { isRateLimited } from '@/lib/rate-limit';
import { bodyTooLarge, getClientIp } from '@/lib/http';

const CONTACT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 3;
const MAX_BODY_BYTES = 16 * 1024;

// Este es el único endpoint que escribe en la base sin autenticación, así que
// es el que define cuánto puede crecer la DB desde afuera. Sin topes de
// longitud, 3 requests por minuto podrían generar una carga innecesaria en el
// un host compartido eso puede generar una carga innecesaria en el servicio de datos
// renovar certificados). Ver 06-MULTI-TENANT.md.
const LIMITS = {
  name: 120,
  email: 254, // longitud máxima de una dirección de email según RFC 5321
  details: 4000,
} as const;

// Lista blanca: ajustar a los tipos reales del proyecto durante la Fase 0 de
// descubrimiento (ver SKILL.md).
const ALLOWED_REQUEST_TYPES = [
  'consulta', 'presupuesto', 'soporte', 'otro',
  'Consulta sobre obra', 'Exhibición / Curaduría', 'Prensa / Entrevista', 'Otro motivo'
];

// Validación deliberadamente laxa: el objetivo es descartar basura evidente y
// acotar el tamaño, no decidir si un email existe. La única forma de saberlo es
// mandarle un mensaje.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

function invalid(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  if (bodyTooLarge(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ success: false, message: 'El mensaje es demasiado largo' }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (!ip) {
    return invalid('No se pudo determinar el origen de la solicitud');
  }

  if (await isRateLimited('contact:ip', ip, CONTACT_WINDOW_MS, MAX_REQUESTS_PER_WINDOW)) {
    return NextResponse.json({ success: false, message: 'Demasiadas solicitudes' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return invalid('JSON inválido');
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const requestType = typeof body.requestType === 'string' ? body.requestType.trim() : '';
  const details = typeof body.details === 'string' ? body.details.trim() : '';

  if (!name || !email || !requestType || !details) {
    return invalid('Faltan campos requeridos');
  }
  if (name.length > LIMITS.name) {
    return invalid(`El nombre no puede superar los ${LIMITS.name} caracteres`);
  }
  if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return invalid('El email no es válido');
  }
  if (!ALLOWED_REQUEST_TYPES.includes(requestType)) {
    return invalid('Tipo de solicitud inválido');
  }
  if (details.length > LIMITS.details) {
    return invalid(`El mensaje no puede superar los ${LIMITS.details} caracteres`);
  }

  const id = await createContactRequest(name, email, requestType, details);
  return NextResponse.json({ success: true, id });
}
