// Backup files: the status on My values, the reminder once unsaved work is a
// couple of days old, downloading, and restoring (including the warnings for
// a file from a newer version and for a device with newer changes).
const fs = require('fs');
const path = require('path');
const { BASE, OUT, VARIANTS, check, open, axe, finish, exit } = require('./lib');

const DAY = 86_400_000;

(async () => {
  const { VALUES } = await import('../assets/js/values.js');
  const { SCHEMA } = await import('../assets/js/store.js');
  const ids = VALUES.map((v) => v.id);
  const saved = (updated) => ({
    schema: SCHEMA, updated,
    order: ids, pos: ids.length,
    piles: Object.fromEntries(ids.map((id, i) => [id, i % 3 ? 'some' : 'very'])),
    core: [ids[0], ids[3]], ranked: true,
  });

  for (const v of VARIANTS) {
    console.log(`\n# Backups (${v.name})`);
    const { browser, page, errors } = await open(v);
    await page.goto(BASE);
    await page.waitForSelector('h1');
    check(await page.locator('main button', { hasText: 'Restore from a backup file' }).isVisible(), 'a new browser offers to restore a backup on the home page');

    // Work saved three days ago that has never been backed up.
    const old = new Date(Date.now() - 3 * DAY).toISOString();
    await page.evaluate(({ s, since }) => {
      localStorage.setItem('lodestar:v1', JSON.stringify(s));
      localStorage.setItem('lodestar:unsaved-since', String(since));
    }, { s: saved(old), since: Date.now() - 3 * DAY });
    await page.goto(`${BASE}#/results`); await page.reload(); await page.waitForSelector('h1');
    check(await page.locator('.notice--backup').isVisible(), 'unsaved work 3 days old shows a backup reminder');
    check(/No backup file saved yet/.test(await page.locator('[data-backup-status]').textContent()), 'the status says no backup has been saved');
    await axe(page, `results with backup reminder (${v.name})`);
    await page.screenshot({ path: path.join(OUT, `backup-reminder-${v.name}.png`), fullPage: false });
    await page.goto(BASE); await page.waitForSelector('h1');
    check(await page.locator('.notice--backup').isVisible(), 'the reminder also shows on the home page');
    check(!(await page.locator('main button', { hasText: 'Restore from a backup file' }).count()), 'the home page restore offer is gone once there is progress');

    // Download it.
    await page.goto(`${BASE}#/results`); await page.waitForSelector('h1');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('.notice--backup button', { hasText: 'Download backup file' }).click(),
    ]);
    const file = path.join(OUT, `backup-${v.name}.json`);
    await download.saveAs(file);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    check(data.app === 'lodestar' && !Number.isNaN(Date.parse(data.savedAt)) && data.core.length === 2, 'the backup file has the results and when it was saved');
    check(!(await page.locator('.notice--backup').count()), 'downloading removes the reminder');
    check(/Everything is in your last backup file, saved today/.test(await page.locator('[data-backup-status]').textContent()), 'the status says everything is backed up');
    await page.reload(); await page.waitForSelector('h1');
    check(/saved today/.test(await page.locator('[data-backup-status]').textContent()), 'the backup time is remembered after a reload');

    // A change after the backup.
    await page.goto(`${BASE}#/reflect`); await page.waitForSelector('textarea');
    await page.locator('textarea').first().fill('Changed after the backup');
    await page.waitForTimeout(500);
    await page.goto(`${BASE}#/results`); await page.waitForSelector('h1');
    check(/changes that aren’t in a backup file yet/.test(await page.locator('[data-backup-status]').textContent()), 'a later change shows as not backed up');
    check(!(await page.locator('.notice--backup').count()), 'a fresh change does not show the reminder yet');

    // Restoring the older file warns that this device's newer changes would be lost.
    const chooser = async (content) => {
      const p = path.join(OUT, `restore-${v.name}.json`);
      fs.writeFileSync(p, JSON.stringify(content));
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.toolbox button', { hasText: 'Restore from backup' }).click()]);
      await fc.setFiles(p);
      await page.waitForSelector('dialog[open]');
      return page.locator('dialog[open]');
    };
    let dlg = await chooser(data);
    const body = await dlg.locator('#dlg-body').textContent();
    check(/This backup was saved on/.test(body) && /would be lost/.test(body), 'restoring an older file says when it was saved and warns about newer changes');
    await axe(page, `restore dialog (${v.name})`);
    await dlg.locator('button', { hasText: 'Restore' }).click();
    await page.waitForSelector('dialog', { state: 'detached' });
    const reflections = await page.evaluate(() => JSON.parse(localStorage.getItem('lodestar:v1')).reflections);
    check(!JSON.stringify(reflections).includes('Changed after the backup'), 'the restore replaced this device’s data');
    check(/Everything is in your last backup file/.test(await page.locator('[data-backup-status]').textContent()), 'after a restore, everything counts as backed up');

    // A file from a newer version is refused and changes nothing.
    const before = await page.evaluate(() => localStorage.getItem('lodestar:v1'));
    dlg = await chooser({ ...data, schema: SCHEMA + 1, core: [] });
    check(/newer version/.test(await dlg.textContent()) && !(await dlg.locator('button', { hasText: 'Restore' }).count()), 'a backup from a newer version is refused');
    await dlg.locator('button', { hasText: 'OK' }).click();
    await page.waitForSelector('dialog', { state: 'detached' });
    check(before === await page.evaluate(() => localStorage.getItem('lodestar:v1')), 'refusing it changes nothing');

    // Start over forgets the backup time.
    await page.locator('.toolbox button', { hasText: 'Start over' }).click();
    await page.locator('dialog[open] button', { hasText: 'Erase everything' }).click();
    await page.waitForSelector('dialog', { state: 'detached' });
    check(await page.evaluate(() => localStorage.getItem('lodestar:last-backup') === null), 'start over forgets when the last backup was saved');

    await finish(browser, errors, `backups (${v.name})`);
  }
  exit();
})();
