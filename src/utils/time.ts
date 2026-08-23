// All 4 backend services serialize timestamps as plain Java LocalDateTime
// (e.g. "2026-08-23T09:43:32.242294") — no "Z" or offset suffix. A string
// like that is genuinely ambiguous per the JS Date spec, and browsers parse
// it as LOCAL time rather than UTC, even though the server means UTC. For
// any viewer not in UTC, that silently shifts every timestamp by their
// timezone offset — sometimes pushing "just created" posts into the
// apparent future, which is what produced the "-24014s" type readouts.
export const parseServerTimestamp = (timestamp: string): Date => {
  const hasZoneInfo = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(timestamp);
  return new Date(hasZoneInfo ? timestamp : `${timestamp}Z`);
};

/** "5s" / "12m" / "3h" / "2d" / a locale date past a week — used in compact contexts (post/comment rows). */
export const timeAgo = (timestamp: string): string => {
  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - parseServerTimestamp(timestamp).getTime()) / 1000)
  );
  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return parseServerTimestamp(timestamp).toLocaleDateString();
};

/** "just now" / "12m ago" / "3h ago" / "2d ago" — used in prose contexts (story viewer). */
export const timeAgoLong = (timestamp: string): string => {
  const diffInSeconds = Math.max(
    0,
    Math.floor((Date.now() - parseServerTimestamp(timestamp).getTime()) / 1000)
  );
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};
