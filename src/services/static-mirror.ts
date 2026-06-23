import { APP_BASE_PATH } from '@/utils/app-base';

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

/** True when the static mirror build has a live API proxy (VITE_WS_API_URL). */
export function hasStaticMirrorLiveApi(): boolean {
  return isStaticWebMirror() && Boolean(import.meta.env.VITE_WS_API_URL);
}

/** Live RPC/API refresh (not only baked seed) — enabled on web and GitHub Pages with proxy. */
export function shouldUseLiveApiFetch(): boolean {
  return !isStaticWebMirror() || hasStaticMirrorLiveApi();
}