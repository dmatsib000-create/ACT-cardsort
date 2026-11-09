// Local-only persistence. Nothing is ever sent anywhere: state lives in this
// browser's localStorage, and falls back to memory if storage is unavailable
// (for example in some private browsing modes).

import { VALUES, RENAMED, AREAS, LIMITS } from './values.js';

const KEY = 'lodestar:v1';
export const SCHEMA = 2;

export const fresh = () => ({
  schema: SCHEMA,
  created: new Date().toISOString(),
  updated: null,
  order: [],          // shuffled ids for the sort
  pos: 0,             // index of the current card in `order`
  piles: {},          // id -> 'very' | 'some' | 'not'
  history: [],        // ids placed, for undo
  custom: [],         // [{ id, name, desc, custom: true }]
  core: [],           // chosen core values, in ranked order
  ranked: false,
  ties: [],           // core ids ranked "on a par" with the value above them
  bw: {},             // id -> best-minus-worst score from the narrowing round
  reflections: {},    // id -> { meaning, living, why: 'own'|'means'|'both'|null, leadsTo }
  deckUpdated: false, // true after migrating saved progress to a newer deck
  areas: {},          // areaId -> { status: 'active'|'hard'|'notnow', importance: 1-5|null, living: 1-5|null, values: [ids] }
  customAreas: [],    // [{ id: 'area-…', name, def }]
  actions: [],        // [{ id, valueId, step, when, obstacles, response, done, created }]
  decisions: [],      // [{ id, question, options:[{id,label}], ratings:{optId:{valueId:-1|0|1}}, feelings, choice, created, updated }]
});

export let persistent = true;

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const state = normalize(parsed);
      // Save migrated data straight away so it is never migrated twice.
      if (schemaOf(parsed) < SCHEMA) save(state);
      return state;
    }
  } catch {
    persistent = false;
  }
  return fresh();
}

export function save(state) {
  state.updated = new Date().toISOString();
  if (!persistent) return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    persistent = false;
    return false;
  }
}

export function clear() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return fresh();
}

// Carries saved progress from deck version 1 (65 cards) to version 2, where
// some cards were merged or renamed. Choices follow the card to its new id;
// when two old cards merge, the stronger pile and both reflections are kept.
const PILE_RANK = { very: 3, some: 2, not: 1 };
function migrateV1(input) {
  const to = (id) => RENAMED[id] || id;
  const list = (v) => [...new Set((Array.isArray(v) ? v : []).map(to))];
  const started = Array.isArray(input.order) && input.order.length > 0;
  const out = { ...input, deckUpdated: started };
  out.order = list(input.order);
  out.history = list(input.history);
  out.core = list(input.core);
  out.piles = {};
  for (const [id, p] of Object.entries(input.piles || {})) {
    const n = to(id);
    if (!out.piles[n] || (PILE_RANK[p] || 0) > (PILE_RANK[out.piles[n]] || 0)) out.piles[n] = p;
  }
  out.reflections = {};
  for (const [id, r] of Object.entries(input.reflections || {})) {
    if (!r || typeof r !== 'object') continue;
    const n = to(id);
    const prev = out.reflections[n];
    if (!prev) { out.reflections[n] = { ...r }; continue; }
    const a = (prev.meaning || '').trim(), b = (r.meaning || '').trim();
    out.reflections[n] = {
      meaning: a && b && a !== b ? `${a}\n\n${b}` : a || b,
      living: prev.living ?? r.living ?? null,
    };
  }
  out.actions = (Array.isArray(input.actions) ? input.actions : []).map((a) => (a && typeof a === 'object' ? { ...a, valueId: to(a.valueId) } : a));
  out.decisions = (Array.isArray(input.decisions) ? input.decisions : []).map((d) => {
    if (!d || typeof d !== 'object' || !d.ratings) return d;
    const ratings = {};
    for (const [opt, r] of Object.entries(d.ratings)) {
      ratings[opt] = {};
      for (const [vid, n] of Object.entries(r || {})) {
        const k = to(vid);
        // Deliberate: if two merged cards were rated differently on one option,
        // the first rating wins (we can't know which the person meant).
        if (!(k in ratings[opt])) ratings[opt][k] = n;
      }
    }
    return { ...d, ratings };
  });
  return out;
}

// Migrations, in order. Each step takes saved data at schema `from` and returns
// it at schema `to`. To change the saved format: bump SCHEMA, add a step here,
// and add unit tests for it in tests/unit/store.test.mjs.
export const MIGRATIONS = [
  { from: 1, to: 2, run: migrateV1 },
];

// Data saved before schema numbers existed counts as schema 1.
const schemaOf = (input) => (Number.isInteger(Number(input?.schema)) && Number(input.schema) >= 1 ? Number(input.schema) : 1);

export function migrate(input) {
  let data = input;
  let version = schemaOf(input);
  for (const step of MIGRATIONS) {
    if (version === step.from) {
      data = { ...step.run(data), schema: step.to };
      version = step.to;
    }
  }
  return data;
}

// Accepts any object (from storage or an imported file) and returns a safe,
// fully shaped state. Unknown keys are dropped; wrong types are reset.
export function normalize(input) {
  const base = fresh();
  if (!input || typeof input !== 'object') return base;
  input = migrate(input);
  const str = (v, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : '');
  const arr = (v) => (Array.isArray(v) ? v : []);
  const obj = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

  const custom = arr(input.custom)
    .filter((c) => c && typeof c.id === 'string' && c.id.startsWith('custom-') && str(c.name).trim())
    .map((c) => ({ id: c.id.slice(0, 80), name: str(c.name, 60).trim(), desc: str(c.desc, 200).trim(), custom: true }));

  const known = new Set([...VALUES.map((v) => v.id), ...custom.map((c) => c.id)]);
  const ids = (v) => [...new Set(arr(v).filter((id) => known.has(id)))];

  const piles = {};
  for (const [id, p] of Object.entries(obj(input.piles))) {
    if (known.has(id) && ['very', 'some', 'not'].includes(p)) piles[id] = p;
  }

  const reflections = {};
  for (const [id, r] of Object.entries(obj(input.reflections))) {
    if (!known.has(id) || !r || typeof r !== 'object') continue;
    const living = Number.isInteger(r.living) && r.living >= 0 && r.living <= 10 ? r.living : null;
    const why = ['own', 'means', 'both'].includes(r.why) ? r.why : null;
    reflections[id] = { meaning: str(r.meaning), living, why, leadsTo: str(r.leadsTo, 500) };
  }

  // If the deck has gained cards since this sort began, keep the cards already
  // placed in front and queue the new (or unplaced) ones after them.
  let order = ids(input.order);
  if (order.length) {
    const placed = order.filter((id) => piles[id]);
    const rest = order.filter((id) => !piles[id]);
    const missing = shuffle(VALUES.map((v) => v.id).filter((id) => !order.includes(id)));
    order = [...placed, ...rest, ...missing];
  }
  const pos = order.length ? order.filter((id) => piles[id]).length : 0;
  const core = ids(input.core).slice(0, LIMITS.core);

  const customAreas = arr(input.customAreas)
    .filter((a) => a && typeof a.id === 'string' && a.id.startsWith('area-') && str(a.name).trim())
    .map((a) => ({ id: a.id.slice(0, 80), name: str(a.name, 40).trim(), def: str(a.def, 120).trim() }))
    .slice(0, LIMITS.customAreas);
  const areaIds = new Set([...AREAS.map((a) => a.id), ...customAreas.map((a) => a.id)]);
  const scale = (n) => (Number.isInteger(n) && n >= 1 && n <= 5 ? n : null);
  const areas = {};
  for (const [id, a] of Object.entries(obj(input.areas))) {
    if (!areaIds.has(id) || !a || typeof a !== 'object') continue;
    areas[id] = {
      status: ['active', 'hard', 'notnow'].includes(a.status) ? a.status : 'active',
      importance: scale(a.importance),
      living: scale(a.living),
      // Links to values not currently in the core list are kept (the app hides
      // them) so they return if the value is chosen again.
      values: ids(a.values).slice(0, LIMITS.areaValues),
    };
  }
  const bw = {};
  for (const [id, n] of Object.entries(obj(input.bw))) if (known.has(id) && Number.isInteger(n)) bw[id] = n;

  return {
    ...base,
    created: str(input.created, 40) || base.created,
    updated: str(input.updated, 40) || null,
    order,
    pos,
    piles,
    history: ids(input.history).filter((id) => piles[id]),
    custom,
    core,
    ranked: Boolean(input.ranked),
    ties: ids(input.ties).filter((id) => core.includes(id) && core.indexOf(id) > 0),
    bw,
    reflections,
    deckUpdated: Boolean(input.deckUpdated),
    areas,
    customAreas,
    actions: arr(input.actions)
      .filter((a) => a && known.has(a.valueId))
      .map((a) => ({
        id: str(a.id, 40) || uid(),
        valueId: a.valueId,
        areaId: areaIds.has(a.areaId) ? a.areaId : '',
        step: str(a.step, 500),
        when: str(a.when, 300),
        obstacles: str(a.obstacles, 800),
        response: str(a.response, 800),
        done: Boolean(a.done),
        created: str(a.created, 40),
      })),
    decisions: arr(input.decisions)
      .filter((d) => d && typeof d === 'object')
      .map((d) => {
        const options = arr(d.options)
          .filter((o) => o && typeof o.id === 'string')
          .slice(0, 4)
          .map((o) => ({ id: o.id.slice(0, 40), label: str(o.label, 200) }));
        const ratings = {};
        for (const o of options) {
          const r = obj(obj(d.ratings)[o.id]);
          ratings[o.id] = {};
          for (const [vid, n] of Object.entries(r)) {
            if (known.has(vid) && [-1, 0, 1].includes(n)) ratings[o.id][vid] = n;
          }
        }
        return {
          id: str(d.id, 40) || uid(),
          question: str(d.question, 500),
          options,
          ratings,
          feelings: str(d.feelings),
          choice: str(d.choice),
          created: str(d.created, 40),
          updated: str(d.updated, 40),
        };
      }),
  };
}

export function uid(prefix = '') {
  const rand = (globalThis.crypto && crypto.randomUUID)
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return prefix + Date.now().toString(36) + rand;
}

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
