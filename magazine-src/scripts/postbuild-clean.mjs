// Astro 5 leaves empty content-layer artifacts in outDir when collections are defined but empty.
// We strip them, plus assets duplicated from the main site (served from villagebaby.kr root).
// magazine-src/public/ keeps copies for local dev; production reads them from the main site.
import { rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..', 'magazine');
const targets = [
  // Astro 5 empty content artifacts
  'content-assets.mjs',
  'content-modules.mjs',
  'collections',
  // favicon.png is 6MB and the main site already serves /favicon.png — strip the duplicate.
  // logo.png (8KB) and assets/img/* (~170KB) are referenced as base-relative URLs so they must stay.
  'favicon.png',
  // Astro 5 SSR chunks / data store that aren't needed for static serving
  'chunks',
  'data-store.json',
  'settings.json',
];

for (const t of targets) {
  const full = path.join(root, t);
  try {
    const s = await stat(full);
    await rm(full, { recursive: true, force: true });
    console.log(`[clean] removed ${t}${s.isDirectory() ? '/' : ''}`);
  } catch {
    // not present — skip
  }
}

// Glob-cleanup: manifest_*.mjs (Astro SSR runtime)
import { readdir } from 'node:fs/promises';
const rootEntries = await readdir(root);
for (const f of rootEntries) {
  if (/^manifest_.+\.mjs$/.test(f)) {
    await rm(path.join(root, f), { force: true });
    console.log(`[clean] removed ${f}`);
  }
}
