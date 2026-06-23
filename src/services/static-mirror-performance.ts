import { getForkRefreshIntervalMs } from '@/config/fork-refresh';
import { hasStaticMirrorLiveApi, isStaticWebMirror } from '@/services/static-mirror';

/** No slowdown multiplier — fork uses explicit 5-minute hot refresh instead. */
export function getStaticMirrorRefreshMultiplier(): number {
  return 1;
}

export function scaleRefreshIntervalMs(intervalMs: number, task = 'default'): number {
  return getForkRefreshIntervalMs(task, intervalMs);
}

/** Parallel RSS loads — higher when live API proxy is available. */
export function getStaticMirrorNewsCategoryConcurrency(defaultConcurrency: number): number {
  if (!isStaticWebMirror()) return defaultConcurrency;
  if (hasStaticMirrorLiveApi()) return Math.min(3, defaultConcurrency);
  return Math.min(2, defaultConcurrency);
}

export function getStaticMirrorPerFeedBatchSize(defaultBatchSize: number): number {
  if (!isStaticWebMirror()) return defaultBatchSize;
  return hasStaticMirrorLiveApi() ? defaultBatchSize : 2;
}

/** Skip /api/health polling only when no live API proxy is configured. */
export function shouldRunHealthFreshnessRefresh(): boolean {
  return !isStaticWebMirror() || hasStaticMirrorLiveApi();
}

/** Defer heavy preload work until the browser is idle (faster first paint on static mirror). */
export function deferStaticMirrorIdleWork(task: () => void | Promise<void>): void {
  if (!isStaticWebMirror()) {
    void task();
    return;
  }
  const run = () => { void task(); };
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 150);
  }
}