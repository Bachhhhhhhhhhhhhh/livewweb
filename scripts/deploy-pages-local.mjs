#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const dist = join(root, 'dist');
const docs = join(root, 'docs');

if (!existsSync(join(dist, 'dashboard.html'))) {
  console.error('Run npm run build:pages first');
  process.exit(1);
}

const apiBackup = join(root, '.tmp-docs-api');
if (existsSync(join(docs, 'api'))) {
  rmSync(apiBackup, { recursive: true, force: true });
  cpSync(join(docs, 'api'), apiBackup, { recursive: true });
}

rmSync(docs, { recursive: true, force: true });
cpSync(dist, docs, { recursive: true });

if (existsSync(apiBackup)) {
  cpSync(apiBackup, join(docs, 'api'), { recursive: true });
  rmSync(apiBackup, { recursive: true, force: true });
}

writeFileSync(join(docs, '.nojekyll'), '');

const docsIndex = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=./dashboard.html" />
  <script>location.replace("./dashboard.html");</script>
  <title>World Monitor</title>
</head>
<body></body>
</html>
`;

writeFileSync(join(docs, 'index.html'), docsIndex);
writeFileSync(join(docs, '404.html'), docsIndex);

const rootRedirect = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0;url=/livewweb/docs/dashboard.html" />
  <script>location.replace('/livewweb/docs/dashboard.html');</script>
  <title>World Monitor</title>
</head>
<body>
  <p><a href="/livewweb/docs/dashboard.html">Open World Monitor dashboard</a></p>
</body>
</html>
`;

writeFileSync(join(root, 'dashboard.html'), rootRedirect);
writeFileSync(join(root, '404.html'), rootRedirect);

const html = readFileSync(join(docs, 'dashboard.html'), 'utf8');
const assetRe = /(?:src|href)="(\/livewweb\/docs\/[^"]+)"/g;
const missing = [];
for (const match of html.matchAll(assetRe)) {
  const rel = match[1].replace('/livewweb/docs/', '');
  if (!existsSync(join(docs, rel))) missing.push(rel);
}

if (missing.length) {
  console.error('Missing assets:\n' + missing.join('\n'));
  process.exit(1);
}

console.log('Deployed dist → docs/', missing.length === 0 ? 'OK' : '');