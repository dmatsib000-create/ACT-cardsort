// Prints the config line that turns on Lodestar's access code.
// Usage: node scripts/hash-access-code.mjs "your access code"
// Paste the printed line over ACCESS_CODE_HASH in assets/js/config.js,
// then bump VERSION in sw.js and commit. Keep the code itself out of the repo.
import { hashCode, normalizeCode } from '../assets/js/access.js';

const code = process.argv.slice(2).join(' ');
if (!normalizeCode(code)) {
  console.error('Usage: node scripts/hash-access-code.mjs "your access code"');
  process.exit(1);
}
if (normalizeCode(code).length < 8) {
  console.error('Tip: a longer code (a few unrelated words) is much harder to guess.');
}
console.log(`export const ACCESS_CODE_HASH = '${await hashCode(code)}';`);
