import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getArtworksBySeries, getArtworkById, createArtwork, updateArtwork, deleteArtwork } from '@/lib/db';

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
    const { seriesId, title, year, technique, heightCm, widthCm, availability, imagePath, imageUrl, microstory, displayOrder } = body;

    if (!seriesId || !technique) {
      return NextResponse.json({ error: 'seriesId y técnica son requeridos' }, { status: 400 });
    }

    const validAvailability = ['disponible', 'coleccion_privada', 'no_disponible'].includes(availability)
      ? availability
      : 'disponible';

    const newId = await createArtwork({
      seriesId: Number(seriesId),
      title: title || 'Sin título',
      year,
      technique,
      heightCm: heightCm ? Number(heightCm) : undefined,
      widthCm: widthCm ? Number(widthCm) : undefined,
      availability: validAvailability,
      imagePath: imagePath === undefined ? imageUrl : imagePath,
      microstory,
      displayOrder: Number(displayOrder) || 0
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
    const { id, seriesId, title, year, technique, heightCm, widthCm, availability, imagePath, imageUrl, microstory, displayOrder } = body;

    if (!id || !seriesId || !technique) {
      return NextResponse.json({ error: 'ID, seriesId y técnica son requeridos' }, { status: 400 });
    }

    const validAvailability = ['disponible', 'coleccion_privada', 'no_disponible'].includes(availability)
      ? availability
      : 'disponible';

    await updateArtwork(Number(id), {
      seriesId: Number(seriesId),
      title: title || 'Sin título',
      year,
      technique,
      heightCm: heightCm ? Number(heightCm) : undefined,
      widthCm: widthCm ? Number(widthCm) : undefined,
      availability: validAvailability,
      imagePath: imagePath === undefined ? imageUrl : imagePath,
      microstory,
      displayOrder: Number(displayOrder) || 0
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
