import { getForkRefreshIntervalMs } from '@/config/fork-refresh';
import { hasStaticMirrorLiveApi, isStaticWebMirror } from '@/services/static-mirror';

/** No slowdown multiplier — fork uses explicit 5-minute hot refresh instead. */
export function getStaticMirrorRefreshMultiplier(): number {
  return 1;
}

export function scaleRefreshIntervalMs(intervalMs: number, task = 'default'): number {
  return getForkRefreshIntervalMs(task, intervalMs);
}

/** Parallel RSS loads — conservative on GitHub Pages to keep scroll smooth. */
export function getStaticMirrorNewsCategoryConcurrency(defaultConcurrency: number): number {
  if (!isStaticWebMirror()) return defaultConcurrency;
  if (hasStaticMirrorLiveApi()) return Math.min(2, defaultConcurrency);
  return Math.min(2, defaultConcurrency);
}

export function getStaticMirrorPerFeedBatchSize(defaultBatchSize: number): number {
  if (!isStaticWebMirror()) return defaultBatchSize;
  return hasStaticMirrorLiveApi() ? Math.min(2, defaultBatchSize) : 2;
}

/** Health polling is expensive on static hosting — skip unless debugging live API. */
export function shouldRunHealthFreshnessRefresh(): boolean {
  return !isStaticWebMirror();
}

const FORK_PRIME_BATCH_SIZE = 3;
const FORK_PRIME_BATCH_GAP_MS = 200;

/** Run off-screen panel fetches in small batches so the main thread stays responsive. */
export async function runStaggeredForkTasks(
  tasks: Array<() => Promise<unknown>>,
): Promise<void> {
  for (let i = 0; i < tasks.length; i += FORK_PRIME_BATCH_SIZE) {
    const batch = tasks.slice(i, i + FORK_PRIME_BATCH_SIZE);
    await Promise.allSettled(batch.map((task) => task()));
    if (i + FORK_PRIME_BATCH_SIZE < tasks.length) {
      await new Promise((resolve) => { setTimeout(resolve, FORK_PRIME_BATCH_GAP_MS); });
    }
  }
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