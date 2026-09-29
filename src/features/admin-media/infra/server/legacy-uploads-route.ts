import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_EXTENSIONS = new Set(['.webp', '.jpg', '.jpeg', '.png', '.svg', '.gif', '.avif']);

export async function GET(_request: NextRequest, { params }: { params: { path: string[] } }) {
  const fileRelativePath = params.path.join('/');
  const filePath = path.normalize(path.join(UPLOADS_ROOT, fileRelativePath));
  if (!filePath.startsWith(UPLOADS_ROOT + path.sep)) return new NextResponse('Forbidden', { status: 403 });

  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) return new NextResponse('Forbidden', { status: 403 });

  try {
    const data = await fs.promises.readFile(filePath);
    const contentTypeByExtension: Record<string, string> = {
      '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.svg': 'image/svg+xml', '.gif': 'image/gif', '.avif': 'image/avif',
    };
    return new NextResponse(data, { status: 200, headers: { 'Content-Type': contentTypeByExtension[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
