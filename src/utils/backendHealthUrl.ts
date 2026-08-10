/** Master backend serves GET / with a JSON body; use API origin for health checks. */
export function resolveBackendHealthUrl(): string | null {
  const explicit = import.meta.env.VITE_API_HEALTH_URL;
  if (explicit) return String(explicit);
  const base =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined) ||
    '';
  if (!base) return null;
  try {
    return new URL(base).origin + '/';
  } catch {
    return null;
  }
}
