import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getSeries, createSeries, updateSeries, deleteSeries } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const seriesList = await getSeries(true); // Include inactive series for admin
  return NextResponse.json(seriesList);
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { title, slug, essayText, displayOrder, isActive } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Título y slug son obligatorios' }, { status: 400 });
    }

    // Clean slug
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const newId = await createSeries(title, cleanSlug, essayText, Number(displayOrder) || 0, isActive ? 1 : 0);

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al crear serie' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, title, slug, essayText, displayOrder, isActive } = body;

    if (!id || !title || !slug) {
      return NextResponse.json({ error: 'ID, Título y slug son obligatorios' }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    await updateSeries(Number(id), title, cleanSlug, essayText, Number(displayOrder) || 0, isActive ? 1 : 0);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar serie' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de serie requerido' }, { status: 400 });
    }

    await deleteSeries(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar serie' }, { status: 500 });
  }
}
