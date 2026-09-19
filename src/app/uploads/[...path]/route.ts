import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.avif']);

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const fileRelativePath = params.path.join('/');
  const filePath = path.normalize(path.join(UPLOADS_ROOT, fileRelativePath));

  // 1. Defensa contra Path Traversal (evita accesos con ".." o fuera de uploads/)
  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Whitelist estricta de extensiones permitidas (solo imágenes)
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const data = await fs.promises.readFile(filePath);

    let contentType = 'application/octet-stream';
    if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.avif') contentType = 'image/avif';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
