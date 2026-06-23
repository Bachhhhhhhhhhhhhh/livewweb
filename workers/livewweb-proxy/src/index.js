/**
 * Live API proxy for GitHub Pages (bachhhhhhhhhhhhhh.github.io/livewweb).
 * - CORS for *.github.io and livewweb*.vercel.app
 * - Proxies /api/* to api.worldmonitor.app with wm-session cookie
 * - /api/chat-analyst streams via Groq when GROQ_API_KEY is set
 */

const UPSTREAM = 'https://api.worldmonitor.app';
const UPSTREAM_ORIGIN = 'https://worldmonitor.app';
const UA = 'Mozilla/5.0 (compatible; Livewweb-Proxy/2.8)';

const ALLOWED_ORIGINS = [
  /^https:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?\.github\.io$/,
  /^https:\/\/livewweb(-[a-z0-9-]+)?\.vercel\.app$/,
];

/** @type {string | null} */
let cachedCookie = null;
/** @type {number} */
let cookieExp = 0;

function corsHeaders(origin, methods = 'GET, POST, OPTIONS') {
  const allowed = origin && ALLOWED_ORIGINS.some((p) => p.test(origin));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'https://bachhhhhhhhhhhhhh.github.io',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': methods,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-WorldMonitor-Key, X-Api-Key',
    'Access-Control-Max-Age': '3600',
    Vary: 'Origin',
  };
}

function parseSessionCookie(setCookie) {
  if (!setCookie) return null;
  for (const segment of setCookie.split(/,(?=\s*[^;,]+=)/)) {
    const m = segment.match(/(?:^|;\s*)([^=;]+)=([^;]+)/);
    if (!m) continue;
    const name = m[1].trim().toLowerCase();
    if (name.includes('session') || name.startsWith('wm')) {
      return `${m[1].trim()}=${m[2].trim()}`;
    }
  }
  return null;
}

async function ensureSession() {
  if (cachedCookie && cookieExp > Date.now() + 60_000) return cachedCookie;
  const res = await fetch(`${UPSTREAM}/api/wm-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: UPSTREAM_ORIGIN, 'User-Agent': UA },
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  cookieExp = typeof data.exp === 'number' ? data.exp : Date.now() + 12 * 3_600_000;
  cachedCookie = parseSessionCookie(res.headers.get('set-cookie'));
  return cachedCookie;
}

async function proxyUpstream(request, pathname, cors, env) {
  const cookie = await ensureSession();
  const src = new URL(request.url);
  const target = `${UPSTREAM}${pathname}${src.search}`;
  const headers = new Headers();
  headers.set('User-Agent', UA);
  headers.set('Origin', UPSTREAM_ORIGIN);
  if (cookie) headers.set('Cookie', cookie);
  const auth = request.headers.get('Authorization');
  if (auth) headers.set('Authorization', auth);
  let wmKey = request.headers.get('X-WorldMonitor-Key') ?? request.headers.get('X-Api-Key');
  if (!wmKey && env.WORLDMONITOR_API_KEY) {
    wmKey = env.WORLDMONITOR_API_KEY;
  }
  if (wmKey) headers.set('X-WorldMonitor-Key', wmKey);
  const ct = request.headers.get('content-type');
  if (ct) headers.set('Content-Type', ct);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
  });

  const out = { ...cors };
  const uct = upstream.headers.get('content-type');
  if (uct) out['Content-Type'] = uct;
  const cc = upstream.headers.get('cache-control');
  if (cc) out['Cache-Control'] = cc;

  return new Response(upstream.body, { status: upstream.status, headers: out });
}

function sseEvent(obj) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

async function handleChatAnalyst(request, env, cors) {
  if (env.UNLOCK_ALL !== '1' && !env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ error: 'AI not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const query = String(body.query ?? '').slice(0, 500);
  if (!query) {
    return new Response(JSON.stringify({ error: 'query required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'GROQ_API_KEY missing on proxy' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const domain = String(body.domainFocus ?? 'all');
  const system = [
    'You are World Monitor Analyst — a real-time global intelligence assistant.',
    'Answer concisely with structured markdown. Domain focus: ' + domain + '.',
    'Cite uncertainty when data may be stale. No login or paywall mentions.',
  ].join(' ');

  const messages = [
    { role: 'system', content: system },
    ...history.map((m) => ({ role: m.role, content: String(m.content ?? '').slice(0, 800) })),
    { role: 'user', content: query },
  ];

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL || 'llama-3.1-8b-instant',
      messages,
      stream: true,
      temperature: 0.4,
      max_tokens: 1200,
    }),
  });

  if (!groqRes.ok || !groqRes.body) {
    const errText = await groqRes.text().catch(() => 'Groq error');
    return new Response(JSON.stringify({ error: errText.slice(0, 200) }), {
      status: groqRes.status || 502,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(sseEvent({ meta: { sources: ['Live'], degraded: false } })));
      const reader = groqRes.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;
            try {
              const parsed = JSON.parse(payload);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(sseEvent({ delta })));
            } catch { /* skip */ }
          }
        }
        controller.enqueue(encoder.encode(sseEvent({ done: true })));
      } catch (err) {
        controller.enqueue(encoder.encode(sseEvent({ error: String(err) })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      ...cors,
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
      const methods = pathname === '/api/chat-analyst' ? 'POST, OPTIONS' : 'GET, POST, OPTIONS';
      return new Response(null, { status: 204, headers: corsHeaders(origin, methods) });
    }

    if (pathname === '/api/health') {
      return new Response(JSON.stringify({ ok: true, proxy: 'livewweb-proxy' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    if (pathname === '/api/chat-analyst' && request.method === 'POST') {
      return handleChatAnalyst(request, env, corsHeaders(origin, 'POST, OPTIONS'));
    }

    if (pathname.startsWith('/api/')) {
      return proxyUpstream(request, pathname, corsHeaders(origin), env);
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  },
};