// The main path: sort, choose, rank, reflect, act, results, decide, learn.
const { BASE, VARIANTS, check, open, axe, state, sortDeck, finish, exit } = require('./lib');

(async () => {
  for (const v of VARIANTS) {
    console.log(`\n# Core flow (${v.name})`);
    const { browser, page, errors } = await open(v);
    await page.goto(BASE); await page.waitForSelector('h1');
    await axe(page, 'home');

    await page.goto(`${BASE}#/sort`); await page.waitForSelector('.vcard--live');
    await axe(page, 'sort');
    // Undo puts the card back.
    await page.click('.pile-btn[data-pile="very"]'); await page.waitForTimeout(300);
    await page.click('[data-action="undo"]'); await page.waitForTimeout(100);
    check((await state(page)).pos === 0, 'undo returns to the first card');

    await sortDeck(page, (i) => (i % 7 === 0 ? 'very' : i % 3 === 0 ? 'some' : i % 2 ? 'very' : 'not'));
    await axe(page, 'review piles');

    await page.click('text=Choose core values'); await page.waitForSelector('#core-form');
    const boxes = page.locator('#core-form > fieldset .pick');
    for (let i = 0; i < 11; i++) {
      const cb = page.locator('#core-form > fieldset input[type=checkbox]').nth(i);
      if (!(await cb.isChecked())) await boxes.nth(i).click();
    }
    check((await page.locator('#core-form input:checked').count()) === 10, 'core values are capped at 10');
    check(await page.locator('#core-error').isVisible(), 'cap shows an error message');
    const checked = page.locator('#core-form input:checked');
    while ((await checked.count()) > 5) await checked.last().locator('xpath=..').click();
    await axe(page, 'choose');

    await page.click('#core-next'); await page.waitForSelector('#rank-list');
    await page.click('#rank-list button[data-move="down"] >> nth=0');
    check(/down|up/.test(await page.evaluate(() => document.activeElement.getAttribute('aria-label') || '')), 'focus stays on a move button after moving');
    await page.locator('#rank-list input[data-tie]').nth(1).check();
    check((await page.locator('.rank-item__n').allTextContents()).join(',') === '1,2,2,4,5', 'tied values share a rank number');
    await axe(page, 'rank');

    await page.click('#rank-next'); await page.waitForSelector('#reflect-form');
    await page.locator('textarea[data-meaning]').first().fill('I should always be there for people.');
    check((await page.locator('.nudge:not([hidden])').count()) >= 1, '"should" nudge appears in Reflect');
    await page.locator('.seg--why .seg__opt').nth(1).click();
    check((await page.locator('.why-more:not([hidden])').count()) === 1, '"what does it give you" follow-up appears');
    await page.locator('input[type=range]').first().fill('3');
    await axe(page, 'reflect');

    await page.click('text=Plan an action'); await page.waitForSelector('#act-form');
    await page.click('#act-form button[type=submit]');
    check(await page.locator('#a-step-err').isVisible(), 'empty action shows an error');
    await page.fill('#a-step', 'Call my sister on Saturday.');
    await page.click('#act-form button[type=submit]');
    check((await state(page)).actions.length === 1, 'action is saved');
    await axe(page, 'act');

    await page.click('text=See my values'); await page.waitForSelector('.value-list');
    check((await page.locator('.value').count()) === 5, 'results list the five core values');
    await axe(page, 'results');

    await page.goto(`${BASE}#/decide`); await page.click('[data-action="new-decision"]'); await page.waitForSelector('#decision-form');
    await page.fill('#d-q', 'Should I take the new job?');
    const radios = page.locator('.seg__opt');
    await radios.nth(2).click();
    check((await page.locator('#d-summary .summary').count()) >= 2, 'decision summary appears once options are rated');
    await axe(page, 'decide');

    await page.goto(`${BASE}#/learn`); await page.waitForSelector('.toc');
    await axe(page, 'learn');
    await page.goto(`${BASE}#/about`); await page.waitForSelector('#refs-h');
    await axe(page, 'about');

    await page.goto(`${BASE}#/results`); await page.reload(); await page.waitForSelector('.value-list');
    check((await page.locator('.value').count()) === 5, 'progress survives a reload');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    check(!overflow, 'no horizontal scrolling');
    await finish(browser, errors, v.name);
  }
  exit();
})().catch((e) => { console.error('Test crashed:', e.message); process.exit(1); }); // exit even if a browser is still open
