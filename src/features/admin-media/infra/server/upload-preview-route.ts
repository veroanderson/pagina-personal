import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { requireSession } from '@/features/admin-auth/auth';
import { bodyTooLarge } from '@/lib/http';

const MAX_PREVIEW_SIZE_BYTES = 15 * 1024 * 1024; // 15MB, solo para probar la config, no se guarda en disco
// Margen sobre el tamaño del archivo para cubrir el overhead de multipart
// (boundaries, headers de cada parte, los campos webpEnabled/quality).
const MAX_BODY_BYTES = MAX_PREVIEW_SIZE_BYTES + 64 * 1024;
const MAX_DIMENSION = 1920;
const ALLOWED_FORMATS = ['jpeg', 'png', 'webp'];

// Comprime una imagen subida por el admin con la config elegida, para
// previsualizar el resultado (peso y calidad) sin guardar nada en disco.
// No es el endpoint de upload final del sitio: es una herramienta de la
// pantalla de configuración de compresión.
export async function POST(request: NextRequest) {
  const unauthorized = requireSession();
  if (unauthorized) return unauthorized;

  // Antes de `formData()`: leer el body lo carga entero en memoria y el App
  // Router no impone ningún límite propio.
  if (bodyTooLarge(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ success: false, message: 'La imagen supera los 15MB' }, { status: 413 });
  }

  const formData = await request.formData();
  const file = formData.get('image');
  const webpEnabled = formData.get('webpEnabled') === 'true';
  const quality = Number(formData.get('quality') ?? 75);

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: 'Falta el archivo image' }, { status: 400 });
  }
  if (file.size > MAX_PREVIEW_SIZE_BYTES) {
    return NextResponse.json({ success: false, message: 'La imagen supera los 15MB' }, { status: 400 });
  }
  if (!Number.isFinite(quality) || quality < 40 || quality > 95) {
    return NextResponse.json({ success: false, message: 'quality debe estar entre 40 y 95' }, { status: 400 });
  }

  const originalBytes = file.size;
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  // El formato se determina leyendo el contenido, no el `file.type` que declara
  // el cliente (ver comentario extendido en upload/route.ts).
  let format: string | undefined;
  try {
    ({ format } = await sharp(inputBuffer).metadata());
  } catch {
    return NextResponse.json({ success: false, message: 'El archivo no es una imagen válida' }, { status: 400 });
  }
  if (!format || !ALLOWED_FORMATS.includes(format)) {
    return NextResponse.json({ success: false, message: 'Solo se aceptan JPEG, PNG o WebP' }, { status: 400 });
  }

  let pipeline = sharp(inputBuffer).resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });

  pipeline = webpEnabled ? pipeline.webp({ quality }) : pipeline.jpeg({ quality, mozjpeg: true });

  const outputBuffer = await pipeline.toBuffer();
  const compressedBytes = outputBuffer.length;
  const mimeType = webpEnabled ? 'image/webp' : 'image/jpeg';

  return NextResponse.json({
    success: true,
    originalBytes,
    compressedBytes,
    savedPercent: Math.max(0, Math.round((1 - compressedBytes / originalBytes) * 100)),
    previewDataUrl: `data:${mimeType};base64,${outputBuffer.toString('base64')}`,
  });
}
