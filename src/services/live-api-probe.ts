import { FORK_LIVE_API_URL } from '@/config/fork-api';

/** Inline mirror checks — avoids circular import with static-mirror.ts */
function isStaticMirrorHost(): boolean {
  if (import.meta.env.VITE_STATIC_MIRROR === '1') return true;
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.github.io');
}

function hasConfiguredLiveApi(): boolean {
  return (import.meta.env.VITE_WS_API_URL?.length ?? 0) > 0;
}

const PROBE_TTL_MS = 5 * 60 * 1000;
const PROBE_TIMEOUT_MS = 2_500;

let lastProbeAt = 0;
let liveApiReachable: boolean | null = null;
let probeInFlight: Promise<boolean> | null = null;

function getProbeUrl(): string {
  const configured = import.meta.env.VITE_WS_API_URL?.trim();
  return configured || FORK_LIVE_API_URL;
}

/** Cached reachability — false until the first probe completes on static mirror. */
export function isLiveApiReachable(): boolean {
  if (!isStaticMirrorHost() || !hasConfiguredLiveApi()) return false;
  return liveApiReachable === true;
}

export function invalidateLiveApiProbe(): void {
  liveApiReachable = null;
  lastProbeAt = 0;
  probeInFlight = null;
}

/** HEAD-ish health check against the Cloudflare Worker proxy (fast, no body). */
export async function probeLiveApiReachable(force = false): Promise<boolean> {
  if (!isStaticMirrorHost() || !hasConfiguredLiveApi()) {
    liveApiReachable = false;
    return false;
  }

  const now = Date.now();
  if (!force && liveApiReachable !== null && now - lastProbeAt < PROBE_TTL_MS) {
    return liveApiReachable;
  }
  if (!force && probeInFlight) return probeInFlight;

  probeInFlight = (async () => {
    try {
      const res = await fetch(`${getProbeUrl()}/api/health`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'omit',
        signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      });
      liveApiReachable = res.ok;
    } catch {
      liveApiReachable = false;
    }
    lastProbeAt = Date.now();
    probeInFlight = null;
    if (!liveApiReachable) {
      console.warn('[live-api] Proxy unreachable — using baked seed + offline fallbacks');
    }
    return liveApiReachable;
  })();

  return probeInFlight;
}