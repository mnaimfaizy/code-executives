#!/usr/bin/env node
// Fails when three.js is reachable from dist/index.html without a dynamic import, i.e. when every
// visitor would download it. Run after `npm run build`. Prints lazy 3D chunks with gzip sizes.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = join(process.cwd(), 'dist');
const MARKER = 'WebGLRenderer'; // present in any bundle that includes three's renderer

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(2);
}

const html = readFileSync(join(DIST, 'index.html'), 'utf8');
const queue = [...html.matchAll(/(?:src|href)="\/?(assets\/[^"]+\.js)"/g)].map((m) => m[1]);
const entryGraph = new Set();

while (queue.length) {
  const file = queue.shift();
  if (entryGraph.has(file) || !existsSync(join(DIST, file))) continue;
  entryGraph.add(file);
  const code = readFileSync(join(DIST, file), 'utf8');
  // Static imports only (`import(...)` is lazy and deliberately not followed).
  for (const m of code.matchAll(/(?:^|[;\s}])(?:import|export)\s*(?:[\w*{}\s,$]+from\s*)?["']\.\/([^"']+\.js)["']/g)) {
    queue.push(`assets/${m[1]}`);
  }
}

const eager = [...entryGraph].filter((f) => readFileSync(join(DIST, f), 'utf8').includes(MARKER));
if (eager.length) {
  console.error(`three.js is in the entry graph (loaded on every page): ${eager.join(', ')}`);
  console.error('Import it only from a React.lazy-loaded renderer and keep manualChunks free of a three rule.');
  process.exit(1);
}

const lazy = readdirSync(join(DIST, 'assets'))
  .filter((f) => f.endsWith('.js'))
  .filter((f) => readFileSync(join(DIST, 'assets', f), 'utf8').includes(MARKER));
for (const f of lazy) {
  const kb = (gzipSync(readFileSync(join(DIST, 'assets', f))).length / 1024).toFixed(0);
  console.log(`lazy 3D chunk: assets/${f} (${kb} KB gzip)`);
}
console.log(`ok: three.js not in the entry graph (${entryGraph.size} entry files checked)`);
