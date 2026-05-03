export function youtubeVideoIdFromUrl(url: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;

      const parts = u.pathname.split('/').filter(Boolean);
      const embedIdx = parts.indexOf('embed');
      if (embedIdx >= 0 && parts[embedIdx + 1] && /^[\w-]{11}$/.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
      const shortIdx = parts.indexOf('shorts');
      if (shortIdx >= 0 && parts[shortIdx + 1] && /^[\w-]{11}$/.test(parts[shortIdx + 1])) {
        return parts[shortIdx + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}
