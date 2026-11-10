# Lodestar: an ACT values card sort

Lodestar is a free, private web app that guides people through an **Acceptance and Commitment Therapy (ACT) values card sort**. It helps people discover what matters most to them, put it in their own words, take small committed actions, and use their values to make decisions.

It works on phones and desktops, can be installed to a home screen, works offline, and never sends anyone's answers anywhere.

## What it does

1. **Sort**: 72 value cards, one at a time, into *very important*, *somewhat important* or *less important to me*. People can add their own values (with a gentle prompt if a card names an outcome like wealth or a feeling like happiness), undo, and review or move cards afterwards.
2. **Choose**: narrow the "very important" pile to up to 10 core values, with prompts that check whether each value is truly theirs (ACT's "pliance" check). If the pile is large, an optional best-worst round (pick the most and least important of a few cards at a time) suggests a top five.
3. **Rank**: order the core values by hand, or answer a few either/or questions (a binary-insertion ranking that keeps the number of questions small). Values can be marked "on a par" when they can't honestly be ordered.
4. **Reflect**: write what each value means to them, say whether they hold it for its own sake or for what it gives them, and rate how fully they have lived it over the past two weeks (inspired by the Valued Living Questionnaire and the Values Bull's-Eye). A gentle nudge appears if a value starts sounding like a "should".
5. **Act**: plan a small, specific committed action, with what might get in the way and how they will respond (ACT willingness).

It also includes:

- **My values**: a summary with a bull's-eye chart, action plan, print or save as PDF, copy as text, share, and backup or restore to a file.
- **Life areas** (optional): after planning an action, people can map their values to the areas of life that fit them (family, work, health, their own areas…), say an area is hard right now or not part of their life, and plan a step in a chosen area. No scores are shown.
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

## Collect feedback and bug reports

People can leave comments and report problems through a Google Form, with no GitHub account needed. The links stay hidden until you add a form.

1. Create a form at [forms.google.com](https://forms.google.com). Suggested questions:
   - **What kind of feedback is this?** (multiple choice: Something isn't working / Idea or suggestion / Comment)
   - **What happened, or what would you like to tell us?** (paragraph)
   - **Which device and browser were you using?** (short answer, optional)
   - **May we contact you about your feedback?** (multiple choice, optional: No, keep me anonymous / Yes, I'm happy to be contacted)
   - **If yes, your name and email or phone number** (short answer, optional)
2. In the form's **Settings → Responses**, leave **Collect email addresses** off so people can stay anonymous. Keep **Limit to 1 response** off (it would force people to sign in to Google), and don't add a file upload question, which also requires sign-in. Turn on email notifications for new responses under the **Responses** tab if you want them.
3. Click **Send**, choose the link tab, copy the link and paste it into `FEEDBACK_FORM_URL` in `assets/js/config.js`. Only `forms.gle` and `docs.google.com/forms` links are accepted.
4. Bump `VERSION` in `sw.js`, then commit.

A "Send feedback or report a problem" link then appears in the footer of every page, and a Feedback section appears on the About page. Both ask people not to include their answers or anything that identifies them. Responses go to your Google account; nothing from the card sort is attached.

## Require an access code (optional)

You can limit Lodestar to people you give a code to, for example while it is being tested with a clinic or a study group. While no code is set, anyone can use it.

1. Choose a code. A few unrelated words (like `amber kite harbor`) are easy to share and hard to guess. Case and extra spaces don't matter.
2. Run `node scripts/hash-access-code.mjs "amber kite harbor"` (Node 22 or later). It prints a line like `export const ACCESS_CODE_HASH = '3f9a…';`.
3. Replace the `ACCESS_CODE_HASH` line in `assets/js/config.js` with it. Only the hash goes in the repository, never the code itself.
4. Bump `VERSION` in `sw.js`, then commit.

People then see an "Enter your access code" screen before any page except **Learn**, which stays open to everyone. The crisis resources and the feedback link in the footer stay visible too. The code is remembered on each device, so people enter it once. To change it, repeat the steps with a new code; everyone will be asked for the new one. To turn the gate off, set `ACCESS_CODE_HASH` back to `''`.

This keeps casual visitors out, but it is not real security. The site has no server, so the code is checked in the browser, and someone determined could read the site's files and get past it. For content that must stay private, host the site somewhere with password protection instead (for example Cloudflare Pages or Netlify).

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
- If an access code is set, the device remembers that it was entered (under its own key, kept by **Start over**). The code is checked in the browser and never sent anywhere.
- People can erase everything with **Start over**, or download a backup file to move their results between devices.

## Accessibility

Lodestar targets **WCAG 2.2 AA**:

- Works with the keyboard alone. Every action is a real button, so no dragging is needed (WCAG 2.5.7). Number-key shortcuts for sorting only work while focus is inside the sorter (WCAG 2.1.4).
- Screen-reader support: landmarks, a skip link, focus moved to the page heading on navigation, a polite live region announcing each card and placement, labelled form controls, and a text alternative for the chart.
- Color contrast checked in light and dark themes. Pile meaning never relies on color alone; each pile also has an icon and a text label.
- Respects `prefers-color-scheme`, `prefers-reduced-motion`, `prefers-contrast` and Windows high-contrast (`forced-colors`) settings, with a manual light, dark or auto toggle.
- Touch targets are at least 44×44 px. Layouts reflow at 320 px wide (400% zoom) without horizontal scrolling.
- Body text uses **Atkinson Hyperlegible**, designed by the Braille Institute for low-vision readers.

Every page is tested end to end with Playwright and axe-core (see [`tests/`](tests/)) (WCAG 2.0, 2.1 and 2.2 A/AA rules plus best practices), in light and dark mode, at desktop and phone sizes, with zero violations. Automated checks can't catch everything, so testing with real assistive technology users is still welcome.

## Project structure

```
index.html              App shell (header, footer, live region)
manifest.webmanifest    Install-to-home-screen metadata
sw.js                   Offline cache (bump VERSION when you change files)
assets/css/styles.css   Design system: tokens, components, themes, print
assets/js/app.js        Router, views and interactions
assets/js/values.js     The values deck (edit here to change the cards)
assets/js/content.js    Learn and About page content and references
assets/js/config.js     Site settings: the feedback form link and access code
assets/js/access.js     The optional access code check
assets/js/store.js      Local storage, import validation
assets/fonts/           Self-hosted fonts (SIL Open Font License)
assets/icons/           App icons
docs/research/          Research briefs with verified citations
docs/VALUES-MAP.md      Values map findings and proposed deck changes
docs/values-map.html    Interactive values map
scripts/check-deck.mjs  Checks every card against ACT's definition of a value
scripts/hash-access-code.mjs  Prints the config line for an access code
tests/                  End-to-end and accessibility tests (npm test)
```

### Editing the deck

Cards live in `assets/js/values.js`. Each one needs a unique `id`, a `name` and a short `desc`. Keep descriptions as **qualities of action** (how someone wants to behave), not outcomes or feelings; that is how ACT defines values. Then run `node scripts/check-deck.mjs`, which checks every card against ACT's definition of a value: a chosen quality of ongoing action, never completed, within the person's control, and not an outcome, feeling or rule. The same check runs automatically on GitHub whenever the deck changes. After changing any file, bump `VERSION` in `sw.js` so returning visitors get the update.

## Running the tests

```sh
cd tests
npm ci
npx playwright install chromium
npm test
```

This checks the deck against ACT's definition of a value, checks the offline cache and the values map, runs the unit tests for saved data, then runs the end-to-end tests in a light desktop window and a dark phone-sized one, with an accessibility check on every screen. See [`tests/README.md`](tests/README.md).

## Credits and licenses

- Value names draw on the common vocabulary of ACT values work and the public-domain *Personal Values Card Sort* (Miller, C'de Baca, Matthews & Wilbourne, 2001). All descriptions, prompts and text are original.
- The reflection step is inspired by the structure of the Valued Living Questionnaire (Wilson et al., 2010) and the Bull's-Eye Values Survey (Lundgren et al., 2012). No items from those measures are reproduced.
- Fonts: Atkinson Hyperlegible (Braille Institute of America) and Fraunces (Undercase Type), both under the SIL Open Font License 1.1 (see `assets/fonts/`).

## Important

Lodestar is an educational self-reflection tool. It is not therapy and does not diagnose or treat any condition. If you are in crisis, call or text **988** in the US, visit **findahelpline.com** elsewhere, or call your local emergency number.
