import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/features/admin-auth/auth';
import {
  createSeriesRecord,
  deleteSeriesRecord,
  getSeriesRecordById,
  getSeriesRecordsBySeries,
  updateSeriesRecord,
} from '@/lib/db';

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function validId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function parseInput(body: Record<string, unknown>) {
  const seriesId = Number(body.seriesId);
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const bodyText = typeof body.bodyText === 'string' ? body.bodyText.trim() : '';
  const imagePath = typeof body.imagePath === 'string' && body.imagePath.trim() ? body.imagePath.trim() : null;
  const entryDate = body.entryDate;

  if (!validId(seriesId) || !title || !validDate(entryDate)) return null;
  return { seriesId, title, bodyText, imagePath, entryDate };
}

export async function GET(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const seriesId = Number(searchParams.get('seriesId'));
  const id = searchParams.get('id');

  if (id) return NextResponse.json((await getSeriesRecordById(Number(id))) || null);
  if (validId(seriesId)) return NextResponse.json(await getSeriesRecordsBySeries(seriesId));
  return NextResponse.json({ error: 'seriesId o id requerido' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const input = parseInput(await req.json());
    if (!input) return NextResponse.json({ error: 'Título, serie y fecha válida son requeridos' }, { status: 400 });
    const id = await createSeriesRecord(input);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error al crear el registro' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = await req.json() as Record<string, unknown>;
    const id = Number(body.id);
    const input = parseInput(body);
    if (!validId(id) || !input) return NextResponse.json({ error: 'ID, título, serie y fecha válida son requeridos' }, { status: 400 });
    await updateSeriesRecord(id, input);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error al actualizar el registro' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!validId(id)) return NextResponse.json({ error: 'ID de registro requerido' }, { status: 400 });

  try {
    await deleteSeriesRecord(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error al eliminar el registro' }, { status: 500 });
  }
}
