import { useState, useEffect } from 'react';
import { getStorageImages, getStorageImage } from '../services/storageService';

/**
 * Load all images from a Firebase Storage folder.
 * Returns fallbacks immediately while fetching, then swaps to Firebase URLs.
 *
 * @param {string} folder  - Storage folder path e.g. 'hero'
 * @param {string[]} fallbacks - Unsplash / static URLs to show if folder is empty
 */
export function useStorageImages(folder, fallbacks = []) {
  const [images, setImages] = useState(fallbacks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStorageImages(folder, fallbacks).then((urls) => {
      if (!cancelled) {
        setImages(urls);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [folder]); // eslint-disable-line react-hooks/exhaustive-deps

  return { images, loading };
}

/**
 * Load a single image from a Firebase Storage path.
 * Returns fallback immediately while fetching.
 *
 * @param {string} path     - Storage file path e.g. 'wildlife/landscape.jpg'
 * @param {string} fallback - URL to show if file is not found
 */
export function useStorageImage(path, fallback = '') {
  const [src, setSrc] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStorageImage(path, fallback).then((url) => {
      if (!cancelled) {
        setSrc(url);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  return { src, loading };
}
