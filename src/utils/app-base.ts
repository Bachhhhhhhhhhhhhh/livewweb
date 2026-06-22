const RAW_BASE = import.meta.env.BASE_URL || '/';

function normalizeBase(base: string): string {
  if (!base || base === '/') return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export const APP_BASE_PATH = normalizeBase(RAW_BASE);

/** Prefix an absolute app path with the Vite base (e.g. /livewweb). */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  if (!APP_BASE_PATH) return path;
  return `${APP_BASE_PATH}${path}`;
}