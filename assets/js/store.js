// Local-only persistence. Nothing is ever sent anywhere: state lives in this
// browser's localStorage, and falls back to memory if storage is unavailable
// (for example in some private browsing modes).

import { VALUES } from './values.js';

const KEY = 'lodestar:v1';
const SCHEMA = 1;

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
  reflections: {},    // id -> { meaning, living }
  actions: [],        // [{ id, valueId, step, when, obstacles, response, done, created }]
  decisions: [],      // [{ id, question, options:[{id,label}], ratings:{optId:{valueId:-1|0|1}}, feelings, choice, created, updated }]
});

export let persistent = true;

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return normalize(JSON.parse(raw));
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

// Accepts any object (from storage or an imported file) and returns a safe,
// fully shaped state. Unknown keys are dropped; wrong types are reset.
export function normalize(input) {
  const base = fresh();
  if (!input || typeof input !== 'object') return base;
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
    reflections[id] = { meaning: str(r.meaning), living };
  }

  const order = ids(input.order);
  const core = ids(input.core).slice(0, 10);

  return {
    ...base,
    created: str(input.created, 40) || base.created,
    updated: str(input.updated, 40) || null,
    order,
    pos: Math.min(Math.max(0, Number(input.pos) | 0), order.length),
    piles,
    history: ids(input.history),
    custom,
    core,
    ranked: Boolean(input.ranked),
    reflections,
    actions: arr(input.actions)
      .filter((a) => a && known.has(a.valueId))
      .map((a) => ({
        id: str(a.id, 40) || uid(),
        valueId: a.valueId,
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
