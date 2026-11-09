// Everything people type must be shown as text, never run or parsed as HTML.
// Saves an HTML-like payload in every field a person can type into, then visits
// every page and checks no element was created and no script ran. The page's
// Content Security Policy is bypassed here, so this tests the escaping itself.
const { BASE, VARIANTS, check, open, axe, finish, exit } = require('./lib');

const PAYLOAD = `<img src=x onerror="window.__xss=(window.__xss||0)+1"><b>bold</b>"'&`;

(async () => {
  const { VALUES } = await import('../assets/js/values.js');
  const ids = VALUES.map((v) => v.id);
  const custom = { id: 'custom-x', name: `Value ${PAYLOAD}`.slice(0, 60), desc: PAYLOAD };
  const area = { id: 'area-x', name: PAYLOAD.slice(0, 40), def: '' };
  const state = {
    schema: 2,
    order: ids, pos: ids.length,
    piles: Object.fromEntries([...ids.map((id, i) => [id, i % 3 ? 'some' : 'very']), [custom.id, 'very']]),
    custom: [custom],
    core: [custom.id, ids[0], ids[3]],
    ranked: true,
    reflections: { [custom.id]: { meaning: PAYLOAD, living: 4, why: 'means', leadsTo: PAYLOAD } },
    actions: [{ id: 'a1', valueId: custom.id, areaId: area.id, step: PAYLOAD, when: PAYLOAD, obstacles: PAYLOAD, response: PAYLOAD }],
    decisions: [{ id: 'd1', question: PAYLOAD, options: [{ id: 'o1', label: PAYLOAD }, { id: 'o2', label: 'Other' }],
      ratings: { o1: { [custom.id]: 1 }, o2: {} }, feelings: PAYLOAD, choice: PAYLOAD }],
    customAreas: [area],
    areas: { [area.id]: { status: 'hard', importance: 4, living: 2, values: [custom.id] } },
  };
  const pages = ['', 'sort', 'core', 'rank', 'reflect', 'act', 'results', 'areas', 'areas/pick', 'areas/rate/1', 'decide', 'decide/d1'];

  for (const v of VARIANTS) {
    console.log(`\n# Escaping (${v.name})`);
    const { browser, page, errors } = await open(v);
    await page.goto(BASE);
    await page.evaluate((s) => localStorage.setItem('lodestar:v1', JSON.stringify(s)), state);
    for (const route of pages) {
      await page.goto(`${BASE}#/${route}`); await page.reload(); await page.waitForSelector('h1');
      const r = await page.evaluate(() => ({
        injected: document.querySelectorAll('img[src="x"], #app b').length,
        ran: window.__xss || 0,
        shown: document.body.innerText.includes('<img src=x') || document.body.innerText.includes('<b>bold</b>'),
      }));
      check(r.injected === 0 && r.ran === 0, `#/${route}: typed text creates no elements and runs no code`);
      if (!['', 'sort', 'decide'].includes(route)) check(r.shown, `#/${route}: typed text is shown as plain text`);
    }
    // Dialogs that include typed text
    await page.goto(`${BASE}#/areas/pick`); await page.waitForSelector('#areas-form');
    await page.click('[data-remove-area]');
    const dlg = await page.evaluate(() => ({ injected: document.querySelectorAll('dialog img, dialog b').length, ran: window.__xss || 0, title: document.querySelector('dialog h2')?.textContent || '' }));
    check(dlg.injected === 0 && dlg.ran === 0 && dlg.title.includes('<img'), 'confirmation dialog shows an area name as plain text');
    await page.click('dialog button[value="cancel"]');
    // Typing it in through the interface too
    await page.goto(`${BASE}#/sort`); await page.waitForSelector('h1');
    await page.click('[data-action="add-custom"]');
    await page.fill('#c-name', PAYLOAD.slice(0, 40));
    await page.click('#c-save');
    await page.waitForTimeout(200);
    const typed = await page.evaluate(() => ({ injected: document.querySelectorAll('img[src="x"], #app b, .toast b').length, ran: window.__xss || 0 }));
    check(typed.injected === 0 && typed.ran === 0, 'a custom value typed into the form is shown as plain text');
    await axe(page, 'page full of typed HTML-like text');
    await finish(browser, errors, v.name);
  }
  exit();
})().catch((e) => { console.error('Test crashed:', e.message); process.exit(1); }); // exit even if a browser is still open
