/**
 * Minimal static server for dist/ that behaves like the production hosts (vercel.json / Netlify):
 * clean URLs (/blog -> blog.html), trailing-slash redirect, /admin and /blog/* rewrites, and a
 * real 404 status with 404.html for anything else. Used for local verification and Lighthouse.
 *   npm run serve:dist            -> http://localhost:4173
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = path.resolve('dist');
const port = Number(process.env.PORT) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
};

const isFile = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

const COMPRESSIBLE = /\.(html|js|css|json|webmanifest|xml|txt|svg)$/;

function send(req, res, file, status = 200) {
  const gzip = COMPRESSIBLE.test(file) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  res.writeHead(status, {
    'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
    ...(gzip ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}),
    ...(file.includes(`${path.sep}assets${path.sep}`) ? { 'Cache-Control': 'public, max-age=31536000, immutable' } : {}),
  });
  // Production hosts compress text responses (gzip/brotli); mirror that so local metrics are realistic.
  const stream = createReadStream(file);
  (gzip ? stream.pipe(zlib.createGzip()) : stream).pipe(res);
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    if (pathname.length > 1 && pathname.endsWith('/')) {
      res.writeHead(308, { Location: pathname.slice(0, -1) + url.search });
      return res.end();
    }
    if (pathname === '/') pathname = '/index.html';

    const direct = path.join(dist, pathname);
    if (!direct.startsWith(dist)) return res.writeHead(400).end();
    if (await isFile(direct)) return send(req, res, direct);
    if (await isFile(`${direct}.html`)) return send(req, res, `${direct}.html`);
    if (/^\/admin(\/|$)/.test(pathname)) return send(req, res, path.join(dist, 'admin', 'index.html'));
    if (/^\/blog\/[^/]+$/.test(pathname)) return send(req, res, path.join(dist, '_spa.html'));
    return send(req, res, path.join(dist, '404.html'), 404);
  })
  .listen(port, () => console.log(`dist/ served like production at http://localhost:${port}`));
