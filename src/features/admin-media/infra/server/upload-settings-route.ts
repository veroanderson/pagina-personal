import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db';
import { getDiskUsage } from '@/lib/disk';
import { requireSession } from '@/features/admin-auth/auth';
import { bodyTooLarge } from '@/lib/http';

const DATA_DIR = process.env.DATABASE_PATH ? path.dirname(process.env.DATABASE_PATH) : './data';
const MAX_BODY_BYTES = 4 * 1024;

export async function GET() {
  const unauthorized = requireSession();
  if (unauthorized) return unauthorized;

  const webpEnabled = (await getSetting('uploads.webpEnabled', 'true')) === 'true';
  const quality = Number(await getSetting('uploads.quality', '75'));
  const disk = getDiskUsage(DATA_DIR);

  return NextResponse.json({ success: true, webpEnabled, quality, disk });
}

export async function PUT(request: NextRequest) {
  const unauthorized = requireSession();
  if (unauthorized) return unauthorized;

  if (bodyTooLarge(request, MAX_BODY_BYTES)) {
    return NextResponse.json({ success: false, message: 'Payload demasiado grande' }, { status: 413 });
  }

  let body: { webpEnabled?: unknown; quality?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, message: 'JSON inválido' }, { status: 400 });
  }

  const { webpEnabled, quality } = body;

  if (typeof webpEnabled !== 'boolean') {
    return NextResponse.json({ success: false, message: 'webpEnabled inválido' }, { status: 400 });
  }
  if (typeof quality !== 'number' || !Number.isFinite(quality) || quality < 40 || quality > 95) {
    return NextResponse.json({ success: false, message: 'quality debe estar entre 40 y 95' }, { status: 400 });
  }

  await setSetting('uploads.webpEnabled', String(webpEnabled));
  await setSetting('uploads.quality', String(Math.round(quality)));

  return NextResponse.json({ success: true });
}
