import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { getSetting } from '@/lib/db';
import { requireSession } from '@/lib/auth-guard';
import { bodyTooLarge } from '@/lib/http';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { PORTFOLIO_IMAGES_BUCKET, publicImageUrl } from '@/lib/storage';

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_BODY_BYTES = MAX_UPLOAD_SIZE_BYTES + 64 * 1024; // margen para el overhead de multipart
const MAX_DIMENSION = 2000;
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];
const ENTITY_PATTERN = /^[a-z0-9_-]{1,64}$/;

// Endpoint genérico de upload de imágenes, reusado por cualquier tab de
// dominio (ej. foto de una experiencia, portada de un producto). Aplica la
// compresión configurada en la tab Uploads (`getSetting('uploads.*')`, ver
// 07-ADMIN-PANEL-AND-UPLOADS.md) y guarda el resultado en Supabase Storage.
//
// Uso: POST /api/admin/upload?entity=experience&id=3, multipart/form-data
// con el archivo en el campo "file". La tab de dominio que llama a este
// endpoint es responsable de guardar la `url` devuelta en su propia tabla
// (ej. guardar el `path` devuelto en la tabla de la entidad).
export async function POST(request: NextRequest) {
  const unauthorized = requireSession();
  if (unauthorized) return unauthorized;

  if (bodyTooLarge(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ success: false, message: 'La imagen supera los 5MB' }, { status: 413 });
  }

  const entity = request.nextUrl.searchParams.get('entity');
  const id = request.nextUrl.searchParams.get('id') ?? 'file';

  // Whitelist estricta: `entity` e `id` se concatenan en una ruta de disco.
  // Al no permitir `.` ni `/`, quedan descartados `..`, rutas absolutas y
  // separadores — esta es la defensa real contra path traversal del proyecto.
  if (!entity || !ENTITY_PATTERN.test(entity) || !ENTITY_PATTERN.test(id)) {
    return NextResponse.json(
      { success: false, message: 'entity/id inválidos (solo minúsculas, números, guiones)' },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'Falta el archivo file' }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ success: false, message: 'La imagen supera los 5MB' }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // El formato se decide leyendo la cabecera real del archivo, no el
  // `file.type` del multipart — ese lo declara el cliente y puede mentir.
  // Todo lo que pasa por acá se re-encodea antes de entrar al bucket.
  let format: string | undefined;
  try {
    ({ format } = await sharp(inputBuffer).metadata());
  } catch {
    return NextResponse.json({ success: false, message: 'El archivo no es una imagen válida' }, { status: 400 });
  }
  if (!format || !ALLOWED_FORMATS.includes(format)) {
    return NextResponse.json({ success: false, message: 'Solo se aceptan JPEG, PNG o WebP' }, { status: 400 });
  }

  const webpEnabled = (await getSetting('uploads.webpEnabled', 'true')) === 'true';
  const quality = Number(await getSetting('uploads.quality', '75'));

  let pipeline = sharp(inputBuffer).resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });
  pipeline = webpEnabled ? pipeline.webp({ quality }) : pipeline.jpeg({ quality, mozjpeg: true });
  const outputBuffer = await pipeline.toBuffer();

  const extension = webpEnabled ? 'webp' : 'jpg';
  const objectPath = `${entity}/${id}/${crypto.randomUUID()}.${extension}`;
  const contentType = webpEnabled ? 'image/webp' : 'image/jpeg';
  const { error } = await getSupabaseAdmin()
    .storage
    .from(PORTFOLIO_IMAGES_BUCKET)
    .upload(objectPath, outputBuffer, {
      cacheControl: '31536000',
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload failed:', error.message);
    return NextResponse.json(
      { success: false, message: 'No se pudo guardar la imagen en Supabase Storage' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    path: objectPath,
    url: publicImageUrl(objectPath),
    bytes: outputBuffer.length,
  });
}
