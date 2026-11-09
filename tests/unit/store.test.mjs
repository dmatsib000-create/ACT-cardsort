// Unit tests for saved-data handling: validation, limits and migrations.
// Run with: node --test tests/unit/   (no dependencies needed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, migrate, fresh, MIGRATIONS, SCHEMA } from '../../assets/js/store.js';
import { VALUES, AREAS, LIMITS, RENAMED } from '../../assets/js/values.js';

const ids = VALUES.map((v) => v.id);
// A minimal valid saved state at the current schema.
const saved = (extra = {}) => ({ schema: SCHEMA, ...extra });

test('a fresh state has every field, at the current schema', () => {
  const s = fresh();
  assert.equal(s.schema, SCHEMA);
  for (const key of ['order', 'piles', 'core', 'ties', 'reflections', 'actions', 'decisions', 'areas', 'customAreas']) {
    assert.ok(key in s, `missing ${key}`);
  }
});

test('anything that is not an object becomes a fresh state', () => {
  for (const bad of [null, undefined, 42, 'text', true]) {
    assert.deepEqual(Object.keys(normalize(bad)).sort(), Object.keys(fresh()).sort());
  }
});

test('unknown cards, piles and fields are dropped', () => {
  const s = normalize(saved({
    piles: { honesty: 'very', notacard: 'very', courage: 'maybe' },
    core: ['honesty', 'notacard'],
    somethingElse: 'x',
  }));
  assert.deepEqual(s.piles, { honesty: 'very' });
  assert.deepEqual(s.core, ['honesty']);
  assert.ok(!('somethingElse' in s));
});

test('keys like __proto__ in a backup file cannot pollute objects', () => {
  const s = normalize(JSON.parse('{"schema":2,"piles":{"__proto__":{"polluted":true},"honesty":"very"},"reflections":{"__proto__":{"meaning":"x"}}}'));
  assert.deepEqual(s.piles, { honesty: 'very' });
  assert.equal({}.polluted, undefined);
  assert.equal(Object.keys(s.reflections).length, 0);
});

test('ratings outside their scales are reset', () => {
  const s = normalize(saved({
    core: ['honesty', 'courage'],
    reflections: { honesty: { meaning: 'x', living: 11 }, courage: { meaning: 'y', living: 4, why: 'nonsense' } },
    areas: { work: { importance: 9, living: 0, status: 'odd' } },
  }));
  assert.equal(s.reflections.honesty.living, null);
  assert.equal(s.reflections.courage.living, 4);
  assert.equal(s.reflections.courage.why, null);
  assert.equal(s.areas.work.importance, null);
  assert.equal(s.areas.work.living, null);
  assert.equal(s.areas.work.status, 'active');
});

test('every limit in LIMITS is enforced on load', () => {
  const s = normalize(saved({
    core: ids.slice(0, LIMITS.core + 5),
    areas: { work: { values: ids.slice(0, LIMITS.areaValues + 4) } },
    customAreas: Array.from({ length: LIMITS.customAreas + 10 }, (_, i) => ({ id: `area-${i}`, name: `Area ${i}` })),
  }));
  assert.equal(s.core.length, LIMITS.core);
  assert.equal(s.areas.work.values.length, LIMITS.areaValues);
  assert.equal(s.customAreas.length, LIMITS.customAreas);
});

test('custom cards and areas must use their id prefixes', () => {
  const s = normalize(saved({
    custom: [{ id: 'custom-1', name: 'Gardening' }, { id: 'honesty', name: 'Fake' }, { id: 'custom-2', name: '   ' }],
    customAreas: [{ id: 'area-1', name: 'Music' }, { id: 'work', name: 'Fake work' }],
  }));
  assert.deepEqual(s.custom.map((c) => c.id), ['custom-1']);
  assert.deepEqual(s.customAreas.map((a) => a.id), ['area-1']);
});

test('actions keep only known values and areas', () => {
  const s = normalize(saved({ actions: [
    { valueId: 'honesty', areaId: 'work', step: 'a' },
    { valueId: 'honesty', areaId: 'nowhere', step: 'b' },
    { valueId: 'notacard', step: 'c' },
  ] }));
  assert.equal(s.actions.length, 2);
  assert.equal(s.actions[0].areaId, 'work');
  assert.equal(s.actions[1].areaId, '');
});

test('ties only apply to core values below the first', () => {
  const s = normalize(saved({ core: ['honesty', 'courage', 'kindness'], ties: ['honesty', 'courage', 'fun'] }));
  assert.deepEqual(s.ties, ['courage']);
});

test('area links to values outside the core list are kept, not deleted', () => {
  const s = normalize(saved({ core: ['honesty'], areas: { family: { values: ['honesty', 'fun'] } } }));
  assert.deepEqual(s.areas.family.values, ['honesty', 'fun']);
});

test('a sort in progress keeps placed cards first and queues every unplaced card', () => {
  const s = normalize(saved({ order: ['honesty', 'courage', 'kindness'], piles: { courage: 'very' } }));
  assert.equal(s.order[0], 'courage');
  assert.equal(s.pos, 1);
  assert.equal(s.order.length, VALUES.length);
  assert.deepEqual([...s.order].sort(), [...ids].sort());
});

test('normalizing twice gives the same result', () => {
  const once = normalize(saved({
    order: ['honesty', 'courage'], piles: { honesty: 'very' }, core: ['honesty'],
    reflections: { honesty: { meaning: 'x', living: 5, why: 'own' } },
    areas: { work: { status: 'hard', importance: 3, values: ['honesty'] } },
  }));
  const twice = normalize(JSON.parse(JSON.stringify(once)));
  // Unsorted cards are reshuffled on each load, so compare everything else.
  assert.deepEqual({ ...twice, order: null }, { ...once, order: null });
  assert.deepEqual(twice.order.slice(0, twice.pos), once.order.slice(0, once.pos));
});

// --- Migrations -------------------------------------------------------------

test('migrations form an unbroken chain ending at the current schema', () => {
  MIGRATIONS.forEach((step, i) => {
    assert.equal(step.to, step.from + 1, 'each step moves one version');
    if (i > 0) assert.equal(step.from, MIGRATIONS[i - 1].to, 'steps are in order');
  });
  assert.equal(MIGRATIONS.at(-1).to, SCHEMA);
});

test('data without a schema number is treated as schema 1', () => {
  assert.equal(migrate({ core: ['caring'] }).schema, SCHEMA);
  assert.deepEqual(migrate({ core: ['caring'] }).core, ['kindness']);
});

test('current-schema data is not migrated again', () => {
  const s = migrate({ schema: SCHEMA, core: ['caring'] });
  assert.deepEqual(s.core, ['caring']);
});

test('v1 to v2: renamed and merged cards follow their new ids without duplicates', () => {
  const s = normalize({ schema: 1, core: ['caring', 'kindness', 'trust', 'connection', 'mindfulness'] });
  assert.deepEqual(s.core, ['kindness', 'trusting-others', 'presence']);
  for (const [oldId, newId] of Object.entries(RENAMED)) {
    assert.ok(ids.includes(newId), `${oldId} maps to a real card`);
    assert.ok(!ids.includes(oldId), `${oldId} is no longer in the deck`);
  }
});

test('v1 to v2: when cards merge, the stronger pile wins', () => {
  const s = normalize({ schema: 1, piles: { caring: 'some', kindness: 'very', connection: 'very', mindfulness: 'not', peace: 'not' } });
  assert.equal(s.piles.kindness, 'very');
  assert.equal(s.piles.presence, 'very');
  assert.equal(s.piles.harmony, 'not');
});

test('v1 to v2: both reflections are kept when cards merge', () => {
  const s = normalize({ schema: 1, core: ['kindness'], reflections: {
    caring: { meaning: 'Looking out for people', living: 6 },
    kindness: { meaning: 'Being warm', living: 3 },
  } });
  assert.match(s.reflections.kindness.meaning, /Looking out for people/);
  assert.match(s.reflections.kindness.meaning, /Being warm/);
  assert.equal(s.reflections.kindness.living, 6);
});

test('v1 to v2: actions and decision ratings follow their card', () => {
  const s = normalize({ schema: 1,
    actions: [{ valueId: 'caring', step: 'Call Mum' }],
    decisions: [{ id: 'd1', options: [{ id: 'o1', label: 'A' }], ratings: { o1: { caring: 1, kindness: -1, trust: 1 } } }],
  });
  assert.equal(s.actions[0].valueId, 'kindness');
  // When two merged cards were rated differently, the first rating wins.
  assert.deepEqual(s.decisions[0].ratings.o1, { kindness: 1, 'trusting-others': 1 });
});

test('v1 to v2: the "deck updated" notice is only for people who had started', () => {
  assert.equal(normalize({ schema: 1, order: ['honesty'], piles: { honesty: 'very' } }).deckUpdated, true);
  assert.equal(normalize({ schema: 1 }).deckUpdated, false);
});

test('built-in areas and values are separate namespaces', () => {
  // "family" is both an area and a value id on purpose (see values.js).
  assert.ok(AREAS.some((a) => a.id === 'family'));
  assert.ok(ids.includes('family'));
  const s = normalize(saved({ core: ['family'], areas: { family: { values: ['family'] } } }));
  assert.deepEqual(s.areas.family.values, ['family']);
});
