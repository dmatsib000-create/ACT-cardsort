// The optional access code (set ACCESS_CODE_HASH in config.js).
//
// This is a soft gate that keeps casual visitors out. It is not real security.
// Lodestar is a static site with no server, so the check runs in the browser,
// and someone who reads the site's files could get past it. Only a hash of
// the code is published, so the code itself isn't shown in plain text.

import { ACCESS_CODE_HASH } from './config.js';

const KEY = 'lodestar:access';
// Prefixed so the hash can't be looked up in tables of plain SHA-256 hashes.
const SALT = 'lodestar-access:';

let unlockedThisVisit = false; // used when the browser won't let us save

// Codes are matched ignoring case and all spaces, so "Blue Harbor",
// "blueharbor" and " BLUE  harbor " all work. A code told out loud as a few
// words works whether or not people type the spaces.
export function normalizeCode(code) {
  return String(code ?? '').replace(/\s+/g, '').toLowerCase();
}

// SHA-256 of the normalized code, as lowercase hex. Used by the gate and by
// scripts/hash-access-code.mjs, so both always agree.
export async function hashCode(code) {
  const bytes = new TextEncoder().encode(SALT + normalizeCode(code));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// The hash in config.js, cleaned up. Empty means the gate is off.
export function codeHash(raw = ACCESS_CODE_HASH) {
  return String(raw ?? '').trim().toLowerCase();
}

export function isLocked(hash = codeHash()) {
  if (!hash || unlockedThisVisit) return false;
  try {
    // The saved value is the hash that was unlocked. If the code changes,
    // it no longer matches and the person is asked for the new one.
    return localStorage.getItem(KEY) !== hash;
  } catch {
    return true;
  }
}

// Returns true and remembers the unlock on this device if the code is right.
export async function unlock(code, hash = codeHash()) {
  if (!normalizeCode(code) || (await hashCode(code)) !== hash) return false;
  unlockedThisVisit = true;
  try { localStorage.setItem(KEY, hash); } catch { /* remembered for this visit only */ }
  return true;
}
