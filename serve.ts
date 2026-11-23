// Lantern Lanes — tiny static server for local play (dev only, not part of the entry).
// Usage: node serve.ts [port]  — then open http://localhost:8080 in desktop Chrome.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.argv[2] ?? 8080);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };

const server = createServer(async (req, res) => {
  const path = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  try {
    const data = await readFile(join(here, 'game', path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});
server.listen(port, () => console.log(`Lantern Lanes at http://localhost:${port}`));
