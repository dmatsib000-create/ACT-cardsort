# Lodestar: an ACT values card sort

Lodestar is a free, private web app that guides people through an **Acceptance and Commitment Therapy (ACT) values card sort**. It helps people discover what matters most to them, put it in their own words, take small committed actions, and use their values to make decisions.

It works on phones and desktops, can be installed to a home screen, works offline, and never sends anyone's answers anywhere.

## What it does

1. **Sort**: 71 value cards, one at a time, into *very important*, *somewhat important* or *less important to me*. People can add their own values (with a gentle prompt if a card names an outcome like wealth or a feeling like happiness), undo, and review or move cards afterwards.
2. **Choose**: narrow the "very important" pile to up to 10 core values, with prompts that check whether each value is truly theirs (ACT's "pliance" check). If the pile is large, an optional best-worst round (pick the most and least important of a few cards at a time) suggests a top five.
3. **Rank**: order the core values by hand, or answer a few either/or questions (a binary-insertion ranking that keeps the number of questions small). Values can be marked "on a par" when they can't honestly be ordered.
4. **Reflect**: write what each value means to them, say whether they hold it for its own sake or for what it gives them, and rate how fully they have lived it over the past two weeks (inspired by the Valued Living Questionnaire and the Values Bull's-Eye). A gentle nudge appears if a value starts sounding like a "should".
5. **Act**: plan a small, specific committed action, with what might get in the way and how they will respond (ACT willingness).

It also includes:

- **My values**: a summary with a bull's-eye chart, action plan, print or save as PDF, copy as text, share, and backup or restore to a file.
- **Decision helper**: a values-based "choice point" tool. Rate each option as moving toward or away from each core value, see a summary weighted by rank, then reflect on willingness and next steps.
- **Learn**: a plain-language guide to ACT, values vs goals, feelings and rules, choice points, and the research evidence.
- **About**: crisis resources, a "this is not therapy" statement, privacy details, an accessibility statement, credits and references.

The research behind the content is in [`docs/research/`](docs/research/). A map of how the cards relate to Schwartz's circle of values and the science of wellbeing, with proposed deck changes, is in [`docs/VALUES-MAP.md`](docs/VALUES-MAP.md) and the interactive [`docs/values-map.html`](docs/values-map.html).

## Publish it on GitHub Pages

The site is plain HTML, CSS and JavaScript with no build step.

1. Merge this branch into `main`.
2. On GitHub, open the repository's **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose **`main`** and **`/ (root)`**, then **Save**.
4. After a minute or two the site will be live at `https://<your-username>.github.io/<repository-name>/`.

## Run it locally

Any static web server works. For example:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly from disk won't work, because browsers block JavaScript modules on `file://` URLs.)

## Privacy

- All data is stored in the browser's `localStorage` on the person's own device. There is no server, account, analytics, cookies or third-party code.
- Fonts are self-hosted, and a Content Security Policy allows only same-origin resources.
- People can erase everything with **Start over**, or download a backup file to move their results between devices.

## Accessibility

Lodestar targets **WCAG 2.2 AA**:

- Works with the keyboard alone. Every action is a real button, so no dragging is needed (WCAG 2.5.7). Number-key shortcuts for sorting only work while focus is inside the sorter (WCAG 2.1.4).
- Screen-reader support: landmarks, a skip link, focus moved to the page heading on navigation, a polite live region announcing each card and placement, labelled form controls, and a text alternative for the chart.
- Color contrast checked in light and dark themes. Pile meaning never relies on color alone; each pile also has an icon and a text label.
- Respects `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast` and Windows high-contrast (`forced-colors`) settings, with a manual light, dark or auto toggle.
- Touch targets are at least 44×44 px. Layouts reflow at 320 px wide (400% zoom) without horizontal scrolling.
- Body text uses **Atkinson Hyperlegible**, designed by the Braille Institute for low-vision readers.

Every page has been tested end to end with Playwright and axe-core (WCAG 2.0, 2.1 and 2.2 A/AA rules plus best practices), in light and dark mode, at desktop and phone sizes, with zero violations. Automated checks can't catch everything, so testing with real assistive technology users is still welcome.

## Project structure

```
index.html              App shell (header, footer, live region)
manifest.webmanifest    Install-to-home-screen metadata
sw.js                   Offline cache (bump VERSION when you change files)
assets/css/styles.css   Design system: tokens, components, themes, print
assets/js/app.js        Router, views and interactions
assets/js/values.js     The values deck (edit here to change the cards)
assets/js/content.js    Learn and About page content and references
assets/js/store.js      Local storage, import validation
assets/fonts/           Self-hosted fonts (SIL Open Font License)
assets/icons/           App icons
docs/research/          Research briefs with verified citations
docs/VALUES-MAP.md      Values map findings and proposed deck changes
docs/values-map.html    Interactive values map
scripts/check-deck.mjs  Checks every card against ACT's definition of a value
```

### Editing the deck

Cards live in `assets/js/values.js`. Each one needs a unique `id`, a `name` and a short `desc`. Keep descriptions as **qualities of action** (how someone wants to behave), not outcomes or feelings; that is how ACT defines values. Then run `node scripts/check-deck.mjs`, which checks every card against ACT's definition of a value: a chosen quality of ongoing action, never completed, within the person's control, and not an outcome, feeling or rule. The same check runs automatically on GitHub whenever the deck changes. After changing any file, bump `VERSION` in `sw.js` so returning visitors get the update.

## Credits and licenses

- Value names draw on the common vocabulary of ACT values work and the public-domain *Personal Values Card Sort* (Miller, C'de Baca, Matthews & Wilbourne, 2001). All descriptions, prompts and text are original.
- The reflection step is inspired by the structure of the Valued Living Questionnaire (Wilson et al., 2010) and the Bull's-Eye Values Survey (Lundgren et al., 2012). No items from those measures are reproduced.
- Fonts: Atkinson Hyperlegible (Braille Institute of America) and Fraunces (Undercase Type), both under the SIL Open Font License 1.1 (see `assets/fonts/`).

## Important

Lodestar is an educational self-reflection tool. It is not therapy and does not diagnose or treat any condition. If you are in crisis, call or text **988** in the US, visit **findahelpline.com** elsewhere, or call your local emergency number.
