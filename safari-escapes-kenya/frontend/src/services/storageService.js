import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

// In-memory cache to avoid repeated Firebase calls on the same session
const _cache = {};

/**
 * Fetch all image download URLs from a Firebase Storage folder.
 * Images are sorted by name for consistent ordering.
 * Falls back to `fallbacks` array if the folder is empty or unreachable.
 *
 * Upload folder conventions:
 *   hero/        → Hero banner slideshow images
 *   strip/       → Scrolling image strip (bottom of hero)
 *   gallery/     → Bento gallery section
 *   wildlife/    → Wildlife strip landscape image
 *   packages/    → Package card images (set via admin panel)
 *   team/        → About Us team member photos
 *   misc/        → Login/Signup backgrounds, misc images
 */
export async function getStorageImages(folder, fallbacks = []) {
  if (_cache[folder]) return _cache[folder];
  try {
    const folderRef = ref(storage, folder);
    const result = await listAll(folderRef);
    if (result.items.length === 0) return fallbacks;
    const urls = await Promise.all(
      result.items
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((item) => getDownloadURL(item))
    );
    _cache[folder] = urls;
    return urls;
  } catch (err) {
    console.warn(`[Storage] Could not load folder "${folder}", using fallbacks.`, err.message);
    return fallbacks;
  }
}

/**
 * Fetch a single image download URL from a specific Firebase Storage path.
 * Falls back to `fallback` string if not found.
 */
export async function getStorageImage(path, fallback = '') {
  if (_cache[path]) return _cache[path];
  try {
    const fileRef = ref(storage, path);
    const url = await getDownloadURL(fileRef);
    _cache[path] = url;
    return url;
  } catch (err) {
    console.warn(`[Storage] Could not load "${path}", using fallback.`, err.message);
    return fallback;
  }
}
