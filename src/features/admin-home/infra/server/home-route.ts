import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/features/admin-auth/auth';
import { getManifesto, updateManifesto } from '@/lib/db';

const TITLE_POSITIONS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

export async function GET(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const manifesto = await getManifesto();
  return NextResponse.json(manifesto);
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { eyebrow, title, imageSrc, imageAlt, titlePosition } = body;

    if ([eyebrow, title, imageAlt].some((value) => typeof value !== 'string')) {
      return NextResponse.json({ error: 'eyebrow, title e imageAlt son requeridos' }, { status: 400 });
    }
    if (imageSrc !== null && typeof imageSrc !== 'string') {
      return NextResponse.json({ error: 'imageSrc debe ser texto o null' }, { status: 400 });
    }
    if (!TITLE_POSITIONS.includes(titlePosition)) {
      return NextResponse.json({ error: 'titlePosition no es válido' }, { status: 400 });
    }

    await updateManifesto({ eyebrow, title, imageSrc, imageAlt, titlePosition });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar manifiesto' }, { status: 500 });
  }
}
