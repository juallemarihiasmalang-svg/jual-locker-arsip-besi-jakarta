const http = require('http');
const fs = require('fs');
const p = require('path');
const types = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};
http.createServer((q, s) => {
  let f = p.join(process.cwd(), decodeURIComponent(q.url.split('?')[0]));
  try {
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = p.join(f, 'index.html');
    const d = fs.readFileSync(f);
    s.writeHead(200, { 'Content-Type': types[p.extname(f)] || 'application/octet-stream' });
    s.end(d);
  } catch (e) {
    s.writeHead(404); s.end('404');
  }
}).listen(8123, () => console.log('server on 8123'));
