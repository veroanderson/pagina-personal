import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getBio, updateBio } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const bio = await getBio();
  return NextResponse.json(bio);
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { bioText } = body;

    if (typeof bioText !== 'string') {
      return NextResponse.json({ error: 'bioText es requerido' }, { status: 400 });
    }

    await updateBio(bioText);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar bio' }, { status: 500 });
  }
}
