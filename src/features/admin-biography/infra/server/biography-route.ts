import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/features/admin-auth/auth';
import {
  biographyService,
  BiographySectionNotFoundError,
  BiographyValidationError,
  isBiographyHeadingLevel,
} from '@/features/biography/server';
import type { BiographySectionInput } from '@/features/biography/types/biography';

function parseSectionInput(body: unknown): BiographySectionInput {
  if (!body || typeof body !== 'object') {
    throw new BiographyValidationError('El cuerpo de la solicitud no es válido');
  }

  const value = body as Record<string, unknown>;
  const headingLevel = value.headingLevel ?? 'large';
  const isActive = value.isActive ?? true;

  if (typeof value.bodyText !== 'string') {
    throw new BiographyValidationError('El texto de la sección es obligatorio');
  }

  if (value.subtitle !== undefined && value.subtitle !== null && typeof value.subtitle !== 'string') {
    throw new BiographyValidationError('El subtítulo no es válido');
  }

  if (!isBiographyHeadingLevel(headingLevel) || typeof isActive !== 'boolean') {
    throw new BiographyValidationError('La jerarquía o visibilidad no son válidas');
  }

  return {
    subtitle: value.subtitle as string | null | undefined,
    bodyText: value.bodyText,
    headingLevel,
    isActive,
  };
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new BiographyValidationError('El cuerpo de la solicitud no es un JSON válido');
  }
}

function parseObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BiographyValidationError('El cuerpo de la solicitud no es válido');
  }
  return body as Record<string, unknown>;
}

function parseId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BiographyValidationError('El ID de la sección no es válido');
  }
  return id;
}

function errorResponse(error: unknown) {
  if (error instanceof BiographyValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof BiographySectionNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  const message = error instanceof Error ? error.message : 'Error interno al administrar la biografía';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET() {
  const authError = requireSession();
  if (authError) return authError;

  try {
    return NextResponse.json({ sections: await biographyService.getAdminSections() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const section = await biographyService.createSection(parseSectionInput(await readJson(req)));
    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = parseObject(await readJson(req));
    const section = await biographyService.updateSection(
      parseId(body.id),
      parseSectionInput(body),
    );
    return NextResponse.json({ section });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    const body = parseObject(await readJson(req));
    if (!Array.isArray(body.orderedIds)) {
      throw new BiographyValidationError('La lista de orden es obligatoria');
    }

    await biographyService.reorderSections(body.orderedIds.map((id) => parseId(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(req: NextRequest) {
  const authError = requireSession();
  if (authError) return authError;

  try {
    await biographyService.deleteSection(parseId(new URL(req.url).searchParams.get('id')));
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
