import 'server-only';

import { getSupabaseAdmin } from './supabase-server';

export const PORTFOLIO_IMAGES_BUCKET = 'portfolio-images';

function storageBucket() {
  return getSupabaseAdmin().storage.from(PORTFOLIO_IMAGES_BUCKET);
}

export function publicImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // Legacy local paths and already-public URLs remain readable while old
  // records are migrated gradually.
  if (imagePath.startsWith('/') || /^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  return storageBucket().getPublicUrl(imagePath).data.publicUrl;
}

export function storagePathFromValue(value: string | null | undefined): string | null {
  if (!value) return null;

  const publicMarker = `/storage/v1/object/public/${PORTFOLIO_IMAGES_BUCKET}/`;
  const markerIndex = value.indexOf(publicMarker);
  if (markerIndex >= 0) {
    const path = value.slice(markerIndex + publicMarker.length).split('?')[0];
    return path ? decodeURIComponent(path) : null;
  }

  // A bare value is the canonical Storage object path. Local URLs are not
  // Storage objects and must be left alone.
  if (value.startsWith('/') || /^https?:\/\//i.test(value)) return null;
  return value;
}

export async function removeStorageObject(value: string | null | undefined): Promise<void> {
  const storagePath = storagePathFromValue(value);
  if (!storagePath) return;

  const { error } = await storageBucket().remove([storagePath]);
  if (error) throw new Error(error.message);
}
