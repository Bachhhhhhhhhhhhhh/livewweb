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