// Checks the service worker's offline cache (sw.js) so it can't silently go stale.
//
//   node scripts/check-offline-cache.mjs            list checks only
//   node scripts/check-offline-cache.mjs origin/main  also check the version bump
//
// 1. Every file the app needs to run offline is in ASSETS: the page, its
//    scripts and stylesheet, every JavaScript module it imports (followed
//    recursively), the fonts the stylesheet loads, and the manifest.
// 2. Every file in ASSETS exists.
// 3. With a base git ref: if any cached file changed since that ref, VERSION
//    must change too. Otherwise returning visitors keep the old files, and a
//    mix of old and new modules can stop the app from starting.
//
// Exits with code 1 and lists problems if any check fails.

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const problems = [];

// --- What sw.js caches ---------------------------------------------------
const sw = read('sw.js');
const listMatch = sw.match(/const ASSETS = \[([\s\S]*?)\];/);
const versionMatch = sw.match(/const VERSION = '([^']+)';/);
if (!listMatch || !versionMatch) {
  console.error('Could not find ASSETS or VERSION in sw.js.');
  process.exit(1);
}
const toPath = (url) => normalize(url.replace(/^\.\//, '')).replace(/\\/g, '/');
const cached = new Set([...listMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((u) => u !== './').map(toPath));

// --- What the app needs offline -------------------------------------------
const needed = new Set(['index.html']);
const html = read('index.html');
for (const m of html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"]+)"[^>]*>/g)) {
  const tag = m[0];
  const url = m[1];
  if (/^(https?:)?\/\//.test(url) || url.startsWith('#')) continue;
  // Preloads and touch icons are optional; scripts, stylesheets, manifest and the favicon are needed.
  if (/rel="(preload|apple-touch-icon)"/.test(tag)) continue;
  needed.add(toPath(url));
}
// JavaScript modules, followed through their imports.
const queue = [...needed].filter((p) => p.endsWith('.js'));
while (queue.length) {
  const file = queue.pop();
  if (!existsSync(join(root, file))) continue;
  for (const m of read(file).matchAll(/(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g)) {
    const dep = toPath(relative(root, join(root, dirname(file), m[1] || m[2])));
    if (!needed.has(dep)) { needed.add(dep); queue.push(dep); }
  }
}
// Fonts and other files loaded from the stylesheets.
for (const css of [...needed].filter((p) => p.endsWith('.css'))) {
  for (const m of read(css).matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    if (/^(data:|https?:)/.test(m[1])) continue;
    needed.add(toPath(relative(root, join(root, dirname(css), m[1]))));
  }
}

for (const file of [...needed].sort()) {
  if (!cached.has(file)) problems.push(`"${file}" is needed offline but is missing from ASSETS in sw.js.`);
}
for (const file of [...cached].sort()) {
  if (!existsSync(join(root, file))) problems.push(`"${file}" is in ASSETS but the file doesn't exist.`);
}

// --- Version bump ---------------------------------------------------------
const base = process.argv[2];
if (base) {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  try {
    const changed = git('diff', '--name-only', `${base}...HEAD`).split('\n').filter(Boolean);
    const changedCached = changed.filter((f) => cached.has(f) || f === 'sw.js');
    const oldVersion = (git('show', `${base}:sw.js`).match(/const VERSION = '([^']+)';/) || [])[1];
    if (changedCached.length && oldVersion === versionMatch[1]) {
      problems.push(`These cached files changed but VERSION in sw.js is still "${oldVersion}": ${changedCached.join(', ')}. Bump VERSION so returning visitors get the update.`);
    }
  } catch (err) {
    problems.push(`Could not compare with "${base}": ${err.message.split('\n')[0]}`);
  }
}

if (problems.length) {
  console.error(`Offline cache check failed (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`Offline cache check passed: ${cached.size} files cached, all ${needed.size} needed files included${base ? `, version bumped since ${base}` : ''}.`);
