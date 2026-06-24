#!/usr/bin/env node
/**
 * Post-build extras for GitHub Pages (repo-root publish):
 * - Mirror favico/ so /livewweb/favico/* resolves (browsers bookmark root paths)
 * - Root favicon.ico for /livewweb/favicon.ico
 * - VIP branded redirect shells + web manifest
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const docs = join(root, 'docs');
const favicoSrc = join(docs, 'favico');

const SITE_NAME = 'The Vision of World';
const SITE_NAME_UPPER = 'THE VISION OF WORLD';
const DASHBOARD = '/livewweb/docs/dashboard.html';
const THEME = '#030304';
const ACCENT = '#ff2a3a';
const ACCENT_GLOW = 'rgba(255, 42, 58, 0.55)';

function faviconHead(prefix) {
  return [
    `  <link rel="icon" type="image/x-icon" href="${prefix}favico/favicon.ico" />`,
    `  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}favico/favicon-32x32.png" />`,
    `  <link rel="icon" type="image/png" sizes="16x16" href="${prefix}favico/favicon-16x16.png" />`,
    `  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}favico/apple-touch-icon.png" />`,
    `  <link rel="manifest" href="${prefix}site.webmanifest" />`,
  ].join('\n');
}

function vipRedirectHtml({ title, dest, prefix, subtitle }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="application-name" content="${SITE_NAME}" />
  <meta name="theme-color" content="${THEME}" />
  <meta name="color-scheme" content="dark" />
${faviconHead(prefix)}
  <meta http-equiv="refresh" content="0;url=${dest}" />
  <style>
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:radial-gradient(ellipse 100% 70% at 50% -10%,rgba(120,0,30,.45) 0%,${THEME} 60%);
      color:#f0e0e4;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;position:relative}
    body::before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.05;
      background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.6) 2px,rgba(0,0,0,.6) 4px)}
    .card{text-align:center;padding:2.5rem 2rem;max-width:24rem;position:relative;z-index:1}
    .badge{display:inline-block;font-size:.6rem;letter-spacing:.32em;font-weight:800;
      color:${ACCENT};border:1px solid ${ACCENT_GLOW};border-radius:2px;
      padding:.4rem .9rem;margin-bottom:1rem;text-transform:uppercase;
      box-shadow:0 0 16px ${ACCENT_GLOW}}
    h1{font-size:1.4rem;font-weight:700;letter-spacing:.12em;margin:0 0 .5rem;line-height:1.3;
      color:#ff3b4a;text-shadow:0 0 20px ${ACCENT_GLOW}}
    .sub{color:#a08088;font-size:.8rem;margin:0 0 1.25rem;line-height:1.5;letter-spacing:.04em}
    .pulse{width:12px;height:12px;border-radius:50%;background:${ACCENT};
      margin:0 auto 1.25rem;box-shadow:0 0 16px ${ACCENT_GLOW},0 0 32px rgba(255,0,40,.3);
      animation:vip-pulse 1s ease-in-out infinite}
    @keyframes vip-pulse{0%,100%{opacity:.4;transform:scale(.85)}50%{opacity:1;transform:scale(1.2)}}
    a{color:${ACCENT};text-decoration:none;font-size:.8rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
    a:hover{text-shadow:0 0 8px ${ACCENT_GLOW}}
  </style>
  <script>location.replace("${dest}" + location.search + location.hash);</script>
</head>
<body>
  <div class="card">
    <div class="badge">⚠ THREAT MATRIX ACTIVE</div>
    <h1>${SITE_NAME_UPPER}</h1>
    <p class="sub">${subtitle}</p>
    <div class="pulse" aria-hidden="true"></div>
    <a href="${dest}">Enter dashboard</a>
  </div>
</body>
</html>
`;
}

function writeWebManifest(destPath, iconPrefix) {
  const manifest = {
    name: `${SITE_NAME} — Real-Time Global Intelligence`,
    short_name: 'Vision',
    description: 'Real-time global intelligence dashboard with 3D globe, live news, and geopolitical data.',
    start_url: DASHBOARD,
    scope: '/livewweb/',
    display: 'standalone',
    orientation: 'any',
    theme_color: THEME,
    background_color: THEME,
    categories: ['news', 'productivity'],
    icons: [
      { src: `${iconPrefix}favico/android-chrome-192x192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${iconPrefix}favico/android-chrome-512x512.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `${iconPrefix}favico/android-chrome-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
  writeFileSync(destPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

export function applyGitHubPagesExtras({ docsDir = docs, repoRoot = root } = {}) {
  if (!existsSync(join(docsDir, 'dashboard.html'))) {
    throw new Error('docs/dashboard.html missing — run build:pages first');
  }
  if (!existsSync(favicoSrc)) {
    throw new Error('docs/favico missing — run build:pages first');
  }

  // /livewweb/docs/favico/* (canonical, from dist)
  writeWebManifest(join(docsDir, 'site.webmanifest'), '/livewweb/docs/');
  cpSync(join(favicoSrc, 'favicon.ico'), join(docsDir, 'favicon.ico'));

  // /livewweb/favico/* — root mirror for legacy/browser root requests
  const rootFavico = join(repoRoot, 'favico');
  rmSync(rootFavico, { recursive: true, force: true });
  cpSync(favicoSrc, rootFavico, { recursive: true });
  writeWebManifest(join(repoRoot, 'site.webmanifest'), '/livewweb/');
  cpSync(join(favicoSrc, 'favicon.ico'), join(repoRoot, 'favicon.ico'));

  const docsShell = vipRedirectHtml({
    title: SITE_NAME,
    dest: './dashboard.html',
    prefix: './',
    subtitle: 'Initializing global crisis intelligence…',
  });
  writeFileSync(join(docsDir, 'index.html'), docsShell);
  writeFileSync(join(docsDir, '404.html'), docsShell);

  const rootShell = vipRedirectHtml({
    title: SITE_NAME,
    dest: DASHBOARD,
    prefix: '/livewweb/',
    subtitle: 'Initializing global crisis intelligence…',
  });
  writeFileSync(join(repoRoot, 'index.html'), rootShell);
  writeFileSync(join(repoRoot, '404.html'), rootShell);
  writeFileSync(join(repoRoot, 'dashboard.html'), rootShell);

  return {
    rootFavico: existsSync(join(rootFavico, 'favicon.ico')),
    rootFavicon: existsSync(join(repoRoot, 'favicon.ico')),
    docsFavicon: existsSync(join(docsDir, 'favicon.ico')),
  };
}

const invokedDirectly = process.argv[1]?.replace(/\\/g, '/').endsWith('github-pages-extras.mjs');
if (invokedDirectly) {
  const result = applyGitHubPagesExtras();
  console.log('GitHub Pages extras OK:', result);
}