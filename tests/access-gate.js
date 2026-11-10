// The access code gate: off while ACCESS_CODE_HASH is empty; when set, every
// page but Learn asks for the code once per device, and again if it changes.
const { BASE, VARIANTS, check, open, axe, finish, exit } = require('./lib');
const fs = require('fs');
const path = require('path');

const config = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'config.js'), 'utf8');
const withHash = (h) => config.replace(/export const ACCESS_CODE_HASH = '[^']*';/, `export const ACCESS_CODE_HASH = '${h}';`);
const serve = async (page, h) => { await page.unrouteAll(); await page.route('**/assets/js/config.js', (r) => r.fulfill({ contentType: 'text/javascript', body: withHash(h) })); };
const GATE = 'h1:has-text("Enter your access code")';

(async () => {
  const { hashCode } = await import('../assets/js/access.js');
  const HASH = await hashCode('open sesame');
  const NEW_HASH = await hashCode('new code please');

  for (const v of VARIANTS) {
    console.log(`\n# Access code gate (${v.name})`);
    const { browser, page, errors } = await open(v, { unlocked: false });

    await serve(page, '');
    await page.goto(BASE); await page.waitForSelector('h1');
    check((await page.locator(GATE).count()) === 0, 'no code set: no gate');

    await serve(page, HASH);
    await page.goto(`${BASE}#/results`); await page.reload(); await page.waitForSelector('#main h1');
    check((await page.locator(GATE).count()) === 1, 'code set: deep link to My values shows the gate');
    check(await page.locator('.site-nav').isHidden(), 'main navigation hidden while locked');
    check(/988/.test(await page.locator('.site-footer').innerText()), 'crisis resources still shown');
    await axe(page, 'gate');

    await page.click('#app a[href="#/learn"]'); await page.waitForSelector('#main h1');
    check((await page.locator(GATE).count()) === 0, 'Learn page is open without a code');
    await page.goto(`${BASE}#/results`); await page.waitForSelector(GATE);

    await page.click('button:has-text("Unlock")');
    check(await page.locator('#g-code-err').isVisible(), 'empty code: error shown');
    await page.fill('#g-code', 'wrong code'); await page.click('button:has-text("Unlock")');
    await page.waitForSelector('#g-code-err:has-text("didn’t work")');
    check((await page.getAttribute('#g-code', 'aria-invalid')) === 'true', 'wrong code: field marked invalid');
    await axe(page, 'gate with error');

    await page.fill('#g-code', '  Open  SESAME '); await page.click('button:has-text("Unlock")');
    await page.waitForSelector('h1:not(:has-text("Enter your access code"))');
    check(page.url().endsWith('#/results'), 'right code (any case and spacing): opens the page asked for');
    check(await page.locator('.site-nav').isVisible(), 'main navigation shown once unlocked');
    check(await page.evaluate(() => document.activeElement?.tagName === 'H1'), 'focus moves to the page heading');

    await page.reload(); await page.waitForSelector('#main h1');
    check((await page.locator(GATE).count()) === 0, 'stays unlocked after reloading');

    await serve(page, NEW_HASH);
    await page.reload(); await page.waitForSelector('#main h1');
    check((await page.locator(GATE).count()) === 1, 'code changed: asked again');
    await finish(browser, errors, v.name);
  }
  exit();
})().catch((e) => { console.error('Test crashed:', e.message); process.exit(1); });
