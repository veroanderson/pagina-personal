import { getSupabaseAdmin } from './supabase-server';
import { publicImageUrl, removeStorageObject } from './storage';
import type { Database } from './database.types';

type ManifestoRow = Database['public']['Tables']['manifesto']['Row'];
type BioRow = Database['public']['Tables']['bio']['Row'];
type SeriesRow = Database['public']['Tables']['series']['Row'];
type ArtworkRow = Database['public']['Tables']['artworks']['Row'];
type ContactRequestRow = Database['public']['Tables']['contact_requests']['Row'];

export interface Manifesto {
  id: number;
  statementText: string;
  imagePath1?: string | null;
  imagePath2?: string | null;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
}

export interface Series {
  id: number;
  title: string;
  slug: string;
  essayText?: string | null;
  displayOrder: number;
  isActive: number;
  createdAt: string;
  deletedAt?: string | null;
}

export interface Artwork {
  id: number;
  seriesId: number;
  title: string;
  year?: string | null;
  technique: string;
  heightCm?: number | null;
  widthCm?: number | null;
  availability: 'disponible' | 'coleccion_privada' | 'no_disponible';
  imageUrl?: string | null;
  microstory?: string | null;
  displayOrder: number;
  createdAt: string;
  deletedAt?: string | null;
  imagePath?: string | null;
}

export interface Bio {
  id: number;
  bioText: string;
}

export interface ContactRequest {
  id: number;
  name: string;
  email: string;
  requestType: string;
  details: string;
  isRead: number;
  createdAt: string;
  deletedAt?: string | null;
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function mapManifesto(row: ManifestoRow): Manifesto {
  return {
    id: row.id,
    statementText: row.statement_text,
    imagePath1: row.image_path_1,
    imagePath2: row.image_path_2,
    imageUrl1: publicImageUrl(row.image_path_1),
    imageUrl2: publicImageUrl(row.image_path_2),
  };
}

function mapBio(row: BioRow): Bio {
  return { id: row.id, bioText: row.bio_text };
}

function mapSeries(row: SeriesRow): Series {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    essayText: row.essay_text,
    displayOrder: row.display_order,
    isActive: row.is_active ? 1 : 0,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

function mapArtwork(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    seriesId: row.series_id,
    title: row.title,
    year: row.year,
    technique: row.technique,
    heightCm: row.height_cm === null ? null : Number(row.height_cm),
    widthCm: row.width_cm === null ? null : Number(row.width_cm),
    availability: row.availability,
    imageUrl: publicImageUrl(row.image_path),
    imagePath: row.image_path,
    microstory: row.microstory,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

function mapContactRequest(row: ContactRequestRow): ContactRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    requestType: row.request_type,
    details: row.details,
    isRead: row.is_read ? 1 : 0,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}

// --- MANIFESTO ---

export async function getManifesto(): Promise<Manifesto> {
  const { data, error } = await getSupabaseAdmin()
    .from('manifesto')
    .select('id, statement_text, image_path_1, image_path_2')
    .eq('id', 1)
    .maybeSingle();

  throwIfError(error);
  return data ? mapManifesto(data) : { id: 1, statementText: '', imageUrl1: null, imageUrl2: null };
}

export async function updateManifesto(
  statementText: string,
  imagePath1?: string | null,
  imagePath2?: string | null,
): Promise<void> {
  const current = await getManifesto();
  const nextImagePath1 = imagePath1 === undefined ? current.imagePath1 ?? null : imagePath1;
  const nextImagePath2 = imagePath2 === undefined ? current.imagePath2 ?? null : imagePath2;
  const { error } = await getSupabaseAdmin().from('manifesto').upsert(
    {
      id: 1,
      statement_text: statementText,
      image_path_1: nextImagePath1,
      image_path_2: nextImagePath2,
    },
    { onConflict: 'id' },
  );

  throwIfError(error);

  for (const [oldPath, newPath] of [
    [current.imagePath1, nextImagePath1],
    [current.imagePath2, nextImagePath2],
  ] as Array<[string | null | undefined, string | null]>) {
    if (oldPath && oldPath !== newPath) {
      try {
        await removeStorageObject(oldPath);
      } catch (cleanupError) {
        console.warn('No se pudo eliminar la imagen anterior del Storage:', cleanupError);
      }
    }
  }
}

// --- SERIES ---

export async function getSeries(includeInactive = false): Promise<Series[]> {
  let query = getSupabaseAdmin()
    .from('series')
    .select('*')
    .is('deleted_at', null)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  if (!includeInactive) query = query.eq('is_active', true);

  const { data, error } = await query;
  throwIfError(error);
  return (data ?? []).map(mapSeries);
}

export async function getSeriesBySlug(slug: string): Promise<Series | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .eq('is_active', true)
    .maybeSingle();

  throwIfError(error);
  return data ? mapSeries(data) : undefined;
}

export async function getSeriesById(id: number): Promise<Series | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  throwIfError(error);
  return data ? mapSeries(data) : undefined;
}

export async function createSeries(
  title: string,
  slug: string,
  essayText?: string,
  displayOrder = 0,
  isActive = 1,
): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from('series')
    .insert({
      title,
      slug,
      essay_text: essayText || null,
      display_order: displayOrder,
      is_active: isActive === 1,
    })
    .select('id')
    .single();

  throwIfError(error);
  if (!data) throw new Error('Supabase no devolvió el ID de la serie');
  return data.id;
}

export async function updateSeries(
  id: number,
  title: string,
  slug: string,
  essayText?: string,
  displayOrder = 0,
  isActive = 1,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('series')
    .update({
      title,
      slug,
      essay_text: essayText || null,
      display_order: displayOrder,
      is_active: isActive === 1,
    })
    .eq('id', id)
    .is('deleted_at', null);

  throwIfError(error);
}

export async function deleteSeries(id: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('series')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  throwIfError(error);
}

// --- ARTWORKS ---

export async function getArtworksBySeries(seriesId: number): Promise<Artwork[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('artworks')
    .select('*')
    .eq('series_id', seriesId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });

  throwIfError(error);
  return (data ?? []).map(mapArtwork);
}

export async function getArtworkById(id: number): Promise<Artwork | undefined> {
  const { data, error } = await getSupabaseAdmin()
    .from('artworks')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  throwIfError(error);
  return data ? mapArtwork(data) : undefined;
}

export async function createArtwork(data: {
  seriesId: number;
  title: string;
  year?: string;
  technique: string;
  heightCm?: number;
  widthCm?: number;
  availability: 'disponible' | 'coleccion_privada' | 'no_disponible';
  imagePath?: string;
  microstory?: string;
  displayOrder?: number;
}): Promise<number> {
  const { data: row, error } = await getSupabaseAdmin()
    .from('artworks')
    .insert({
      series_id: data.seriesId,
      title: data.title || 'Sin título',
      year: data.year || null,
      technique: data.technique,
      height_cm: data.heightCm ?? null,
      width_cm: data.widthCm ?? null,
      availability: data.availability || 'disponible',
      image_path: data.imagePath || null,
      microstory: data.microstory || null,
      display_order: data.displayOrder ?? 0,
    })
    .select('id')
    .single();

  throwIfError(error);
  if (!row) throw new Error('Supabase no devolvió el ID de la obra');
  return row.id;
}

export async function updateArtwork(id: number, data: {
  seriesId: number;
  title: string;
  year?: string;
  technique: string;
  heightCm?: number;
  widthCm?: number;
  availability: 'disponible' | 'coleccion_privada' | 'no_disponible';
  imagePath?: string | null;
  microstory?: string;
  displayOrder?: number;
}): Promise<void> {
  const current = await getArtworkById(id);
  const { error } = await getSupabaseAdmin()
    .from('artworks')
    .update({
      series_id: data.seriesId,
      title: data.title || 'Sin título',
      year: data.year || null,
      technique: data.technique,
      height_cm: data.heightCm ?? null,
      width_cm: data.widthCm ?? null,
      availability: data.availability,
      image_path: data.imagePath || null,
      microstory: data.microstory || null,
      display_order: data.displayOrder ?? 0,
    })
    .eq('id', id)
    .is('deleted_at', null);

  throwIfError(error);

  if (current?.imagePath && current.imagePath !== (data.imagePath || null)) {
    try {
      await removeStorageObject(current.imagePath);
    } catch (cleanupError) {
      console.warn('No se pudo eliminar la imagen anterior del Storage:', cleanupError);
    }
  }
}

export async function deleteArtwork(id: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('artworks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  throwIfError(error);
}

// --- BIO ---

export async function getBio(): Promise<Bio> {
  const { data, error } = await getSupabaseAdmin()
    .from('bio')
    .select('id, bio_text')
    .eq('id', 1)
    .maybeSingle();

  throwIfError(error);
  return data ? mapBio(data) : { id: 1, bioText: '' };
}

export async function updateBio(bioText: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('bio')
    .upsert({ id: 1, bio_text: bioText }, { onConflict: 'id' });

  throwIfError(error);
}

// --- CONTACT REQUESTS ---

export async function createContactRequest(
  name: string,
  email: string,
  requestType: string,
  details: string,
): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from('contact_requests')
    .insert({ name, email, request_type: requestType, details, is_read: false })
    .select('id')
    .single();

  throwIfError(error);
  if (!data) throw new Error('Supabase no devolvió el ID del contacto');
  return data.id;
}

export async function getContactRequests(): Promise<ContactRequest[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('contact_requests')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false });

  throwIfError(error);
  return (data ?? []).map(mapContactRequest);
}

export async function getUnreadContactCount(): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from('contact_requests')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)
    .is('deleted_at', null);

  throwIfError(error);
  return count ?? 0;
}

export async function markContactAsRead(id: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('contact_requests')
    .update({ is_read: true })
    .eq('id', id)
    .is('deleted_at', null);

  throwIfError(error);
}

export async function deleteContactRequest(id: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('contact_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);

  throwIfError(error);
}

// --- SETTINGS ---

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const { data, error } = await getSupabaseAdmin()
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  throwIfError(error);
  return data?.value ?? defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });

  throwIfError(error);
}
