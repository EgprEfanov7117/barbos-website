import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLeadMiddleware } from './middleware.mjs';

const root = path.resolve(fileURLToPath(new URL('../dist/client/', import.meta.url)));
const api = createLeadMiddleware(process.env);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
createServer((req, res) => api(req, res, async () => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if ((file !== root && !file.startsWith(root + path.sep)) || pathname.split('/').some(segment => segment.startsWith('.'))) { res.writeHead(404).end(); return; }
    try { if (!(await stat(file)).isFile()) throw new Error(); }
    catch { if (!req.headers.accept?.includes('text/html')) { res.writeHead(404).end(); return; } file = path.join(root, 'index.html'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') res.end(); else createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch { res.writeHead(404).end(); }
})).listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => console.log('NOVARY server is ready.'));
