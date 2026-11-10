# Lodestar tests

End-to-end and accessibility tests. The app has no build step or dependencies; these tests are the only part of the project that needs Node packages.

Requirements: Node.js 22 or later, and Python 3 (used only to serve the site locally).

```sh
cd tests
npm ci
npx playwright install chromium
npm test
```

`npm test` starts a local static server for the repository on port 8123 (set `PORT` to change it; it stops if the port is already in use), then runs:

| Test | What it covers |
|---|---|
| `../scripts/check-deck.mjs` | Every card fits ACT's definition of a value. |
| `../scripts/sync-values-map.mjs` | The values map (`docs/values-map.html`, `docs/VALUES-MAP.md`) shows the deck's current wording. Fix drift with `node scripts/sync-values-map.mjs --write`. |
| `unit/config.test.mjs` | Only Google Forms links are accepted for the feedback form. |
| `unit/store.test.mjs` | Saved-data handling with Node's built-in test runner: validation, every limit, protection against `__proto__` keys in backup files, and each migration step. Runs in under a second. |
| `../scripts/check-offline-cache.mjs` | Every file the app needs offline is in the service worker's cache list. (On pull requests, GitHub also checks the cache version was bumped.) |
| `core-flow.js` | Sort, choose, rank (with ties), reflect, act, results, decide, learn, about; reload persistence; no horizontal scrolling. |
| `deck-v2.js` | 72-card deck, custom-card prompts, the narrowing round (fills an empty list, otherwise only suggests), clearing scores on reshuffle, and migration from the original 65-card deck. |
| `escaping.js` | Text that looks like HTML (`<img onerror>`, `<b>`, quotes) typed into every field is shown as plain text on every page and dialog, with no elements created and no code run. The page's Content Security Policy is bypassed so this tests the escaping itself. |
| `feedback.js` | The feedback link stays hidden with no form set or a non-Google address, and appears in the footer and About page once a Google Form is set. |
| `life-areas.js` | The optional life areas exercise: picking (saved only on Continue), custom areas (add and remove), the three statuses, the three-value cap, the summary's suggestion (no scores), planning a step from an area, freeing a value's slot when it leaves the core list, and restoring the link when it returns. |

Each test runs twice: light theme on a desktop-sized window, and dark theme on a phone-sized one. Every screen is checked with axe-core against WCAG 2.0, 2.1 and 2.2 A/AA rules plus best practices, and any console error fails the run. Screenshots, if a test takes any, go to `tests/output/` (not committed).

The same suite runs on GitHub for every pull request (`.github/workflows/tests.yml`).

If Chromium is already installed elsewhere, point the tests at it instead of downloading one: `CHROMIUM_PATH=/path/to/chromium npm test`.

Set `BASE_URL` to test a different server, for example a deployed copy: `BASE_URL=https://example.github.io/ACT-cardsort/ node life-areas.js`.
