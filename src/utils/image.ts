/**
 * Feed/group-post images live on Cloudflare R2 and come back as full public
 * URLs; profile pictures come from user-service as base64 (local-disk
 * storage). Treat anything that isn't already a data: URI or http(s) URL as
 * legacy base64 for backward compatibility, so we don't double-encode a
 * real URL into `data:image/png;base64,https://...` (which renders broken).
 */
export const resolveImageSrc = (raw?: string | null, fallback = ''): string => {
  if (!raw) return fallback;
  if (raw.startsWith('data:') || raw.startsWith('http')) return raw;
  return `data:image/png;base64,${raw}`;
};
