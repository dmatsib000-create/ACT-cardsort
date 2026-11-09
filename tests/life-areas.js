// The optional life areas exercise and the area tag on actions.
const { BASE, VARIANTS, check, open, axe, state, sortDeck, finish, exit } = require('./lib');

(async () => {
  for (const v of VARIANTS) {
    console.log(`\n# Life areas (${v.name})`);
    const { browser, page, errors } = await open(v);
    await sortDeck(page, (i) => (i % 9 === 0 ? 'very' : 'some'));
    await page.goto(`${BASE}#/core`); await page.waitForSelector('#core-form');
    await page.goto(`${BASE}#/results`); await page.waitForSelector('.area-invite');
    await axe(page, 'results with invitation');

    await page.click('.area-invite a'); await page.waitForSelector('#areas-form');
    await page.click('#areas-form button[type=submit]');
    check(await page.locator('#areas-err').isVisible(), 'continuing with no areas shows an error');
    for (const n of ['Family', 'Work', 'Health and body']) await page.locator('#areas-form .pick', { hasText: n }).click();
    await page.fill('#new-area', 'My garden'); await page.press('#new-area', 'Enter');
    check(await page.locator('#areas-form .pick', { hasText: 'My garden' }).locator('input').isChecked(), 'a custom area is added and selected');
    check(await page.locator('#areas-form .pick', { hasText: 'Work' }).locator('input').isChecked(), 'earlier ticks are kept');
    check(Object.keys((await state(page)).areas).length === 0, 'picks are not saved until Continue');
    await axe(page, 'choose areas');
    await page.click('#areas-form button[type=submit]');

    // Family: hard right now, values capped at three
    await page.waitForSelector('#area-form');
    await page.locator('.radio', { hasText: 'hard right now' }).click();
    check(await page.locator('#hard-note').isVisible(), '"hard right now" shows a gentle note');
    await page.locator('.seg__opt', { hasText: 'Extremely' }).click();
    const chips = page.locator('#area-form .area-chips .chip-opt');
    for (let i = 0; i < 4; i++) await chips.nth(i).click();
    check((await page.locator('#area-form input[name=values]:checked').count()) === 3, 'an area links to at most three values');
    await axe(page, 'rate an area');
    await page.click('text=Next area');
    // Work: important, little room lately
    await page.waitForSelector('#area-form');
    await page.locator('fieldset', { hasText: 'How important' }).locator('.seg__opt', { hasText: 'Very' }).click();
    await page.locator('fieldset', { hasText: 'Lately' }).locator('.seg__opt', { hasText: 'A little' }).click();
    await chips.first().click();
    await page.click('text=Next area');
    // Health: not part of my life
    await page.waitForSelector('#area-form');
    await page.locator('.radio', { hasText: 'Not part of my life' }).click();
    check(await page.locator('#area-details').isHidden(), '"not part of my life" hides the ratings');
    await page.click('text=Next area');
    await page.waitForSelector('#area-form');
    await page.click('text=See my life areas'); await page.waitForSelector('.area-list');
    check((await page.locator('.area-card').count()) === 4, 'summary shows every chosen area');
    check(/Work/.test(await page.locator('.insight').textContent()), 'an important, neglected area is suggested as a place to act');
    check(!/score/i.test(await page.locator('main').textContent()), 'no score is shown');
    await axe(page, 'life areas summary');

    // Plan a step from an area
    await page.locator('.area-card', { hasText: 'Work' }).locator('text=Plan a step here').click();
    await page.waitForSelector('#act-form');
    check(await page.locator('input[name="a-area"][value="work"]').isChecked(), 'the area is preselected in the action step');
    await page.fill('#a-step', 'Ask for one hour of focus time.');
    await page.click('#act-form button[type=submit]');
    check((await state(page)).actions[0].areaId === 'work', 'the action is saved with its area');
    check((await page.locator('.action .tag--area').count()) === 1, 'the action shows its area');
    await axe(page, 'act with area tag');

    // A value dropped from the core list no longer fills an area's slot
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('lodestar:v1'));
      const dropped = s.areas.family.values[0];
      s.core = s.core.filter((id) => id !== dropped);
      localStorage.setItem('lodestar:v1', JSON.stringify(s));
    });
    await page.goto(`${BASE}#/areas/rate/1`); await page.reload(); await page.waitForSelector('#area-form');
    const linked = await page.locator('#area-form input[name=values]:checked').count();
    await page.locator('#area-form .chip-opt:not(:has(input:checked))').first().click();
    check((await page.locator('#area-form input[name=values]:checked').count()) === linked + 1, 'a value removed from the core list frees its slot');

    // Choosing the value again brings its link back (it was kept, only hidden)
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('lodestar:v1'));
      const hidden = s.areas.family.values.find((id) => !s.core.includes(id));
      if (hidden) { s.core.push(hidden); s.__restored = hidden; }
      localStorage.setItem('lodestar:v1', JSON.stringify(s));
    });
    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('lodestar:v1')).__restored || null);
    await page.goto(`${BASE}#/areas/rate/1`); await page.reload(); await page.waitForSelector('#area-form');
    check(restored === null, 'filling the freed slot replaced the hidden link, keeping the area at three values');
    check((await page.locator('#area-form input[name=values]:checked').count()) === 3, 'the area shows three linked values');

    // A hidden link survives a reload and returns when the value is chosen again
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('lodestar:v1'));
      const first = s.areas.family.values[0];
      s.core = s.core.filter((id) => id !== first);
      s.__dropped = first;
      localStorage.setItem('lodestar:v1', JSON.stringify(s));
    });
    await page.reload(); await page.waitForSelector('#area-form');
    check((await page.locator('#area-form input[name=values]:checked').count()) === 2, 'a dropped value stops showing as linked');
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('lodestar:v1'));
      s.core.push(s.__dropped);
      localStorage.setItem('lodestar:v1', JSON.stringify(s));
    });
    await page.reload(); await page.waitForSelector('#area-form');
    check((await page.locator('#area-form input[name=values]:checked').count()) === 3, 'choosing the value again restores its link');

    // Removing a custom area
    await page.goto(`${BASE}#/areas/pick`); await page.waitForSelector('#areas-form');
    await page.click('[data-remove-area]'); await page.click('dialog button[value="ok"]'); await page.waitForTimeout(150);
    check((await state(page)).customAreas.length === 0, 'a custom area can be removed');

    // "Not now" after adding a custom area saves no picks
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('lodestar:v1')); s.areas = {}; localStorage.setItem('lodestar:v1', JSON.stringify(s)); });
    await page.goto(`${BASE}#/areas/pick`); await page.reload(); await page.waitForSelector('#areas-form');
    await page.locator('#areas-form .pick', { hasText: 'Work' }).click();
    await page.fill('#new-area', 'Music'); await page.press('#new-area', 'Enter');
    await page.click('text=Not now'); await page.waitForTimeout(200);
    check(Object.keys((await state(page)).areas).length === 0, '"Not now" leaves no half-chosen areas behind');
    await finish(browser, errors, v.name);
  }
  exit();
})().catch((e) => { console.error('Test crashed:', e.message); process.exit(1); }); // exit even if a browser is still open
