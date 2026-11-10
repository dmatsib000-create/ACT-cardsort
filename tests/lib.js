// Shared helpers for Lodestar's end-to-end tests.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:8123/';
const OUT = path.join(__dirname, 'output');
fs.mkdirSync(OUT, { recursive: true });
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const failures = [];

function check(cond, message) {
  console.log(`${cond ? '  ok  ' : '  FAIL'} ${message}`);
  if (!cond) failures.push(message);
}

// The two viewports every test runs in.
const VARIANTS = [
  { name: 'light-desktop', scheme: 'light', viewport: { width: 1280, height: 900 } },
  { name: 'dark-phone', scheme: 'dark', viewport: { width: 390, height: 844 } },
];

// The access code hash set in config.js ('' when the gate is off).
const CONFIG = path.join(__dirname, '..', 'assets', 'js', 'config.js');
const shippedHash = () => (fs.readFileSync(CONFIG, 'utf8').match(/export const ACCESS_CODE_HASH = '([^']*)';/) || [])[1]?.trim().toLowerCase() || '';

// Pass { unlocked: false } to see the access code gate; by default the code
// counts as already entered, so tests reach the app even when a code is set.
async function open(variant, { unlocked = true } = {}) {
  // CHROMIUM_PATH lets the tests use an already-installed Chromium instead of
  // the one `npx playwright install` downloads.
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  // bypassCSP lets axe be injected; serviceWorkers are blocked so every run
  // loads the files on disk rather than an old cached copy.
  const context = await browser.newContext({ colorScheme: variant.scheme, viewport: variant.viewport, serviceWorkers: 'block', bypassCSP: true });
  const hash = shippedHash();
  if (unlocked && hash) await context.addInitScript((h) => localStorage.setItem('lodestar:access', h), hash);
  const page = await context.newPage();
  page.setDefaultTimeout(10000); // fail fast instead of hanging on a missing element
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return { browser, page, errors };
}

async function axe(page, label) {
  // axe's target-size rule counts a control as too small when the sticky
  // header happens to cover part of it, which depends only on where the page
  // is scrolled. Check from the top so results don't change from run to run.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async () => (await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  })).violations.map((v) => {
    const target = v.nodes[0].target.join(' ');
    const box = document.querySelector(target)?.getBoundingClientRect();
    const size = box ? ` (${Math.round(box.width)}x${Math.round(box.height)} at ${Math.round(box.x)},${Math.round(box.y)})` : '';
    return `${v.id} x${v.nodes.length} at ${target}${size}: ${v.nodes[0].failureSummary.split('\n').slice(1).join(' ').trim().slice(0, 160)}`;
  }));
  check(violations.length === 0, `no accessibility violations: ${label}${violations.length ? ` (${violations.join(', ')})` : ''}`);
}

const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('lodestar:v1') || 'null'));

// Sorts the whole deck. pileFor(i) returns 'very' | 'some' | 'not'.
async function sortDeck(page, pileFor) {
  await page.goto(`${BASE}#/sort`);
  await page.waitForSelector('.vcard--live');
  const total = (await state(page)).order.length;
  for (let i = 0; i < total; i++) await page.click(`.pile-btn[data-pile="${pileFor(i)}"]`);
  await page.waitForSelector('text=Review your piles');
  return total;
}

async function finish(browser, errors, label) {
  check(errors.length === 0, `no console errors: ${label}${errors.length ? ` (${errors[0]})` : ''}`);
  await browser.close();
}

function exit() {
  if (failures.length) {
    console.log(`\n${failures.length} check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log('\nAll checks passed.');
  }
}

module.exports = { BASE, OUT, VARIANTS, check, open, axe, state, sortDeck, finish, exit };
