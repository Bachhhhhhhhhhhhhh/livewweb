/**
 * Fork-wide unlock for Brian's GitHub Pages deployment.
 * All Pro/Premium gates bypass when VITE_UNLOCK_ALL is set at build time
 * or when running on *.github.io (runtime detection).
 */
export function isForkUnlockAll(): boolean {
  if (import.meta.env.VITE_UNLOCK_ALL === '1') return true;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    return true;
  }
  return false;
}