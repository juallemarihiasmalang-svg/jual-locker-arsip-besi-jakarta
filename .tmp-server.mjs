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
    res.writeHead(200, { 'Content-Type': types[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(4788, () => console.log('serving on 4788'));
