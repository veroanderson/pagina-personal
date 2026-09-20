import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/features/admin-auth/auth';
import { getContactRequests, markContactAsRead, deleteContactRequest } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const contacts = await getContactRequests();
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    if (action === 'markRead') {
      await markContactAsRead(Number(id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error en contacto' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await deleteContactRequest(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar contacto' }, { status: 500 });
  }
}
