import { supabase } from './supabase';

export const ACTIVITY_PHOTO_BUCKET = 'activity-photos';
export const MAX_SOURCE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateSourcePhoto(file: File): string | null {
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type)) {
    return 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.';
  }

  if (file.size > MAX_SOURCE_PHOTO_SIZE_BYTES) {
    return 'Ukuran file terlalu besar. Maksimal 5 MB.';
  }

  return null;
}

export function getFileExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'jpg';
  }
}

export function buildActivityPhotoStoragePath(userId: string, photoId: string, extension: string): string {
  const timestamp = Date.now();
  return `${userId}/activity-photos/${photoId}/${timestamp}.${extension}`;
}

export function getPublicPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from(ACTIVITY_PHOTO_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function uploadPhotoToStorage(storagePath: string, file: File): Promise<string | null> {
  const { error } = await supabase.storage.from(ACTIVITY_PHOTO_BUCKET).upload(storagePath, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  });

  return error?.message ?? null;
}

export async function deletePhotoFromStorage(storagePath: string): Promise<string | null> {
  const { error } = await supabase.storage.from(ACTIVITY_PHOTO_BUCKET).remove([storagePath]);
  return error?.message ?? null;
}

export function getStoragePathFromPhoto(photoUrl: string): string | null {
  try {
    const url = new URL(photoUrl);
    const marker = `/storage/v1/object/public/${ACTIVITY_PHOTO_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    if (!encodedPath) return null;
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}
