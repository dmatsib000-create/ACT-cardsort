// Unit tests for backup files: what counts as unsaved work, when a reminder
// is due, and which files can be restored.
// Run with: node --test tests/unit/   (no dependencies needed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backupStatus, backupFile, parseBackup, hasProgress, fresh, SCHEMA, BACKUP_DUE_DAYS } from '../../assets/js/store.js';

const DAY = 86_400_000;
const now = Date.parse('2026-11-16T12:00:00Z');
const withWork = (updated) => ({ ...fresh(), piles: { honesty: 'very' }, updated: new Date(updated).toISOString() });

test('a fresh state has nothing to back up and no reminder', () => {
  assert.equal(hasProgress(fresh()), false);
  assert.deepEqual(backupStatus(fresh(), { last: 0, since: now - 10 * DAY, now }), { has: false, last: 0, unsaved: false, due: false });
});

test('anything placed, written or planned counts as progress', () => {
  for (const extra of [{ piles: { honesty: 'very' } }, { custom: [{}] }, { core: ['honesty'] }, { actions: [{}] }, { decisions: [{}] }]) {
    assert.equal(hasProgress({ ...fresh(), ...extra }), true, JSON.stringify(extra));
  }
});

test('work with no backup yet is unsaved, and due once it is old enough', () => {
  const s = withWork(now - DAY);
  assert.equal(backupStatus(s, { last: 0, since: now - DAY, now }).due, false);
  const b = backupStatus(s, { last: 0, since: now - BACKUP_DUE_DAYS * DAY, now });
  assert.equal(b.unsaved, true);
  assert.equal(b.due, true);
});

test('the reminder counts from the first unsaved change, not the latest', () => {
  // Changed an hour ago, but the first change after the last backup was 3 days ago.
  const b = backupStatus(withWork(now - 3600_000), { last: now - 5 * DAY, since: now - 3 * DAY, now });
  assert.equal(b.unsaved, true);
  assert.equal(b.due, true);
});

test('nothing changed since the last backup means no reminder, however old', () => {
  const b = backupStatus(withWork(now - 30 * DAY), { last: now - 20 * DAY, since: 0, now });
  assert.equal(b.unsaved, false);
  assert.equal(b.due, false);
});

test('without a first-change record, the latest change is used', () => {
  assert.equal(backupStatus(withWork(now - 3 * DAY), { last: 0, since: 0, now }).due, true);
  assert.equal(backupStatus(withWork(now - 3600_000), { last: 0, since: 0, now }).due, false);
});

test('a backup file is marked as Lodestar and says when it was saved', () => {
  const f = backupFile(fresh(), new Date(now));
  assert.equal(f.app, 'lodestar');
  assert.equal(f.savedAt, '2026-11-16T12:00:00.000Z');
  assert.equal(f.schema, SCHEMA);
  assert.deepEqual(parseBackup(JSON.stringify(f)).data, f);
});

test('files that are not Lodestar backups are refused', () => {
  for (const text of ['not json', 'null', '[]', '42', '{"schema":3}', '{"app":"other","schema":3}']) {
    assert.deepEqual(parseBackup(text), { error: 'notours' }, text);
  }
});

test('a backup from a newer version is refused, older ones are read', () => {
  assert.deepEqual(parseBackup(JSON.stringify({ app: 'lodestar', schema: SCHEMA + 1 })), { error: 'newer' });
  assert.ok(parseBackup(JSON.stringify({ app: 'lodestar', schema: 1 })).data);
  assert.ok(parseBackup(JSON.stringify({ app: 'lodestar' })).data, 'backups from before schema numbers');
});
