import { isStaticWebMirror } from '@/services/static-mirror';

/** Scale background refresh intervals on GitHub Pages to reduce network/CPU churn. */
export function getStaticMirrorRefreshMultiplier(): number {
  return isStaticWebMirror() ? 1.5 : 1;
}

export function scaleRefreshIntervalMs(intervalMs: number): number {
  const mult = getStaticMirrorRefreshMultiplier();
  return mult === 1 ? intervalMs : Math.round(intervalMs * mult);
}

/** Cap parallel RSS category loads on static mirrors (proxy relay is the bottleneck). */
export function getStaticMirrorNewsCategoryConcurrency(defaultConcurrency: number): number {
  if (!isStaticWebMirror()) return defaultConcurrency;
  return Math.min(2, defaultConcurrency);
}

export function getStaticMirrorPerFeedBatchSize(defaultBatchSize: number): number {
  return isStaticWebMirror() ? 1 : defaultBatchSize;
}