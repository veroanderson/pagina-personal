import { NextRequest, NextResponse } from 'next/server';
import { createContactRequest } from '@/lib/db';
import { isRateLimited } from '@/lib/rate-limit';
import { bodyTooLarge, getClientIp } from '@/lib/http';

const CONTACT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const MAX_BODY_BYTES = 16 * 1024;
const LIMITS = { name: 120, email: 254, details: 4000 } as const;
const ALLOWED_REQUEST_TYPES = ['consulta', 'presupuesto', 'soporte', 'otro', 'Consulta sobre obra', 'Exhibición / Curaduría', 'Prensa / Entrevista', 'Otro motivo'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@]+$/;

function invalid(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export async function POST(request: NextRequest) {
  if (bodyTooLarge(request, MAX_BODY_BYTES)) return NextResponse.json({ success: false, message: 'El mensaje es demasiado largo' }, { status: 413 });
  const ip = getClientIp(request);
  if (!ip) return invalid('No se pudo determinar el origen de la solicitud');
  if (await isRateLimited('contact:ip', ip, CONTACT_WINDOW_MS, MAX_REQUESTS_PER_WINDOW)) return NextResponse.json({ success: false, message: 'Demasiadas solicitudes' }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return invalid('JSON inválido'); }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const requestType = typeof body.requestType === 'string' ? body.requestType.trim() : '';
  const details = typeof body.details === 'string' ? body.details.trim() : '';
  if (!name || !email || !requestType || !details) return invalid('Faltan campos requeridos');
  if (name.length > LIMITS.name) return invalid(`El nombre no puede superar los ${LIMITS.name} caracteres`);
  if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) return invalid('El email no es válido');
  if (!ALLOWED_REQUEST_TYPES.includes(requestType)) return invalid('Tipo de solicitud inválido');
  if (details.length > LIMITS.details) return invalid(`El mensaje no puede superar los ${LIMITS.details} caracteres`);

  const id = await createContactRequest(name, email, requestType, details);
  return NextResponse.json({ success: true, id });
}
