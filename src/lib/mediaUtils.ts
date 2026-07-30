/**
 * Utility functions for handling media files and embedded video URLs (YouTube, Vimeo, MP4, etc.)
 */

export function isVideoMedia(src?: string): boolean {
  if (!src) return false;
  const clean = src.toLowerCase().split("?")[0];
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".ogg") ||
    clean.includes("youtube.com") ||
    clean.includes("youtu.be") ||
    clean.includes("vimeo.com") ||
    src.startsWith("data:video/")
  );
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0`;
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
