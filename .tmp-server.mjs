import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const root = process.cwd();

const IMMUTABLE = /\.(css|js|webp|png|jpe?g|gif|svg|ico|woff2?)$/i;

function cacheControlFor(ext) {
  if (ext === '.html') return 'public, max-age=0, must-revalidate';
  if (IMMUTABLE.test(ext)) return 'public, max-age=31536000, immutable';
  return 'public, max-age=86400';
}

http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/index.html';
  const fp = path.join(root, f);
  fs.readFile(fp, (e, d) => {
    if (e) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404');
      return;
    }
    const ext = path.extname(fp).toLowerCase();
    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': cacheControlFor(ext),
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(d);
  });
}).listen(4788, () => console.log('serving on 4788'));
