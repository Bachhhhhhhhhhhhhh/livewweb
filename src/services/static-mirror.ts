import { APP_BASE_PATH } from '@/utils/app-base';
import { isLiveApiReachable } from '@/services/live-api-probe';

/** True for GitHub Pages and other subpath static mirrors. */
export function isStaticWebMirror(): boolean {
  if (import.meta.env.VITE_STATIC_MIRROR === '1') return true;
  if (typeof window === 'undefined') return APP_BASE_PATH !== '';
  return window.location.hostname.endsWith('.github.io');
}

export function shouldRegisterServiceWorker(): boolean {
  return !isStaticWebMirror() && APP_BASE_PATH === '';
}

/** Hide Clerk sign-in / create-account UI on GitHub Pages (all features unlocked locally). */
export function shouldShowAuthUi(): boolean {
  return !isStaticWebMirror();
}

/** Hide Good News / happy variant on the GitHub Pages fork. */
export function shouldShowHappyVariant(): boolean {
  return !isStaticWebMirror();
}

/** True when the static mirror build has a live API proxy (VITE_WS_API_URL). */
export function hasStaticMirrorLiveApi(): boolean {
  return isStaticWebMirror() && (import.meta.env.VITE_WS_API_URL?.length ?? 0) > 0;
}

/** Live RPC/API refresh — GitHub Pages only when the Worker proxy actually responds. */
export function shouldUseLiveApiFetch(): boolean {
  if (!isStaticWebMirror()) return true;
  return hasStaticMirrorLiveApi() && isLiveApiReachable();
}