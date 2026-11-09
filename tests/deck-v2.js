// Deck version 2 features and migration from the original 65-card deck.
const { BASE, VARIANTS, check, open, axe, state, sortDeck, finish, exit } = require('./lib');

(async () => {
  const { VALUES } = await import('../assets/js/values.js');
  const { SCHEMA } = await import('../assets/js/store.js');
  for (const v of VARIANTS) {
    console.log(`\n# Deck v2 (${v.name})`);
    const { browser, page, errors } = await open(v);
    await page.goto(BASE); await page.waitForSelector('h1');
    check((await page.locator('.notice--update').count()) === 0, 'new visitors see no "deck updated" notice');

    const total = await sortDeck(page, (i) => (i % 5 === 0 ? 'some' : i % 4 === 0 ? 'not' : 'very'));
    check(total === VALUES.length, `the sort covers every card in the deck (${VALUES.length})`);

    // Custom card nudges
    await page.click('[data-action="add-custom"]');
    await page.fill('#c-name', 'Wealth');
    check(await page.locator('#c-nudge').isVisible(), 'outcome-like custom card gets a gentle prompt');
    await page.fill('#c-name', 'Being happy');
    check(/feeling/.test(await page.locator('#c-nudge').textContent()), 'feeling-like custom card gets a gentle prompt');
    await axe(page, 'custom card dialog');
    await page.click('text=Cancel');

    // Narrowing round for a large "very important" pile; no choices yet, so it fills the top five
    await page.click('text=Choose core values'); await page.waitForSelector('#core-form');
    await page.click('[data-action="narrow"]');
    let guard = 0;
    while ((await page.locator('.bw__choices').count()) && guard++ < 200) {
      if (guard === 1) await axe(page, 'narrowing round');
      const label = await page.locator('.pairwise .muted').first().textContent();
      await page.locator('.bw__choices .choice').first().click();
      await page.waitForFunction((l) => !document.querySelector('.pairwise .muted') || document.querySelector('.pairwise .muted').textContent !== l, label);
    }
    check((await state(page)).core.length === 5, 'narrowing fills an empty core list with five values');

    // Running it again keeps the person's choices and offers a suggestion instead
    const boxes = page.locator('#core-form > fieldset .pick');
    await boxes.last().click();
    const before = (await state(page)).core.join();
    await page.click('[data-action="narrow"]');
    guard = 0;
    while ((await page.locator('.bw__choices').count()) && guard++ < 200) {
      const label = await page.locator('.pairwise .muted').first().textContent();
      await page.locator('.bw__choices .choice').last().click();
      await page.waitForFunction((l) => !document.querySelector('.pairwise .muted') || document.querySelector('.pairwise .muted').textContent !== l, label);
    }
    check((await state(page)).core.join() === before, 'a second narrowing round keeps the chosen values');
    check((await page.locator('.suggest').count()) === 1, 'it offers its suggestion instead');

    // Reshuffling clears stale narrowing scores
    await page.goto(`${BASE}#/sort`); await page.waitForSelector('h1');
    await page.click('[data-action="resort"]'); await page.click('dialog button[value="ok"]'); await page.waitForTimeout(200);
    check(Object.keys((await state(page)).bw).length === 0, 'sorting again clears narrowing scores');

    // Migration from a saved 65-card (schema 1) state
    await page.evaluate(() => localStorage.setItem('lodestar:v1', JSON.stringify({
      schema: 1, order: ['caring', 'kindness', 'trust', 'connection', 'mindfulness', 'peace', 'diligence', 'honesty'], pos: 8,
      piles: { caring: 'very', kindness: 'some', trust: 'very', connection: 'some', mindfulness: 'very', peace: 'not', diligence: 'very', honesty: 'very' },
      history: [], custom: [], core: ['caring', 'trust', 'mindfulness', 'connection', 'honesty'], ranked: true,
      reflections: { caring: { meaning: 'Looking out for people', living: 6 }, kindness: { meaning: 'Being warm', living: 3 } },
      actions: [{ id: 'a1', valueId: 'caring', step: 'Call Mum' }],
      decisions: [{ id: 'd1', question: 'Q', options: [{ id: 'o1', label: 'A' }], ratings: { o1: { caring: 1, kindness: -1 } } }],
    })));
    await page.goto(BASE); await page.reload(); await page.waitForSelector('.notice--update');
    const st = await state(page);
    check(st.schema === SCHEMA, `saved data is migrated and saved as schema ${SCHEMA}`);
    check(/Mastery became two cards, Craft and Resourcefulness/.test(await page.locator('.notice--update').textContent()), 'the notice says where Mastery went');
    check(st.core.join() === 'kindness,trusting-others,presence,honesty', 'merged and renamed core values carry over without duplicates');
    check(st.piles.kindness === 'very' && st.piles.presence === 'very', 'merged cards keep the stronger pile');
    check(st.reflections.kindness.meaning.includes('Looking out') && st.reflections.kindness.meaning.includes('Being warm'), 'both reflections are kept when cards merge');
    check(st.actions[0].valueId === 'kindness', 'actions follow their card');
    check(st.order.length === VALUES.length && st.pos === 6, 'new cards are queued after the ones already sorted');
    await axe(page, 'home with update notice');
    await page.click('[data-action="dismiss-update"]');
    check((await state(page)).deckUpdated === false, 'the notice can be dismissed');
    await finish(browser, errors, v.name);
  }
  exit();
})().catch((e) => { console.error('Test crashed:', e.message); process.exit(1); }); // exit even if a browser is still open
