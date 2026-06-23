import { isStaticWebMirror } from '@/services/static-mirror';

/** Scale background refresh intervals on GitHub Pages to reduce network/CPU churn. */
export function getStaticMirrorRefreshMultiplier(): number {
  return isStaticWebMirror() ? 2 : 1;
}

export function scaleRefreshIntervalMs(intervalMs: number): number {
  const mult = getStaticMirrorRefreshMultiplier();
  return mult === 1 ? intervalMs : Math.round(intervalMs * mult);
}

/** Cap parallel RSS category loads on static mirrors (proxy relay is the bottleneck). */
export function getStaticMirrorNewsCategoryConcurrency(defaultConcurrency: number): number {
  if (!isStaticWebMirror()) return defaultConcurrency;
  return Math.min(1, defaultConcurrency);
}

export function getStaticMirrorPerFeedBatchSize(defaultBatchSize: number): number {
  return isStaticWebMirror() ? 1 : defaultBatchSize;
}

/** /api/health is unavailable on GitHub Pages — skip polling it. */
export function shouldRunHealthFreshnessRefresh(): boolean {
  return !isStaticWebMirror();
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