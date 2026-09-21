import 'server-only';

import type { Database } from '@/lib/database.types';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import type {
  BiographySection,
  BiographySectionInput,
} from '../types/biography';
import { BiographySectionNotFoundError } from '../services/biography-validation';

type BiographySectionRow = Database['public']['Tables']['biography_sections']['Row'];

const BIOGRAPHY_SECTION_FIELDS = 'id, subtitle, body_text, heading_level, display_order, is_active, created_at, updated_at, deleted_at';

function mapBiographySection(row: BiographySectionRow): BiographySection {
  return {
    id: row.id,
    subtitle: row.subtitle,
    bodyText: row.body_text,
    headingLevel: row.heading_level,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function toRow(input: BiographySectionInput) {
  return {
    subtitle: input.subtitle ?? null,
    body_text: input.bodyText,
    heading_level: input.headingLevel,
    is_active: input.isActive,
  };
}

export async function listBiographySections(includeInactive = false): Promise<BiographySection[]> {
  let query = getSupabaseAdmin()
    .from('biography_sections')
    .select(BIOGRAPHY_SECTION_FIELDS)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapBiographySection);
}

export async function createBiographySection(
  input: BiographySectionInput,
  displayOrder: number,
): Promise<BiographySection> {
  const { data, error } = await getSupabaseAdmin()
    .from('biography_sections')
    .insert({ ...toRow(input), display_order: displayOrder })
    .select(BIOGRAPHY_SECTION_FIELDS)
    .single();

  if (error) throw new Error(error.message);
  return mapBiographySection(data);
}

export async function updateBiographySection(
  id: number,
  input: BiographySectionInput,
): Promise<BiographySection> {
  const { data, error } = await getSupabaseAdmin()
    .from('biography_sections')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select(BIOGRAPHY_SECTION_FIELDS)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new BiographySectionNotFoundError();
  return mapBiographySection(data);
}

export async function softDeleteBiographySection(id: number): Promise<void> {
  const { data, error } = await getSupabaseAdmin()
    .from('biography_sections')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new BiographySectionNotFoundError();
}

export async function reorderBiographySections(orderedIds: number[]): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc('reorder_biography_sections', {
    p_ordered_ids: orderedIds,
  });

  if (error) throw new Error(error.message);
}
