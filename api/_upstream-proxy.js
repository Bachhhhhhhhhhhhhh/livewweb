/**
 * Server-side proxy to api.worldmonitor.app for live seeded data.
 * Mints an upstream wm-session cookie and forwards requests — bypasses
 * browser CORS limits on GitHub Pages / fork Vercel deployments.
 *
 * Premium RPC paths and chat-analyst stay on the local gateway (UNLOCK_ALL + Ollama/Groq).
 */

const UPSTREAM_ORIGIN = (process.env.UPSTREAM_API_URL || 'https://api.worldmonitor.app').replace(/\/$/, '');
const UPSTREAM_ORIGIN_HEADER = process.env.UPSTREAM_ORIGIN_HEADER || 'https://worldmonitor.app';
const BROWSER_UA = 'Mozilla/5.0 (compatible; WorldMonitor-Live/2.8; +https://worldmonitor.app)';

/** @type {string | null} */
let cachedCookie = null;
/** @type {number} */
let cookieExp = 0;

export function shouldUseUpstreamProxy() {
  return process.env.PROXY_TO_UPSTREAM_API === '1';
}

/** @param {string | null} setCookieHeader */
function parseSessionCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const segments = setCookieHeader.split(/,(?=\s*[^;,]+=)/);
  for (const segment of segments) {
    const match = segment.match(/(?:^|;\s*)([^=;]+)=([^;]+)/);
    if (!match) continue;
    const name = match[1].trim().toLowerCase();
    if (name.includes('session') || name.startsWith('wm')) {
      return `${match[1].trim()}=${match[2].trim()}`;
    }
  }
  return null;
}

async function ensureUpstreamSessionCookie() {
  if (cachedCookie && cookieExp > Date.now() + 60_000) return cachedCookie;
  const res = await fetch(`${UPSTREAM_ORIGIN}/api/wm-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': UPSTREAM_ORIGIN_HEADER,
      'User-Agent': BROWSER_UA,
    },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  cookieExp = typeof data.exp === 'number' ? data.exp : Date.now() + 12 * 3_600_000;
  cachedCookie = parseSessionCookie(res.headers.get('set-cookie'));
  return cachedCookie;
}

/**
 * @param {Request} request
 * @param {string} pathname
 * @param {Record<string, string>} corsHeaders
 */
export async function proxyToUpstream(request, pathname, corsHeaders) {
  const cookie = await ensureUpstreamSessionCookie();
  const srcUrl = new URL(request.url);
  const targetUrl = `${UPSTREAM_ORIGIN}${pathname}${srcUrl.search}`;

  const headers = new Headers();
  headers.set('User-Agent', BROWSER_UA);
  headers.set('Origin', UPSTREAM_ORIGIN_HEADER);
  if (cookie) headers.set('Cookie', cookie);

  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const accept = request.headers.get('accept');
  if (accept) headers.set('Accept', accept);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    duplex: hasBody ? 'half' : undefined,
  });

  const outHeaders = { ...corsHeaders };
  const upstreamCt = upstream.headers.get('content-type');
  if (upstreamCt) outHeaders['Content-Type'] = upstreamCt;
  const cacheControl = upstream.headers.get('cache-control');
  if (cacheControl) outHeaders['Cache-Control'] = cacheControl;

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}