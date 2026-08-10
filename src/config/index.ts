function joinUrl(...parts: string[]) {
  return parts
    .filter((p) => p != null && String(p).length > 0)
    .map((p, i) => {
      const s = String(p).trim();
      if (i === 0) return s.replace(/\/+$/, '');
      return s.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

const rawBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();

/** API root ending in `/api` (no double slashes). Empty → relative `/api` via Vite proxy. */
export const baseUrl = rawBase ? joinUrl(rawBase, 'api') : '/api';

export const CURRENT_APP_ID = 'social-deck';
