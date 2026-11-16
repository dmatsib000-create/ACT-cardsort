// The access code: matching rules, hashing and the shipped setting.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCode, hashCode, codeHash, isLocked } from '../../assets/js/access.js';
import { ACCESS_CODE_HASH } from '../../assets/js/config.js';

test('codes ignore case and all spaces', async () => {
  assert.equal(normalizeCode('  Blue   Harbor '), 'blueharbor');
  assert.equal(await hashCode('Blue Harbor'), await hashCode(' blue  HARBOR '));
  assert.equal(await hashCode('blue harbor'), await hashCode('blueharbor'));
  assert.notEqual(await hashCode('blue harbor'), await hashCode('blue harbour'));
});

test('hashes are stable lowercase SHA-256 hex', async () => {
  assert.equal(await hashCode('open sesame'), 'ff66ac0cd13c102ab68ea8a4b2c12f920ceee4628989d318e4a535753ce0c588');
});

test('no hash means no gate', () => {
  assert.equal(codeHash(''), '');
  assert.equal(isLocked(''), false);
});

test('the shipped setting is empty or a SHA-256 hash', () => {
  assert.match(ACCESS_CODE_HASH, /^([0-9a-f]{64})?$/, 'ACCESS_CODE_HASH should be empty or the line printed by scripts/hash-access-code.mjs');
});
