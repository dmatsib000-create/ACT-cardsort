#!/usr/bin/env bash
# Runs every Lodestar test against a local static server.
# Usage: cd tests && npm install && npx playwright install chromium && npm test
set -u
cd "$(dirname "$0")"
PORT="${PORT:-8123}"
export BASE_URL="http://localhost:${PORT}/"
python3 -m http.server "$PORT" --directory .. >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
status=0
node ../scripts/check-deck.mjs || status=1
for t in core-flow.js deck-v2.js life-areas.js; do
  echo "== $t"
  node "$t" || status=1
done
exit $status
