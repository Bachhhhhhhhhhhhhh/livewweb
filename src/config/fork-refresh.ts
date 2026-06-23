import { hasStaticMirrorLiveApi, isStaticWebMirror } from '@/services/static-mirror';

/** Hot refresh cadence for the GitHub Pages fork (news + intelligence). */
export const FORK_HOT_REFRESH_MS = 5 * 60 * 1000;

const HOT_REFRESH_TASKS = new Set([
  'news',
  'bootstrap',
  'digest',
  'insights',
]);

/**
 * Effective poll interval on *.github.io.
 * Only news/insights/digest/bootstrap run every 5 min — other panels keep
 * their native cadence to avoid background churn (markets, FRED, etc.).
 */
export function getForkRefreshIntervalMs(task: string, baseMs: number): number {
  if (!isStaticWebMirror()) return baseMs;
  if (HOT_REFRESH_TASKS.has(task)) return FORK_HOT_REFRESH_MS;
  // Slightly relax health polling when live API is available.
  if (task === 'health-freshness' && hasStaticMirrorLiveApi()) {
    return Math.max(baseMs, FORK_HOT_REFRESH_MS);
  }
  return baseMs;
}