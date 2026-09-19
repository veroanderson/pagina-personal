import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getManifesto, updateManifesto } from '@/lib/db';

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
    const { statementText, imagePath1, imagePath2, imageUrl1, imageUrl2 } = body;

    if (typeof statementText !== 'string') {
      return NextResponse.json({ error: 'statementText es requerido' }, { status: 400 });
    }

    await updateManifesto(
      statementText,
      imagePath1 === undefined ? imageUrl1 : imagePath1,
      imagePath2 === undefined ? imageUrl2 : imagePath2,
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar manifiesto' }, { status: 500 });
  }
}
