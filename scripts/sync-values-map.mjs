// Keeps the values map in step with the deck.
//
// The interactive map (docs/values-map.html) and its summary (docs/VALUES-MAP.md)
// show the wording of every card. They were written when deck version 2 was
// designed, so they drift whenever a card's wording changes in values.js.
//
//   node scripts/sync-values-map.mjs            check only; exits 1 on drift
//   node scripts/sync-values-map.mjs --write    update both files from values.js
//   node scripts/sync-values-map.mjs --write --map path/to/copy.html
//                                              also update another copy of the map
//
// The map's research notes, codings and recommendations are hand-written and
// are left alone; only card names and wording are synced.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VALUES, RENAMED } from '../assets/js/values.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const write = args.includes('--write');
const extraMaps = args.flatMap((a, i) => (a === '--map' && args[i + 1] ? [args[i + 1]] : []));
const deck = new Map(VALUES.map((v) => [v.id, v]));
const problems = [];
const fixes = [];

// --- The interactive map: its data lives in two JSON arrays in a <script> ---
// Finds `const NAME = [ ... ];` by matching brackets (skipping strings), so it
// works whatever the array's line layout.
function findArray(text, name) {
  const start = text.indexOf(`const ${name} = [`);
  if (start < 0) return null;
  const open = text.indexOf('[', start);
  let depth = 0, inString = false;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
    } else if (ch === '"') inString = true;
    else if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) return { from: open, to: i + 1, json: text.slice(open, i + 1) };
  }
  return null;
}
// One key or value per line with no indentation: the format the map was written in.
const serialize = (data) => JSON.stringify(data, null, 1).replace(/^ +/gm, '');

function syncMap(path) {
  let html = readFileSync(path, 'utf8');
  const covered = new Set();
  for (const name of ['VALUES', 'ADDITIONS']) {
    const found = findArray(html, name);
    if (!found) { problems.push(`${path}: could not find the ${name} data.`); continue; }
    const entries = JSON.parse(found.json);
    for (const e of entries) {
      // Current cards keep their old id in the map; additions are "add-<id>".
      const id = name === 'ADDITIONS' ? e.id.replace(/^add-/, '') : (RENAMED[e.id] || e.id);
      const card = deck.get(id);
      if (!card) { problems.push(`${path}: "${e.name}" points to "${id}", which isn't in the deck.`); continue; }
      covered.add(id);
      if (e.pname !== card.name || e.pdesc !== card.desc) {
        problems.push(`${path}: ${card.name} reads "${e.pdesc}" but the deck says "${card.desc}".`);
        e.pname = card.name;
        e.pdesc = card.desc;
        fixes.push(path);
      }
    }
    html = html.slice(0, found.from) + serialize(entries) + html.slice(found.to);
  }
  for (const id of deck.keys()) {
    if (!covered.has(id)) problems.push(`${path}: the deck card "${deck.get(id).name}" is missing from the map.`);
  }
  return html;
}

// --- The summary's deck table: | **Name** | wording | change | region | ---
function syncSummary(path) {
  let md = readFileSync(path, 'utf8');
  const byName = new Map(VALUES.map((v) => [v.name, v]));
  const seen = new Set();
  md = md.replace(/^\| \*\*(.+?)\*\* \| (.*?) \| (.*?) \| (.*?) \|$/gm, (line, name, desc, change, region) => {
    const card = byName.get(name);
    if (!card) { problems.push(`${path}: the table lists "${name}", which isn't in the deck.`); return line; }
    seen.add(name);
    if (desc !== card.desc) {
      problems.push(`${path}: ${name} reads "${desc}" but the deck says "${card.desc}".`);
      fixes.push(path);
      return `| **${name}** | ${card.desc} | ${change} | ${region} |`;
    }
    return line;
  });
  for (const v of VALUES) if (!seen.has(v.name)) problems.push(`${path}: the deck card "${v.name}" is missing from the table.`);
  return md;
}

const outputs = [
  [join(root, 'docs/values-map.html'), syncMap],
  ...extraMaps.map((p) => [p, syncMap]),
  [join(root, 'docs/VALUES-MAP.md'), syncSummary],
].map(([path, fn]) => [path, fn(path)]);

if (write) {
  for (const [path, text] of outputs) if (fixes.includes(path)) writeFileSync(path, text);
  const updated = [...new Set(fixes)];
  console.log(updated.length ? `Updated ${updated.length} file(s) from values.js:\n- ${updated.join('\n- ')}` : 'The values map already matches the deck.');
  const remaining = problems.filter((p) => !/reads "/.test(p));
  if (remaining.length) { console.error(`These need a hand edit:\n- ${remaining.join('\n- ')}`); process.exit(1); }
} else if (problems.length) {
  console.error(`The values map is out of step with the deck (${problems.length}):\n- ${problems.join('\n- ')}\nRun: node scripts/sync-values-map.mjs --write`);
  process.exit(1);
} else {
  console.log(`Values map check passed: all ${VALUES.length} cards match the deck.`);
}
