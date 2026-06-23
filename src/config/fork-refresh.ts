import { hasStaticMirrorLiveApi, isStaticWebMirror } from '@/services/static-mirror';

/** Hot refresh cadence for the GitHub Pages fork (news + intelligence). */
export const FORK_HOT_REFRESH_MS = 5 * 60 * 1000;

/**
 * Effective poll interval on *.github.io — cap at 5 minutes so panels stay current.
 * With the live API proxy, fetches hit upstream; without it, baked seed polling still runs.
 */
export function getForkRefreshIntervalMs(task: string, baseMs: number): number {
  if (!isStaticWebMirror()) return baseMs;
  if (hasStaticMirrorLiveApi()) return Math.min(baseMs, FORK_HOT_REFRESH_MS);
  // Static-only: still refresh news/digest/bootstrap seeds every 5 min.
  if (task === 'news' || task === 'bootstrap' || task === 'digest' || task === 'insights') {
    return FORK_HOT_REFRESH_MS;
  }
  return Math.min(baseMs, FORK_HOT_REFRESH_MS);
}