#!/usr/bin/env node
/**
 * Start World Monitor in full live mode:
 * - Vite dev server with production data proxy + Ollama AI
 * - Optional Cloudflare quick tunnel for public HTTPS URL
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.WM_PORT || 3000);
const cloudflaredName = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
const cloudflaredPath = path.join(root, 'scripts', cloudflaredName);

function run(cmd, args, opts = {}) {
  return spawn(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
}

async function ensureCloudflared() {
  if (existsSync(cloudflaredPath)) return cloudflaredPath;
  console.log('[live] Downloading cloudflared...');
  await mkdir(path.dirname(cloudflaredPath), { recursive: true });
  const url = process.platform === 'win32'
    ? 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe'
    : 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cloudflared download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(cloudflaredPath, buf);
  if (process.platform !== 'win32') {
    await import('node:fs/promises').then((fs) => fs.chmod(cloudflaredPath, 0o755));
  }
  return cloudflaredPath;
}

const dev = run('npm', ['run', 'dev:live']);

let tunnel;
if (process.env.WM_TUNNEL !== '0') {
  ensureCloudflared()
    .then((bin) => {
      console.log(`[live] Starting tunnel → http://localhost:${port}`);
      tunnel = spawn(bin, ['tunnel', '--url', `http://localhost:${port}`], {
        cwd: root,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      tunnel.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        process.stdout.write(text);
        const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
          console.log(`\n[live] Public URL: ${match[0]}\n`);
        }
      });
      tunnel.stderr.on('data', (chunk) => process.stderr.write(chunk));
    })
    .catch((err) => {
      console.warn('[live] Tunnel skipped:', err.message);
      console.warn('[live] Local only: http://localhost:' + port);
    });
}

function shutdown() {
  dev.kill('SIGTERM');
  tunnel?.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

dev.on('exit', (code) => {
  tunnel?.kill('SIGTERM');
  process.exit(code ?? 0);
});