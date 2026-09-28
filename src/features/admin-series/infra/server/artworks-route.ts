import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/features/admin-auth/auth';
import { getArtworksBySeries, getArtworkById, createArtwork, updateArtwork, deleteArtwork, reorderArtworks } from '@/lib/db';

export async function GET(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const seriesId = searchParams.get('seriesId');
  const id = searchParams.get('id');

  if (id) {
    const artwork = await getArtworkById(Number(id));
    return NextResponse.json(artwork || null);
  }

  if (seriesId) {
    const list = await getArtworksBySeries(Number(seriesId));
    return NextResponse.json(list);
  }

  return NextResponse.json({ error: 'seriesId o id requerido' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    if (Array.isArray(body.orderedIds)) {
      const seriesId = Number(body.seriesId);
      const orderedIds = (body.orderedIds as unknown[]).map((id) => Number(id));

      if (!Number.isInteger(seriesId) || seriesId <= 0 || orderedIds.some((id) => !Number.isInteger(id) || id <= 0)) {
        return NextResponse.json({ error: 'Serie u orden de obras inválido' }, { status: 400 });
      }

      await reorderArtworks(seriesId, orderedIds);
      return NextResponse.json({ success: true });
    }

    const { seriesId, title, year, imagePath, imageUrl } = body;

    if (!seriesId) {
      return NextResponse.json({ error: 'seriesId es requerido' }, { status: 400 });
    }

    const existingArtworks = await getArtworksBySeries(Number(seriesId));
    const newId = await createArtwork({
      seriesId: Number(seriesId),
      title: title || 'Sin título',
      year,
      imagePath: imagePath === undefined ? imageUrl : imagePath,
      displayOrder: existingArtworks.length + 1
    });

    return NextResponse.json({ success: true, id: newId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al crear obra' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, seriesId, title, year, imagePath, imageUrl } = body;

    if (!id || !seriesId) {
      return NextResponse.json({ error: 'ID y seriesId son requeridos' }, { status: 400 });
    }

    await updateArtwork(Number(id), {
      seriesId: Number(seriesId),
      title: title || 'Sin título',
      year,
      imagePath: imagePath === undefined ? imageUrl : imagePath,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al actualizar obra' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de obra requerido' }, { status: 400 });
    }

    await deleteArtwork(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al eliminar obra' }, { status: 500 });
  }
}
