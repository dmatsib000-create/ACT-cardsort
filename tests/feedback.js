// The feedback link: hidden until a Google Form is set in assets/js/config.js,
// then shown in the footer and on the About page.
const { BASE, VARIANTS, check, open, axe, finish, exit } = require('./lib');
const fs = require('fs');
const path = require('path');

const config = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'config.js'), 'utf8');
const withUrl = (url) => config.replace(/export const FEEDBACK_FORM_URL = '[^']*';/, `export const FEEDBACK_FORM_URL = '${url}';`);
const serve = (page, url) => page.route('**/assets/js/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: withUrl(url) }));
const FORM = 'https://forms.gle/LodestarTest';

(async () => {
  for (const v of VARIANTS) {
    console.log(`\n# Feedback link (${v.name})`);
    const { browser, page, errors } = await open(v);

    await serve(page, '');
    await page.goto(`${BASE}#/about`); await page.waitForSelector('#refs-h');
    check(await page.locator('#feedback-footer').isHidden(), 'no form set: footer link hidden');
    check((await page.locator('#feedback-h').count()) === 0, 'no form set: no About section');

    await page.unrouteAll(); await serve(page, 'https://example.com/forms/x');
    await page.reload(); await page.waitForSelector('#refs-h');
    check(await page.locator('#feedback-footer').isHidden(), 'non-Google link is ignored');

    await page.unrouteAll(); await serve(page, FORM);
    await page.reload(); await page.waitForSelector('#feedback-h');
    const link = page.locator('#feedback-link');
    check(await link.isVisible(), 'form set: footer link shown');
    check((await link.getAttribute('href')) === FORM && (await link.getAttribute('target')) === '_blank', 'footer link opens the form in a new tab');
    check((await page.locator(`#feedback a[href="${FORM}"]`).count()) === 1, 'About page links to the form');
    check(/don’t include/.test(await page.locator('#feedback-footer').innerText()), 'footer warns not to include personal answers');
    await axe(page, 'about with feedback');
    await page.goto(BASE); await page.waitForSelector('h1');
    check(await link.isVisible(), 'footer link shown on other pages too');
    await finish(browser, errors, v.name);
  }
  exit();
})().catch((e) => { console.error('Test crashed:', e.message); process.exit(1); });
