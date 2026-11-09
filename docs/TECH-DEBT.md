# Technical debt

An assessment from November 2026, scored with Priority = (Impact + Risk) × (6 − Effort), each from 1 to 5. Update the status column as items are done.

| # | Item | Type | Priority | Status |
|---|------|------|:-:|---|
| 1 | Service-worker cache list and version maintained by hand | Infrastructure | 28 | Done (phase 1): `scripts/check-offline-cache.mjs` checks the list and, on pull requests, the version bump |
| 2 | No unit tests for `store.normalize` and migrations; migrations are a one-off branch | Test / Architecture | 28 | Done (phase 2): `tests/unit/store.test.mjs` (21 tests) and `MIGRATIONS` in `store.js` |
| 3 | Limits duplicated as magic numbers in the app and storage | Code | 25 | Done (phase 1): `LIMITS` in `assets/js/values.js` |
| 4 | CI on Node 20 (past end-of-life), test tools from late 2024, no Dependabot | Dependency | 25 | Done (phase 1): Node 22, Playwright 1.64.1, axe-core 4.14.0, `.github/dependabot.yml` (with a 14-day cooldown on new releases) |
| 5 | `assets/js/app.js` holds every page in one 2,200-line file with shared mutable state | Architecture | 21 | Phase 3 |
| 6 | Escaping relies on remembering `esc()` at about 35 HTML-building sites, with no regression test | Test / Security | 20 | Done (phase 2): `tests/escaping.js`, which found and fixed one unescaped name in the results chart |
| 7 | The values map (`docs/values-map.html`, `docs/VALUES-MAP.md`) copies the deck, and its generator isn't in the repo | Documentation | 20 | Done (phase 2): `scripts/sync-values-map.mjs` checks and syncs the map in CI; it found and fixed the stale Family wording |
| 8 | The Content Security Policy allows `'unsafe-inline'` styles for three inline widths | Security | 12 | Phase 3 |
| 9 | Dark-theme tokens are written twice in the CSS | Code | 12 | Deferred |
| 10 | End-to-end tests sort 72 cards by clicking in every test, which is slow | Test | 12 | Phase 3 |
| 11 | Interface text lives in the JavaScript, so translation would be hard | Architecture | 4 | Deferred until a translation is planned |

## Plan

- **Phase 1 (done):** items 3, 4 and 1. While upgrading axe-core, its newer rules found a real accessibility problem: the theme button's visible word ("Auto") wasn't part of its accessible name (WCAG 2.5.3, Label in Name). That is now fixed.
- **Phase 2 (done):** items 2, 6 and 7. The new checks found three real problems, all fixed: an unescaped value name in the results chart, long unbroken words in typed text covering neighbouring controls, and the values map still showing Family's old wording.
  - Item 2: unit tests with Node's built-in test runner, and migrations as an ordered list of steps.
  - Item 6: an end-to-end test that enters HTML-like text everywhere people can type.
  - Item 7: commit the map generator and check the map against `values.js` in CI.
- **Phase 3 (a page at a time, as features touch them):**
  - Item 5: split `app.js` into one module per page, plus shared `ui.js`, `router.js` and an `update(fn)` helper that changes state and saves.
  - Item 10: a test helper that loads a saved state directly.
  - Item 8: set widths from JavaScript, then drop `'unsafe-inline'`.

## Deliberately not debt

No analytics, no backend and no build step are privacy and simplicity choices. They do mean automated tests and moderated user testing are the only feedback loop, which is why test items rank high.
