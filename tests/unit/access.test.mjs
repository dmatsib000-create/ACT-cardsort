// The access code: matching rules, hashing and the shipped setting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCode, hashCode, codeHash, isLocked } from '../../assets/js/access.js';
import { ACCESS_CODE_HASH } from '../../assets/js/config.js';

test('codes ignore case and extra spaces', async () => {
  assert.equal(normalizeCode('  Blue   Harbor '), 'blue harbor');
  assert.equal(await hashCode('Blue Harbor'), await hashCode(' blue  HARBOR '));
  assert.notEqual(await hashCode('blue harbor'), await hashCode('blueharbor'));
});

test('hashes are stable lowercase SHA-256 hex', async () => {
  assert.equal(await hashCode('open sesame'), 'ce578b9ef32f8cd4dcea552834dae2613caf4f4cd3bfe0015d6b4883ff555371');
});

test('no hash means no gate', () => {
  assert.equal(codeHash(''), '');
  assert.equal(isLocked(''), false);
});

test('the shipped setting is empty or a SHA-256 hash', () => {
  assert.match(ACCESS_CODE_HASH, /^([0-9a-f]{64})?$/, 'ACCESS_CODE_HASH should be empty or the line printed by scripts/hash-access-code.mjs');
});
