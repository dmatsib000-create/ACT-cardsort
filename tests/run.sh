#!/usr/bin/env bash
# Runs every Lodestar test against a local static server.
# Usage: cd tests && npm install && npx playwright install chromium && npm test
set -u
cd "$(dirname "$0")"
PORT="${PORT:-8123}"
export BASE_URL="http://localhost:${PORT}/"
# Refuse to run against some other server that happens to be on this port.
if (exec 3<>"/dev/tcp/127.0.0.1/${PORT}") 2>/dev/null; then
  echo "Port ${PORT} is already in use. Stop that server or run: PORT=8200 npm test" >&2
  exit 1
fi
command -v python3 >/dev/null || { echo "These tests need Python 3 to serve the site locally." >&2; exit 1; }
python3 -m http.server "$PORT" --directory .. >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
status=0
node ../scripts/check-deck.mjs || status=1
node ../scripts/check-offline-cache.mjs || status=1
node ../scripts/sync-values-map.mjs || status=1
echo "== unit tests"
node --test unit/*.test.mjs || status=1
for t in core-flow.js deck-v2.js life-areas.js escaping.js feedback.js; do
  echo "== $t"
  node "$t" || status=1
done
exit $status
