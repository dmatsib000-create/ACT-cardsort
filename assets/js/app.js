import { VALUES, PILES, PILE_ORDER, MAX_CORE, AREAS, MAX_AREA_VALUES } from './values.js';
import * as store from './store.js';
import { learnHTML, aboutHTML } from './content.js';

/* ------------------------------------------------------------------ *
 * State and helpers
 * ------------------------------------------------------------------ */

let state = store.load();
const app = document.getElementById('app');
const live = document.getElementById('live');
let cleanupFns = [];
let firstRender = true;

const persist = () => store.save(state);

let saveTimer = null;
const persistSoon = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, 300);
};

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const byId = () => {
  const map = new Map(VALUES.map((v) => [v.id, v]));
  for (const c of state.custom) map.set(c.id, c);
  return map;
};
const val = (id) => byId().get(id);
const allIds = () => [...VALUES.map((v) => v.id), ...state.custom.map((c) => c.id)];
const inPile = (p) => allIds().filter((id) => state.piles[id] === p);

function announce(msg) {
  // Clear first so repeated identical messages are still read out.
  live.textContent = '';
  window.setTimeout(() => { live.textContent = msg; }, 60);
}

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function onCleanup(fn) { cleanupFns.push(fn); }

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return ''; }
}

const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;

// Rank numbers for the core values, where values marked "on a par" with the
// one above share its number (1, 2, 2, 4...).
function rankNums() {
  const out = [];
  state.core.forEach((id, i) => { out[i] = i > 0 && state.ties.includes(id) ? out[i - 1] : i + 1; });
  return out;
}
const cleanTies = () => { state.ties = state.ties.filter((id) => state.core.indexOf(id) > 0); };

function deckNotice() {
  if (!state.deckUpdated) return '';
  return `<aside class="notice notice--update" aria-labelledby="upd-h">
    <h2 id="upd-h">The deck has been refined</h2>
    <p>Some near-identical cards were combined, wording was sharpened, and 10 cards were added (including Hope, Vitality, Duty and Providing). Your choices have been carried over. If you had finished sorting, you\u2019ll be asked to sort just the new cards.</p>
    <div class="inline-actions">
      <a class="btn btn--ghost btn--sm" href="docs/values-map.html">See what changed and why</a>
      <button type="button" class="btn btn--ghost btn--sm" data-action="dismiss-update">Dismiss</button>
    </div>
  </aside>`;
}

/* Progress through the five steps */
function progress() {
  const sorted = state.order.length > 0 && state.pos >= state.order.length;
  const hasCore = state.core.length > 0;
  const reflected = hasCore && state.core.some((id) => state.reflections[id]?.meaning?.trim() || state.reflections[id]?.living != null);
  return {
    started: state.order.length > 0,
    sorted,
    hasCore,
    ranked: state.ranked,
    reflected,
    acted: state.actions.length > 0,
  };
}

const STEPS = [
  { route: 'sort', label: 'Sort' },
  { route: 'core', label: 'Choose' },
  { route: 'rank', label: 'Rank' },
  { route: 'reflect', label: 'Reflect' },
  { route: 'act', label: 'Act' },
];

function stepper(current) {
  const p = progress();
  const done = { sort: p.sorted, core: p.hasCore, rank: p.ranked, reflect: p.reflected, act: p.acted };
  const items = STEPS.map((s, i) => {
    const isCurrent = s.route === current;
    const status = isCurrent ? 'current' : done[s.route] ? 'done' : 'todo';
    const srStatus = isCurrent ? ' (current step)' : done[s.route] ? ' (done)' : '';
    return `<li class="step step--${status}">
      <a href="#/${s.route}" ${isCurrent ? 'aria-current="step"' : ''}>
        <span class="step__num" aria-hidden="true">${done[s.route] && !isCurrent ? checkIcon() : i + 1}</span>
        <span class="step__label"><span class="visually-hidden">Step ${i + 1}: </span>${s.label}<span class="visually-hidden">${srStatus}</span></span>
      </a>
    </li>`;
  }).join('');
  return `<nav class="stepper" aria-label="Card sort steps"><ol>${items}</ol></nav>`;
}

const checkIcon = () => '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowIcon = (dir = 'right') => {
  const d = { right: 'M3 8h10M9 4l4 4-4 4', left: 'M13 8H3M7 4L3 8l4 4', up: 'M8 13V3M4 7l4-4 4 4', down: 'M8 3v10M4 9l4 4 4-4' }[dir];
  return `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};
const starIcon = (size = 20) => `<svg class="star" viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path d="M16 2l2.6 10.2L28 16l-9.4 3.8L16 30l-2.6-10.2L4 16l9.4-3.8z" fill="currentColor"/></svg>`;
const pileIcon = (p) => ({
  very: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path d="M10 2.5l2.1 5 5.4.4-4.1 3.5 1.3 5.3L10 13.9 5.3 16.7l1.3-5.3L2.5 7.9l5.4-.4z" fill="currentColor"/></svg>',
  some: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M10 3.5a6.5 6.5 0 010 13z" fill="currentColor"/></svg>',
  not: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
}[p]);

function setTitle(t) {
  document.title = t ? `${t} · Lodestar` : 'Lodestar · ACT values card sort';
}

/* ------------------------------------------------------------------ *
 * Router
 * ------------------------------------------------------------------ */

const routes = {
  '': viewHome,
  sort: viewSort,
  core: viewCore,
  rank: viewRank,
  reflect: viewReflect,
  act: viewAct,
  areas: viewAreas,
  results: viewResults,
  decide: viewDecide,
  learn: viewLearn,
  about: viewAbout,
};

function parseHash() {
  const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [path, anchor = ''] = raw.split('#');
  const [name, ...rest] = path.split('/');
  return { name, param: rest.join('/'), anchor };
}

let lastPath = null;

function render() {
  const { name, param, anchor } = parseHash();
  const path = `${name}/${param}`;

  // An in-page link (e.g. #/learn#values) on the page we're already showing: just scroll.
  if (anchor && path === lastPath) { focusAnchor(anchor); return; }
  lastPath = path;

  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  const view = routes[name] || viewNotFound;
  app.innerHTML = '';
  view(param);

  // Mark the active primary nav link.
  document.querySelectorAll('.site-nav a').forEach((a) => {
    const target = a.getAttribute('href').replace(/^#\/?/, '');
    if (target === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  if (anchor) { focusAnchor(anchor); firstRender = false; return; }
  if (!firstRender) {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    const h1 = app.querySelector('h1');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }
  firstRender = false;
}

function focusAnchor(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.querySelector('h2, h3') || el;
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
}

window.addEventListener('hashchange', render);

/* ------------------------------------------------------------------ *
 * Shared UI fragments
 * ------------------------------------------------------------------ */

function emptyState({ title, body, href, cta }) {
  return `<div class="empty">
    ${starIcon(28)}
    <h2>${title}</h2>
    <p>${body}</p>
    <a class="btn btn--primary" href="${href}">${cta}</a>
  </div>`;
}

function navRow({ back, next, nextLabel, nextId = '' }) {
  return `<div class="nav-row">
    ${back ? `<a class="btn btn--ghost" href="#/${back.route}">${arrowIcon('left')}<span>${back.label}</span></a>` : '<span></span>'}
    ${next ? `<a class="btn btn--primary" href="#/${next}" ${nextId ? `id="${nextId}"` : ''}><span>${nextLabel}</span>${arrowIcon('right')}</a>` : ''}
  </div>`;
}

/* ------------------------------------------------------------------ *
 * Home
 * ------------------------------------------------------------------ */

function viewHome() {
  setTitle('');
  const p = progress();
  let resume = '#/sort';
  let resumeLabel = 'Begin the card sort';
  if (p.started && !p.sorted) { resumeLabel = `Continue sorting (${state.pos} of ${state.order.length})`; }
  else if (p.sorted && !p.hasCore) { resume = '#/core'; resumeLabel = 'Continue: choose your core values'; }
  else if (p.hasCore && !p.ranked) { resume = '#/rank'; resumeLabel = 'Continue: rank your values'; }
  else if (p.ranked && !p.reflected) { resume = '#/reflect'; resumeLabel = 'Continue: reflect'; }
  else if (p.reflected && !p.acted) { resume = '#/act'; resumeLabel = 'Continue: plan an action'; }
  else if (p.acted) { resume = '#/results'; resumeLabel = 'See my values'; }

  app.innerHTML = `
  ${deckNotice()}
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">An Acceptance and Commitment Therapy exercise</p>
      <h1>Find what matters most to you</h1>
      <p class="lede">Values are the qualities you want to bring to the way you live: how you treat people, how you work, how you meet hard moments. This card sort helps you notice yours, put them into words and use them as a compass.</p>
      <div class="hero__actions">
        <a class="btn btn--primary btn--lg" href="${resume}"><span>${resumeLabel}</span>${arrowIcon('right')}</a>
        ${p.started ? '<button type="button" class="btn btn--ghost" data-action="start-over">Start over</button>' : '<a class="btn btn--ghost" href="#/learn">What are values?</a>'}
      </div>
      <p class="meta">${VALUES.length} cards · about 15 to 25 minutes · private: nothing leaves this device</p>
    </div>
    <div class="hero__art" aria-hidden="true">
      <div class="deck-art">
        <div class="vcard vcard--art vcard--a"><span class="vcard__name">Courage</span></div>
        <div class="vcard vcard--art vcard--b"><span class="vcard__name">Kindness</span></div>
        <div class="vcard vcard--art vcard--c">${starIcon(28)}<span class="vcard__name">Curiosity</span></div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="how">
    <h2 id="how">How it works</h2>
    <ol class="how-list">
      <li><span class="how-list__n" aria-hidden="true">1</span><div><h3>Sort</h3><p>Go through the deck and place each card in one of three piles: very important, somewhat important, or less important to you. Go with your gut.</p></div></li>
      <li><span class="how-list__n" aria-hidden="true">2</span><div><h3>Choose</h3><p>From your “very important” pile, pick the handful that feel most like you at your best.</p></div></li>
      <li><span class="how-list__n" aria-hidden="true">3</span><div><h3>Rank</h3><p>Put them in order, by hand or with quick either/or questions.</p></div></li>
      <li><span class="how-list__n" aria-hidden="true">4</span><div><h3>Reflect</h3><p>Describe what each value means in your own words, and how fully you are living it right now.</p></div></li>
      <li><span class="how-list__n" aria-hidden="true">5</span><div><h3>Act</h3><p>Choose one small, concrete step toward a value, and plan for what might get in the way.</p></div></li>
    </ol>
  </section>

  <section class="section tiles" aria-label="Other tools">
    <a class="tile" href="#/decide">
      <h2 class="tile__title">Make a decision with your values</h2>
      <p>Weigh your options by asking which ones move you toward the person you want to be.</p>
      <span class="tile__go">Open the decision helper ${arrowIcon('right')}</span>
    </a>
    <a class="tile" href="#/learn">
      <h2 class="tile__title">Values, goals and feelings</h2>
      <p>A short guide to how ACT thinks about values, and why they work like a compass rather than a destination.</p>
      <span class="tile__go">Read the guide ${arrowIcon('right')}</span>
    </a>
  </section>

  <aside class="care-note" aria-labelledby="care">
    <h2 id="care">A note of care</h2>
    <p>Lodestar is a self-reflection tool based on ACT. It is not therapy and cannot diagnose or treat anything. Thinking about what matters can stir up strong feelings; go gently, take breaks, and consider sharing what you find with someone you trust or a therapist. If you are in crisis, <a href="#/about">find urgent support</a>.</p>
  </aside>`;
}

/* ------------------------------------------------------------------ *
 * Step 1: Sort
 * ------------------------------------------------------------------ */

function ensureDeck() {
  if (state.order.length === 0) {
    state.order = store.shuffle(VALUES.map((v) => v.id));
    state.pos = 0;
    state.piles = {};
    state.history = [];
    persist();
  }
}

function viewSort() {
  ensureDeck();
  if (state.pos >= state.order.length) return viewSortReview();
  setTitle('Sort the cards');
  app.classList.add('sort-page');
  onCleanup(() => app.classList.remove('sort-page'));

  app.innerHTML = `
    ${stepper('sort')}
    <header class="page-head">
      <p class="eyebrow">Step 1 of 5</p>
      <h1>Sort the cards</h1>
      ${state.deckUpdated && state.pos > 0 ? '<p class="notice notice--inline">The deck has new cards since you last sorted. Your earlier choices are kept; just sort the new ones.</p>' : ''}
      <p class="lede">For each card, ask: <em>how important is this to the way I want to live?</em> Go with your first reaction.</p>
    </header>

    <section class="sorter" aria-labelledby="sorter-title" id="sorter">
      <h2 id="sorter-title" class="visually-hidden">Current card</h2>
      <div class="sorter__progress">
        <span id="sort-count" class="sorter__count"></span>
        <div class="bar" role="progressbar" aria-labelledby="sort-count" aria-valuemin="0" id="sort-bar"><span class="bar__fill"></span></div>
      </div>

      <div class="stage" id="stage"></div>

      <div class="pile-buttons" role="group" aria-label="Place this card">
        ${['not', 'some', 'very'].map((p) => `
          <button type="button" class="pile-btn pile-btn--${p}" data-pile="${p}" aria-keyshortcuts="${PILES[p].key}">
            <span class="pile-btn__icon">${pileIcon(p)}</span>
            <span class="pile-btn__label">${PILES[p].label}</span>
            <kbd class="pile-btn__key" aria-hidden="true">${PILES[p].key}</kbd>
          </button>`).join('')}
      </div>

      <div class="sorter__tools">
        <button type="button" class="btn btn--ghost btn--sm" data-action="undo" aria-keyshortcuts="U">${arrowIcon('left')}<span>Undo</span></button>
        <button type="button" class="btn btn--ghost btn--sm" data-action="add-custom"><span aria-hidden="true">+</span><span>Add my own value</span></button>
      </div>

      <ul class="pile-counts" aria-label="Pile totals" id="pile-counts"></ul>
      <p class="hint">There are no right answers. Sort by what truly matters to you, not what you think should matter.</p>
      <p class="hint hint--keys">Keyboard: while focus is in this area, press 1, 2 or 3 to place a card and U to undo.</p>
    </section>`;

  const sorter = document.getElementById('sorter');
  updateSortUI(false);

  sorter.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-pile]');
    if (btn) place(btn.dataset.pile);
  });

  const onKey = (e) => {
    if (e.target.closest('input, textarea, select, dialog')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const map = { 1: 'not', 2: 'some', 3: 'very' };
    if (map[e.key]) { e.preventDefault(); place(map[e.key]); flashButton(map[e.key]); }
    else if (e.key === 'u' || e.key === 'U') { e.preventDefault(); undo(); }
  };
  sorter.addEventListener('keydown', onKey);
}

function flashButton(p) {
  const b = document.querySelector(`.pile-btn[data-pile="${p}"]`);
  if (!b) return;
  b.classList.add('is-pressed');
  setTimeout(() => b.classList.remove('is-pressed'), 160);
}

function cardHTML(v, n, total) {
  return `<article class="vcard vcard--live${v.custom ? ' vcard--custom' : ''}" aria-roledescription="value card" aria-label="${esc(v.name)}">
    <div class="vcard__inner">
      <span class="vcard__star">${starIcon(22)}</span>
      <h3 class="vcard__name">${esc(v.name)}</h3>
      <p class="vcard__desc">${esc(v.desc)}</p>
      ${n ? `<span class="vcard__num" aria-hidden="true">${n} / ${total}</span>` : ''}
    </div>
  </article>`;
}

function updateSortUI(animateIn = true) {
  const total = state.order.length;
  const stage = document.getElementById('stage');
  if (!stage) return;
  const id = state.order[state.pos];
  const v = val(id);
  const remaining = total - state.pos;
  stage.innerHTML = `
    <div class="stack" aria-hidden="true">${remaining > 2 ? '<span class="stack__card stack__card--2"></span>' : ''}${remaining > 1 ? '<span class="stack__card stack__card--1"></span>' : ''}</div>
    ${cardHTML(v, state.pos + 1, total)}`;
  if (animateIn && !reducedMotion()) stage.querySelector('.vcard--live').classList.add('is-entering');

  document.getElementById('sort-count').textContent = `Card ${state.pos + 1} of ${total}`;
  const bar = document.getElementById('sort-bar');
  bar.setAttribute('aria-valuemax', String(total));
  bar.setAttribute('aria-valuenow', String(state.pos));
  bar.setAttribute('aria-valuetext', `${state.pos} of ${total} cards sorted`);
  bar.querySelector('.bar__fill').style.width = `${(state.pos / total) * 100}%`;

  document.getElementById('pile-counts').innerHTML = PILE_ORDER.map((p) =>
    `<li class="pile-count pile-count--${p}">${pileIcon(p)}<span>${PILES[p].label}</span> <strong>${inPile(p).length}</strong></li>`).join('');

  const undoBtn = document.querySelector('[data-action="undo"]');
  if (undoBtn) undoBtn.setAttribute('aria-disabled', state.history.length ? 'false' : 'true');
}

let pendingFinish = null;
function place(pile) {
  // If the previous card is still animating out, finish it now rather than dropping this input.
  if (pendingFinish) pendingFinish();
  const id = state.order[state.pos];
  if (!id) return;
  state.piles[id] = pile;
  state.history.push(id);
  state.pos += 1;
  persist();

  const v = val(id);
  const done = state.pos >= state.order.length;
  const next = done ? null : val(state.order[state.pos]);
  const msg = `${v.name}: ${PILES[pile].label}.` + (next ? ` Card ${state.pos + 1} of ${state.order.length}: ${next.name}. ${next.desc}` : ' All cards sorted.');

  const card = document.querySelector('.vcard--live');
  let timer = null;
  const finish = () => {
    clearTimeout(timer);
    pendingFinish = null;
    // The card is already saved. If the person has left the sort screen while
    // it was animating out, don't redraw whatever page they are on now.
    if (parseHash().name !== 'sort') return;
    if (done) {
      announce('All cards sorted. Now review your piles.');
      render();
      const h1 = app.querySelector('h1');
      if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); }
    } else {
      updateSortUI(true);
      announce(msg);
      keepSorterInView();
    }
  };
  if (card && !reducedMotion()) {
    card.classList.add(`is-leaving--${pile}`);
    pendingFinish = finish;
    timer = setTimeout(finish, 220);
  } else {
    finish();
  }
}

// On short screens, make sure the card and the pile buttons are both visible.
function keepSorterInView() {
  const btns = document.querySelector('.pile-buttons');
  const top = document.querySelector('.sorter__progress');
  if (!btns || !top) return;
  const header = document.querySelector('.site-header')?.offsetHeight || 0;
  if (btns.getBoundingClientRect().bottom > window.innerHeight || top.getBoundingClientRect().top < header) {
    window.scrollTo({ top: window.scrollY + top.getBoundingClientRect().top - header - 8, behavior: 'auto' });
  }
}

function undo() {
  if (pendingFinish) pendingFinish();
  if (!state.history.length) { announce('Nothing to undo.'); return; }
  const id = state.history.pop();
  const idx = state.order.indexOf(id);
  delete state.piles[id];
  if (idx > -1) state.pos = idx;
  persist();
  if (!document.getElementById('stage')) { render(); return; }
  updateSortUI(true);
  const v = val(id);
  announce(`Undone. Card ${state.pos + 1} of ${state.order.length}: ${v.name}. ${v.desc}`);
}

function viewSortReview() {
  setTitle('Review your piles');
  const sections = PILE_ORDER.map((p) => {
    const ids = inPile(p);
    return `<section class="pile pile--${p}" aria-labelledby="pile-${p}">
      <h2 id="pile-${p}" class="pile__title">${pileIcon(p)}<span>${PILES[p].label}</span> <span class="pile__n">${ids.length}</span></h2>
      ${ids.length ? `<ul class="chip-list">${ids.map((id) => chipWithMove(id, p)).join('')}</ul>` : '<p class="muted">No cards here.</p>'}
    </section>`;
  }).join('');

  const nVery = inPile('very').length;
  app.innerHTML = `
    ${stepper('sort')}
    <header class="page-head">
      <p class="eyebrow">Step 1 of 5</p>
      <h1>Review your piles</h1>
      <p class="lede">You placed ${plural(nVery, 'card')} in “very important”. Look over each pile. If a card feels like it belongs somewhere else, move it.</p>
    </header>
    <div class="piles">${sections}</div>
    <div class="inline-actions">
      <button type="button" class="btn btn--ghost btn--sm" data-action="add-custom"><span aria-hidden="true">+</span><span>Add my own value</span></button>
      <button type="button" class="btn btn--ghost btn--sm" data-action="resort">Sort the deck again</button>
    </div>
    ${navRow({ back: { route: '', label: 'Home' }, next: 'core', nextLabel: 'Choose core values' })}`;

  app.querySelectorAll('select[data-move]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const id = sel.dataset.move;
      state.piles[id] = sel.value;
      persist();
      announce(`${val(id).name} moved to ${PILES[sel.value].label}.`);
      const scrollY = window.scrollY;
      viewSortReview();
      window.scrollTo(0, scrollY);
      const again = app.querySelector(`select[data-move="${CSS.escape(id)}"]`);
      if (again) again.focus();
    });
  });
}

function chipWithMove(id, p) {
  const v = val(id);
  const selId = `move-${id}`;
  return `<li class="chip chip--${p}">
    <span class="chip__text"><strong class="chip__name">${esc(v.name)}</strong><span class="chip__desc">${esc(v.desc)}</span></span>
    <label class="visually-hidden" for="${esc(selId)}">Pile for ${esc(v.name)}</label>
    <select id="${esc(selId)}" class="chip__select" data-move="${esc(id)}">
      ${PILE_ORDER.map((q) => `<option value="${q}" ${q === p ? 'selected' : ''}>${PILES[q].short}</option>`).join('')}
    </select>
  </li>`;
}

/* ------------------------------------------------------------------ *
 * Step 2: Choose core values
 * ------------------------------------------------------------------ */

function viewCore() {
  setTitle('Choose your core values');
  const p = progress();
  if (!p.sorted) {
    app.innerHTML = `${stepper('core')}<h1 class="visually-hidden">Choose your core values</h1>${emptyState({ title: 'Sort the cards first', body: 'Once you have sorted the deck, your “very important” cards will appear here for you to choose from.', href: '#/sort', cta: p.started ? 'Continue sorting' : 'Begin the card sort' })}`;
    return;
  }
  const scored = (ids) => (Object.keys(state.bw).length
    ? [...ids].sort((a, b) => (state.bw[b] ?? -99) - (state.bw[a] ?? -99))
    : ids);
  const very = scored(inPile('very'));
  const some = inPile('some');
  // If someone has 10 or fewer "very important" cards and hasn't chosen yet, start with all of them selected.
  if (state.core.length === 0 && very.length > 0 && very.length <= MAX_CORE) {
    state.core = [...very];
    persist();
  }

  const option = (id) => {
    const v = val(id);
    const checked = state.core.includes(id);
    return `<li><label class="pick">
      <input type="checkbox" value="${esc(id)}" ${checked ? 'checked' : ''}>
      <span class="pick__box" aria-hidden="true">${checkIcon()}</span>
      <span class="pick__text"><strong>${esc(v.name)}</strong><span>${esc(v.desc)}</span></span>
    </label></li>`;
  };

  app.innerHTML = `
    ${stepper('core')}
    <header class="page-head">
      <p class="eyebrow">Step 2 of 5</p>
      <h1>Choose your core values</h1>
      <p class="lede">Choose up to ${MAX_CORE} values that feel most central to who you want to be. Around five is a good number to work with.</p>
      ${state.bw && Object.keys(state.bw).length ? '<p class="muted">Your \u201cvery important\u201d cards are listed in the order suggested by your narrowing round.</p>' : ''}
    </header>
    <details class="prompts">
      <summary>Questions that can help you choose</summary>
      <ul>
        <li>Which of these would you want people to say you stood for, at your 80th birthday?</li>
        <li>Which would you still choose if no one else ever knew about it?</li>
        <li>Which ones describe you at your best, when you feel most alive?</li>
        <li>Is this a value you have chosen, or one you feel you <em>should</em> have to please someone else?</li>
      </ul>
    </details>

    ${very.length > MAX_CORE ? `<div class="rank-help narrow-help">
      <p><strong>You have ${very.length} \u201cvery important\u201d cards.</strong> A short narrowing round can help: you\u2019ll see a few cards at a time and pick the one that matters most and the one that matters least. It takes about ${narrowTrials(very.length)} rounds.</p>
      <button type="button" class="btn btn--secondary" data-action="narrow">${Object.keys(state.bw).length ? 'Narrow again' : 'Start narrowing round'}</button>
    </div>` : ''}
    ${(() => {
      const top = Object.keys(state.bw).length ? topFive() : [];
      const same = top.length === state.core.length && top.every((id) => state.core.includes(id));
      return top.length && state.core.length && !same ? `<div class="notice suggest">
        <p><strong>Your narrowing round suggests:</strong> ${top.map((id) => esc(val(id).name)).join(', ')}. Your own choices below have been kept.</p>
        <button type="button" class="btn btn--secondary btn--sm" data-action="use-top5">Use these five instead</button>
      </div>` : '';
    })()}
    <form class="core-form" id="core-form" novalidate>
      <fieldset>
        <legend><span class="legend-title">Very important to me</span> <span class="muted">(${very.length})</span></legend>
        ${very.length ? `<ul class="pick-list">${very.map(option).join('')}</ul>` : '<p class="muted">You have no cards in this pile. You can choose from “somewhat important” below, or <a href="#/sort">adjust your piles</a>.</p>'}
      </fieldset>
      ${some.length ? `<details class="more" ${very.length < 3 ? 'open' : ''}>
        <summary>Also show my “somewhat important” cards (${some.length})</summary>
        <fieldset>
          <legend class="visually-hidden">Somewhat important to me</legend>
          <ul class="pick-list">${some.map(option).join('')}</ul>
        </fieldset>
      </details>` : ''}
      <div class="sticky-bar" role="status" aria-live="polite" id="core-status"></div>
      <p class="error" id="core-error" hidden></p>
    </form>
    ${navRow({ back: { route: 'sort', label: 'Review piles' }, next: 'rank', nextLabel: 'Rank them', nextId: 'core-next' })}`;

  const status = document.getElementById('core-status');
  const err = document.getElementById('core-error');
  const updateStatus = () => {
    const n = state.core.length;
    status.innerHTML = `<strong>${n}</strong> of ${MAX_CORE} chosen${n ? `: ${state.core.map((id) => esc(val(id).name)).join(', ')}` : ''}`;
  };
  updateStatus();

  app.querySelector('#core-form').addEventListener('change', (e) => {
    const cb = e.target;
    if (cb.type !== 'checkbox') return;
    err.hidden = true;
    if (cb.checked) {
      if (state.core.length >= MAX_CORE) {
        cb.checked = false;
        err.textContent = `You can choose up to ${MAX_CORE}. Unselect one to make room.`;
        err.hidden = false;
        announce(err.textContent);
        return;
      }
      if (!state.core.includes(cb.value)) state.core.push(cb.value);
    } else {
      state.core = state.core.filter((id) => id !== cb.value);
    }
    cleanTies();
    state.ranked = false;
    persist();
    updateStatus();
  });

  document.getElementById('core-next').addEventListener('click', (e) => {
    if (state.core.length === 0) {
      e.preventDefault();
      err.textContent = 'Choose at least one value to continue.';
      err.hidden = false;
      err.setAttribute('tabindex', '-1');
      err.focus();
    }
  });
}

// Best-worst narrowing (Lee, Soutar & Louviere, 2008): each card is shown about
// twice, in sets of up to four. Picking the most and least important in each
// set gives a score that separates a crowded "very important" pile.
const narrowTrials = (n) => Math.ceil((n * 2) / 4);

// The five highest-scoring "very important" cards from the narrowing round.
function topFive() {
  return inPile('very')
    .filter((id) => id in state.bw)
    .sort((a, b) => state.bw[b] - state.bw[a])
    .slice(0, 5);
}

function buildTrials(ids) {
  const seq = [...store.shuffle(ids), ...store.shuffle(ids)];
  const trials = [];
  for (let i = 0; i < seq.length; i += 4) trials.push(seq.slice(i, i + 4));
  // Remove repeats inside a set by swapping with another set.
  trials.forEach((t, ti) => {
    t.forEach((id, k) => {
      if (t.indexOf(id) === k) return;
      for (let ui = 0; ui < trials.length; ui++) {
        if (ui === ti || trials[ui].includes(id)) continue;
        const m = trials[ui].findIndex((o) => !t.includes(o));
        if (m > -1) { t[k] = trials[ui][m]; trials[ui][m] = id; return; }
      }
    });
  });
  return trials.map((t) => [...new Set(t)]).filter((t) => t.length >= 2);
}

async function runNarrowing() {
  const ids = inPile('very');
  const trials = buildTrials(ids);
  const score = Object.fromEntries(ids.map((id) => [id, 0]));
  const form = document.getElementById('core-form');
  const help = app.querySelector('.narrow-help');
  const host = document.createElement('section');
  host.className = 'pairwise';
  host.setAttribute('aria-labelledby', 'bw-title');
  form.hidden = true;
  if (help) help.hidden = true;
  form.before(host);

  const pick = (set, question, round, part) => new Promise((resolve, reject) => {
    host.innerHTML = `
      <p class="muted">Round ${round} of ${trials.length} \u00b7 ${part}</p>
      <h2 id="bw-title" class="pairwise__q" tabindex="-1">${question}</h2>
      <div class="bw__choices">${set.map((id) => `<button type="button" class="choice choice--compact" data-pick="${esc(id)}"><strong>${esc(val(id).name)}</strong><span>${esc(val(id).desc)}</span></button>`).join('')}</div>
      <button type="button" class="btn btn--ghost btn--sm" data-pick="cancel">Stop and choose by hand</button>`;
    host.querySelector('h2').focus();
    host.onclick = (e) => {
      const id = e.target.closest('[data-pick]')?.dataset.pick;
      if (!id) return;
      host.onclick = null;
      if (id === 'cancel') reject(new Error('cancel')); else resolve(id);
    };
  });

  try {
    for (let t = 0; t < trials.length; t++) {
      const set = trials[t];
      const best = await pick(set, 'Which of these matters <em>most</em> to you?', t + 1, 'most');
      score[best] += 1;
      const rest = set.filter((id) => id !== best);
      const worst = rest.length === 1 ? rest[0] : await pick(rest, 'And which matters <em>least</em>?', t + 1, 'least');
      score[worst] -= 1;
    }
    state.bw = score;
    const top = topFive();
    // Only fill in core values if none were chosen yet; never replace someone's choices.
    const filled = state.core.length === 0;
    if (filled) { state.core = top; state.ties = []; state.ranked = false; }
    persist();
    viewCore();
    const names = top.map((id) => val(id).name).join(', ');
    announce(filled
      ? `Done. Your top five have been selected: ${names}. You can change them.`
      : `Done. Your choices were kept. The round suggests: ${names}.`);
    toast(filled ? 'Top five selected' : 'Suggestion ready');
  } catch (err) {
    if (err?.message !== 'cancel') console.error('Narrowing round failed:', err);
    host.remove();
    form.hidden = false;
    if (help) help.hidden = false;
    announce('Stopped. You can choose by hand.');
  }
  app.querySelector('h1')?.focus();
}

/* ------------------------------------------------------------------ *
 * Step 3: Rank
 * ------------------------------------------------------------------ */

function viewRank() {
  setTitle('Rank your values');
  if (!state.core.length) {
    app.innerHTML = `${stepper('rank')}<h1 class="visually-hidden">Rank your values</h1>${emptyState({ title: 'Choose your core values first', body: 'Once you have picked your core values, you can put them in order here.', href: progress().sorted ? '#/core' : '#/sort', cta: progress().sorted ? 'Choose core values' : 'Begin the card sort' })}`;
    return;
  }
  const n = state.core.length;
  app.innerHTML = `
    ${stepper('rank')}
    <header class="page-head">
      <p class="eyebrow">Step 3 of 5</p>
      <h1>Rank your values</h1>
      <p class="lede">Put the value that matters most at the top. Ranking is only a way to think more clearly about what matters; every value on this list is important. If two feel equally important, mark them as on a par.</p>
    </header>
    ${n > 1 ? `<div class="rank-help">
      <p>Finding it hard to order them? Answer a few quick either/or questions instead.</p>
      <button type="button" class="btn btn--secondary" data-action="pairwise">Help me rank</button>
    </div>` : ''}
    <ol class="rank-list" id="rank-list"></ol>
    ${navRow({ back: { route: 'core', label: 'Choose' }, next: 'reflect', nextLabel: 'Reflect on them', nextId: 'rank-next' })}`;

  drawRankList();

  document.getElementById('rank-list').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-move]');
    if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
    const i = Number(btn.dataset.index);
    const j = btn.dataset.move === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= state.core.length) return;
    const lo = Math.min(i, j);
    const touched = [state.core[lo], state.core[lo + 1], state.core[lo + 2]];
    state.ties = state.ties.filter((id) => !touched.includes(id));
    [state.core[i], state.core[j]] = [state.core[j], state.core[i]];
    state.ranked = true;
    persist();
    drawRankList();
    const name = val(state.core[j]).name;
    announce(`${name} moved to position ${j + 1} of ${state.core.length}.`);
    const dir = btn.dataset.move;
    let target = document.querySelector(`#rank-list button[data-index="${j}"][data-move="${dir}"]`);
    if (!target || target.getAttribute('aria-disabled') === 'true') {
      target = document.querySelector(`#rank-list button[data-index="${j}"][data-move="${dir === 'up' ? 'down' : 'up'}"]`);
    }
    target?.focus();
  });

  document.getElementById('rank-list').addEventListener('change', (e) => {
    const id = e.target.dataset.tie;
    if (!id) return;
    state.ties = e.target.checked ? [...new Set([...state.ties, id])] : state.ties.filter((x) => x !== id);
    state.ranked = true;
    persist();
    drawRankList();
    const i = state.core.indexOf(id);
    announce(e.target.checked
      ? `${val(id).name} is now on a par with ${val(state.core[i - 1]).name}, at number ${rankNums()[i]}.`
      : `${val(id).name} is now ranked number ${rankNums()[i]} on its own.`);
    document.querySelector(`#rank-list input[data-tie="${CSS.escape(id)}"]`)?.focus();
  });

  document.getElementById('rank-next').addEventListener('click', () => {
    if (!state.ranked) { state.ranked = true; persist(); }
  });
}

function drawRankList() {
  const list = document.getElementById('rank-list');
  const n = state.core.length;
  const nums = rankNums();
  list.innerHTML = state.core.map((id, i) => {
    const v = val(id);
    const tied = i > 0 && state.ties.includes(id);
    return `<li class="rank-item${tied ? ' rank-item--tied' : ''}">
      <span class="rank-item__n" aria-hidden="true">${nums[i]}</span>
      <span class="rank-item__text"><strong>${esc(v.name)}</strong><span>${esc(v.desc)}</span>
        ${i > 0 ? `<label class="tie"><input type="checkbox" data-tie="${esc(id)}" ${tied ? 'checked' : ''}> On a par with ${esc(val(state.core[i - 1]).name)}</label>` : ''}
      </span>
      <span class="rank-item__btns">
        <button type="button" class="icon-btn" data-move="up" data-index="${i}" aria-label="Move ${esc(v.name)} up" aria-disabled="${i === 0}">${arrowIcon('up')}</button>
        <button type="button" class="icon-btn" data-move="down" data-index="${i}" aria-label="Move ${esc(v.name)} down" aria-disabled="${i === n - 1}">${arrowIcon('down')}</button>
      </span>
    </li>`;
  }).join('');
}

async function runPairwise() {
  const items = [...state.core];
  const maxQ = items.reduce((sum, _, i) => sum + (i === 0 ? 0 : Math.ceil(Math.log2(i + 1))), 0);
  let asked = 0;

  const host = document.createElement('section');
  host.className = 'pairwise';
  host.setAttribute('aria-labelledby', 'pw-title');
  const list = document.getElementById('rank-list');
  const help = app.querySelector('.rank-help');
  list.hidden = true;
  if (help) help.hidden = true;
  list.before(host);

  const ask = (a, b) => new Promise((resolve, reject) => {
    asked += 1;
    const va = val(a), vb = val(b);
    host.innerHTML = `
      <h2 id="pw-title" class="pairwise__q" tabindex="-1">If you could live only one of these more fully this month, which would you choose?</h2>
      <p class="muted">Question ${asked} of at most ${maxQ}</p>
      <div class="pairwise__choices">
        <button type="button" class="choice" data-pick="a"><strong>${esc(va.name)}</strong><span>${esc(va.desc)}</span></button>
        <span class="pairwise__or" aria-hidden="true">or</span>
        <button type="button" class="choice" data-pick="b"><strong>${esc(vb.name)}</strong><span>${esc(vb.desc)}</span></button>
      </div>
      <button type="button" class="btn btn--ghost btn--sm" data-pick="cancel">Stop and rank by hand</button>`;
    host.querySelector('h2').focus();
    host.onclick = (e) => {
      const pick = e.target.closest('[data-pick]')?.dataset.pick;
      if (!pick) return;
      host.onclick = null;
      if (pick === 'cancel') reject(new Error('cancel')); else resolve(pick === 'a');
    };
  });

  try {
    // Binary insertion sort: keeps the number of questions small.
    const sorted = [items[0]];
    for (let i = 1; i < items.length; i++) {
      let lo = 0, hi = sorted.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        const prefersNew = await ask(items[i], sorted[mid]);
        if (prefersNew) hi = mid; else lo = mid + 1;
      }
      sorted.splice(lo, 0, items[i]);
    }
    state.core = sorted;
    state.ties = [];
    state.ranked = true;
    persist();
    announce(`Ranking complete. Your top value is ${val(sorted[0]).name}.`);
  } catch (err) {
    if (err?.message !== 'cancel') console.error('Ranking questions failed:', err);
    announce('Stopped. You can rank by hand.');
  }
  host.remove();
  list.hidden = false;
  if (help) help.hidden = false;
  drawRankList();
  const h1 = app.querySelector('h1');
  h1?.focus();
}

/* ------------------------------------------------------------------ *
 * Step 4: Reflect
 * ------------------------------------------------------------------ */

const MEANING_PROMPTS = [
  'When I am living this value, I am…',
  'This matters to me because…',
  'Someone watching me live this would see me…',
];

// A gentle, non-judgmental nudge when a value starts to sound like a rule.
function shouldNudge(text) {
  const m = /\b(should|must|have to|has to|ought to|supposed to)\b/i.exec(text || '');
  return m ? `You wrote \u201c${m[1].toLowerCase()}\u201d. That\u2019s fine, but it can be worth asking: is this something you want to stand for, or something you feel you have to do?` : '';
}

function viewReflect() {
  const nums = rankNums();
  setTitle('Reflect on your values');
  if (!state.core.length) {
    app.innerHTML = `${stepper('reflect')}<h1 class="visually-hidden">Reflect on your values</h1>${emptyState({ title: 'Choose your core values first', body: 'Reflection works best once you know which values are at the heart of things for you.', href: progress().sorted ? '#/core' : '#/sort', cta: progress().sorted ? 'Choose core values' : 'Begin the card sort' })}`;
    return;
  }
  app.innerHTML = `
    ${stepper('reflect')}
    <header class="page-head">
      <p class="eyebrow">Step 4 of 5</p>
      <h1>Reflect on your values</h1>
      <p class="lede">The same word can mean very different things to different people. For each value, write a sentence or two about what it means to <em>you</em>, then notice how fully you have been living it lately. Be honest and kind with yourself: a gap is not a failure, it is useful information.</p>
    </header>
    <form class="reflect-list" id="reflect-form" novalidate>
      ${state.core.map((id, i) => {
        const v = val(id);
        const r = state.reflections[id] || { meaning: '', living: null };
        const living = r.living ?? 5;
        return `<fieldset class="reflect">
          <legend><span class="reflect__rank" aria-hidden="true">${nums[i]}</span><span class="legend-title">${esc(v.name)}</span></legend>
          <p class="reflect__desc">${esc(v.desc)}</p>
          <label for="m-${esc(id)}" class="field-label">What does ${esc(v.name.toLowerCase())} mean to you?</label>
          <p class="field-hint" id="mh-${esc(id)}">Try starting with: “${MEANING_PROMPTS[i % MEANING_PROMPTS.length]}”</p>
          <textarea id="m-${esc(id)}" data-meaning="${esc(id)}" rows="3" aria-describedby="mh-${esc(id)} sh-${esc(id)}">${esc(r.meaning)}</textarea>
          <p class="nudge" id="sh-${esc(id)}" ${shouldNudge(r.meaning) ? '' : 'hidden'}>${shouldNudge(r.meaning)}</p>
          <fieldset class="why">
            <legend class="field-label">Do you value this for its own sake, or for something it gives you? <span class="muted">(optional)</span></legend>
            <div class="seg seg--why">
              ${[['own', 'For its own sake'], ['means', 'For what it gives me'], ['both', 'Both']].map(([k, label]) => `<label class="seg__opt"><input type="radio" name="why-${esc(id)}" value="${k}" data-why="${esc(id)}" ${r.why === k ? 'checked' : ''}><span>${label}</span></label>`).join('')}
            </div>
            <div class="why-more" id="wm-${esc(id)}" ${r.why === 'means' || r.why === 'both' ? '' : 'hidden'}>
              <label for="w-${esc(id)}" class="field-label">What does it give you?</label>
              <p class="field-hint" id="wh-${esc(id)}">Whatever it gives you may be a deeper value. If it isn\u2019t in the deck, you can add it as your own card.</p>
              <input type="text" id="w-${esc(id)}" data-leads="${esc(id)}" maxlength="500" autocomplete="off" aria-describedby="wh-${esc(id)}" value="${esc(r.leadsTo || '')}">
            </div>
          </fieldset>
          <div class="range-field">
            <label for="l-${esc(id)}" class="field-label">Over the past two weeks, how fully have you lived this value?</label>
            <div class="range-row">
              <span class="range-end" aria-hidden="true">Not at all</span>
              <input type="range" id="l-${esc(id)}" data-living="${esc(id)}" min="0" max="10" step="1" value="${living}" aria-valuetext="${living} out of 10" ${r.living == null ? 'data-unset="true"' : ''}>
              <span class="range-end" aria-hidden="true">Fully</span>
              <output for="l-${esc(id)}" class="range-out" id="o-${esc(id)}">${r.living == null ? '–' : living}</output>
            </div>
            ${r.living == null ? `<p class="field-hint" id="lh-${esc(id)}">Not rated yet. Move the slider to rate.</p>` : ''}
          </div>
        </fieldset>`;
      }).join('')}
    </form>
    <details class="prompts">
      <summary>Is this value really mine?</summary>
      <p>In ACT, values are freely chosen. They are not rules, not feelings, and not other people’s expectations. A few gentle checks:</p>
      <ul>
        <li>If no one would ever know or approve, would I still want to live this way?</li>
        <li>Does this feel like a direction I want to move in, or a stick I beat myself with?</li>
        <li>Am I choosing this mostly to avoid feeling guilty, ashamed or anxious? If so, what might lie underneath it that I truly care about?</li>
      </ul>
    </details>
    ${navRow({ back: { route: 'rank', label: 'Rank' }, next: 'act', nextLabel: 'Plan an action' })}`;

  const form = document.getElementById('reflect-form');
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.meaning) {
      const id = t.dataset.meaning;
      state.reflections[id] = { ...(state.reflections[id] || { living: null }), meaning: t.value.slice(0, 2000) };
      const nudge = document.getElementById(`sh-${id}`);
      const msg = shouldNudge(t.value);
      if (nudge && nudge.textContent !== msg) { nudge.textContent = msg; nudge.hidden = !msg; }
      persistSoon();
    } else if (t.dataset.leads) {
      const id = t.dataset.leads;
      state.reflections[id] = { ...(state.reflections[id] || { meaning: '', living: null }), leadsTo: t.value.slice(0, 500) };
      persistSoon();
    } else if (t.dataset.why) {
      const id = t.dataset.why;
      state.reflections[id] = { ...(state.reflections[id] || { meaning: '', living: null }), why: t.value };
      document.getElementById(`wm-${id}`).hidden = !(t.value === 'means' || t.value === 'both');
      persistSoon();
    } else if (t.dataset.living) {
      const id = t.dataset.living;
      const n = Number(t.value);
      state.reflections[id] = { ...(state.reflections[id] || { meaning: '' }), living: n };
      t.setAttribute('aria-valuetext', `${n} out of 10`);
      t.removeAttribute('data-unset');
      document.getElementById(`o-${id}`).textContent = String(n);
      document.getElementById(`lh-${id}`)?.remove();
      persistSoon();
    }
  });
  // Make a "set" tap on an unrated slider count, even if the value didn't change.
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.living && state.reflections[t.dataset.living]?.living == null) {
      t.dispatchEvent(new Event('input', { bubbles: true }));
    }
    persist();
  });
  onCleanup(persist);
}

/* ------------------------------------------------------------------ *
 * Step 5: Act
 * ------------------------------------------------------------------ */

function suggestedValue() {
  // Suggest the highest-ranked value with the biggest gap between how much it
  // matters and how fully it's being lived.
  let best = state.core[0], bestScore = -Infinity;
  state.core.forEach((id, i) => {
    const living = state.reflections[id]?.living;
    const gap = living == null ? 3 : 10 - living;
    const weight = 1 - i / (state.core.length * 2);
    const score = gap * weight;
    if (score > bestScore) { bestScore = score; best = id; }
  });
  return best;
}

function viewAct(param) {
  setTitle('Plan a committed action');
  if (!state.core.length) {
    app.innerHTML = `${stepper('act')}<h1 class="visually-hidden">Plan a committed action</h1>${emptyState({ title: 'Choose your core values first', body: 'Committed action means taking steps guided by your values, so start by finding them.', href: progress().sorted ? '#/core' : '#/sort', cta: progress().sorted ? 'Choose core values' : 'Begin the card sort' })}`;
    return;
  }
  // Arriving from the life areas summary ("Plan a step here") pre-selects that
  // area and, if the person linked values to it, the first of those values.
  const fromArea = param && areaById(param) && state.areas[param]?.status !== 'notnow' ? param : '';
  const areaValue = fromArea && state.areas[fromArea] && areaValues(state.areas[fromArea])[0];
  const suggest = areaValue || suggestedValue();
  app.innerHTML = `
    ${stepper('act')}
    <header class="page-head">
      <p class="eyebrow">Step 5 of 5</p>
      <h1>Plan a committed action</h1>
      <p class="lede">Values come alive through action. Choose one small, concrete step you could take this week that moves you toward a value. Small and doable beats big and inspiring.</p>
    </header>

    <form class="card-form" id="act-form" novalidate>
      <h2>New action</h2>
      <div class="field">
        <label for="a-value" class="field-label">Which value is this action for?</label>
        <select id="a-value" required>
          ${state.core.map((id) => `<option value="${esc(id)}" ${id === suggest ? 'selected' : ''}>${esc(val(id).name)}${id === suggest && state.reflections[id]?.living != null ? ' (suggested: room to grow)' : ''}</option>`).join('')}
        </select>
      </div>
      <fieldset class="field">
        <legend class="field-label">Where in your life? <span class="muted">(optional)</span></legend>
        <div class="area-chips" id="a-area">
          <label class="chip-opt"><input type="radio" name="a-area" value="" ${fromArea ? '' : 'checked'}><span>No particular area</span></label>
          ${allAreas().map((a) => `<label class="chip-opt"><input type="radio" name="a-area" value="${esc(a.id)}" ${a.id === fromArea ? 'checked' : ''}><span>${esc(a.name)}</span></label>`).join('')}
        </div>
      </fieldset>
      <div class="field">
        <label for="a-step" class="field-label">One small step I will take</label>
        <p class="field-hint" id="a-step-hint">Make it specific enough that you would know when you have done it. For example: “Call my sister and ask about her week.”</p>
        <textarea id="a-step" rows="2" required aria-describedby="a-step-hint a-step-err"></textarea>
        <p class="error" id="a-step-err" hidden>Describe the step you will take.</p>
      </div>
      <div class="field">
        <label for="a-when" class="field-label">When and where?</label>
        <input id="a-when" type="text" autocomplete="off" placeholder="e.g. Saturday morning, after breakfast">
      </div>
      <div class="field">
        <label for="a-obst" class="field-label">What might show up and get in the way?</label>
        <p class="field-hint" id="a-obst-hint">Thoughts (“they’ll think it’s weird”), feelings (anxiety, tiredness), urges (to put it off), or practical things.</p>
        <textarea id="a-obst" rows="2" aria-describedby="a-obst-hint"></textarea>
      </div>
      <div class="field">
        <label for="a-resp" class="field-label">When that shows up, I will…</label>
        <p class="field-hint" id="a-resp-hint">For example: notice the thought, name it (“here’s the worry story”), make room for the feeling, and take the step anyway.</p>
        <textarea id="a-resp" rows="2" aria-describedby="a-resp-hint"></textarea>
      </div>
      <button type="submit" class="btn btn--primary">Add to my plan</button>
    </form>

    <section class="section" aria-labelledby="plan-title">
      <h2 id="plan-title">My plan</h2>
      <div id="plan-list"></div>
    </section>

    <details class="prompts">
      <summary>Tips for steps that stick</summary>
      <ul>
        <li><strong>Specific:</strong> say exactly what you will do.</li>
        <li><strong>Small:</strong> if it feels daunting, halve it, then halve it again.</li>
        <li><strong>Scheduled:</strong> link it to a time, place or existing habit.</li>
        <li><strong>Willing:</strong> expect discomfort to come along. You do not have to feel ready to act.</li>
        <li><strong>Values-led:</strong> doing it is the success, whatever the outcome.</li>
      </ul>
    </details>
    ${navRow({ back: { route: 'reflect', label: 'Reflect' }, next: 'results', nextLabel: 'See my values' })}`;

  drawPlan();

  document.getElementById('act-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const step = document.getElementById('a-step');
    const err = document.getElementById('a-step-err');
    if (!step.value.trim()) {
      err.hidden = false;
      step.setAttribute('aria-invalid', 'true');
      step.focus();
      return;
    }
    err.hidden = true;
    step.removeAttribute('aria-invalid');
    state.actions.push({
      id: store.uid('a'),
      valueId: document.getElementById('a-value').value,
      areaId: document.querySelector('input[name="a-area"]:checked')?.value || '',
      step: step.value.trim().slice(0, 500),
      when: document.getElementById('a-when').value.trim().slice(0, 300),
      obstacles: document.getElementById('a-obst').value.trim().slice(0, 800),
      response: document.getElementById('a-resp').value.trim().slice(0, 800),
      done: false,
      created: new Date().toISOString(),
    });
    persist();
    e.target.reset();
    document.getElementById('a-value').value = suggest;
    const none = document.querySelector('input[name="a-area"][value=""]');
    if (none) none.checked = true;
    drawPlan();
    announce('Action added to your plan.');
    document.getElementById('plan-title').setAttribute('tabindex', '-1');
    document.getElementById('plan-title').focus();
  });
}

function actionHTML(a, { editable = true } = {}) {
  const v = val(a.valueId);
  return `<li class="action${a.done ? ' action--done' : ''}">
    <div class="action__head">
      <span class="tags-inline"><span class="tag">${esc(v?.name || 'Value')}</span>${a.areaId && areaById(a.areaId) ? `<span class="tag tag--area">${esc(areaById(a.areaId).name)}</span>` : ''}</span>
      ${editable ? `<label class="done-toggle"><input type="checkbox" data-done="${esc(a.id)}" ${a.done ? 'checked' : ''}><span>Done</span></label>` : (a.done ? '<span class="tag tag--done">Done</span>' : '')}
    </div>
    <p class="action__step">${esc(a.step)}</p>
    <dl class="action__meta">
      ${a.when ? `<div><dt>When</dt><dd>${esc(a.when)}</dd></div>` : ''}
      ${a.obstacles ? `<div><dt>What might show up</dt><dd>${esc(a.obstacles)}</dd></div>` : ''}
      ${a.response ? `<div><dt>What I’ll do then</dt><dd>${esc(a.response)}</dd></div>` : ''}
    </dl>
    ${editable ? `<button type="button" class="btn btn--ghost btn--sm" data-remove="${esc(a.id)}">Remove<span class="visually-hidden"> action: ${esc(a.step)}</span></button>` : ''}
  </li>`;
}

function drawPlan() {
  const host = document.getElementById('plan-list');
  if (!host) return;
  host.innerHTML = state.actions.length
    ? `<ul class="action-list">${state.actions.map((a) => actionHTML(a)).join('')}</ul>`
    : '<p class="muted">No actions yet. Add one above.</p>';
  host.onchange = (e) => {
    const id = e.target.dataset.done;
    if (!id) return;
    const a = state.actions.find((x) => x.id === id);
    if (a) { a.done = e.target.checked; persist(); e.target.closest('.action').classList.toggle('action--done', a.done); announce(a.done ? 'Marked done. Well done for taking that step.' : 'Marked not done.'); }
  };
  host.onclick = (e) => {
    const id = e.target.closest('[data-remove]')?.dataset.remove;
    if (!id) return;
    state.actions = state.actions.filter((x) => x.id !== id);
    persist();
    drawPlan();
    announce('Action removed.');
    document.getElementById('plan-title').setAttribute('tabindex', '-1');
    document.getElementById('plan-title').focus();
  };
}

/* ------------------------------------------------------------------ *
 * Results
 * ------------------------------------------------------------------ */

function bullseyeSVG() {
  const nums = rankNums();
  const rated = state.core.map((id, i) => ({ id, i, living: state.reflections[id]?.living })).filter((x) => x.living != null);
  if (!rated.length) return '';
  const size = 320, c = size / 2, R = 140;
  const rings = [1, 0.75, 0.5, 0.25].map((f, k) =>
    `<circle cx="${c}" cy="${c}" r="${R * f}" class="be-ring be-ring--${k}"/>`).join('');
  const n = state.core.length;
  const dots = rated.map(({ id, i, living }) => {
    const angle = (-Math.PI / 2) + (2 * Math.PI * i) / n;
    const r = Math.max(0, (10 - living) / 10) * (R - 14);
    const x = c + r * Math.cos(angle), y = c + r * Math.sin(angle);
    return `<g class="be-dot"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"/><text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" text-anchor="middle">${nums[i]}</text></g>`;
  }).join('');
  return `<figure class="bullseye">
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-labelledby="be-title be-desc">
      <title id="be-title">Values bull’s-eye</title>
      <desc id="be-desc">Each numbered dot is one of your ranked values. The closer to the center, the more fully you said you are living it. ${rated.map(({ id, i, living }) => `${nums[i]}, ${val(id).name}: ${living} out of 10.`).join(' ')}</desc>
      ${rings}
      <line x1="${c}" y1="${c - R}" x2="${c}" y2="${c + R}" class="be-axis"/>
      <line x1="${c - R}" y1="${c}" x2="${c + R}" y2="${c}" class="be-axis"/>
      ${dots}
    </svg>
    <figcaption>Closer to the center means living it more fully. Numbers match your ranking.</figcaption>
  </figure>`;
}

const WHY_TEXT = { own: 'for its own sake', means: 'for what it gives me', both: 'for its own sake and for what it gives me' };

function summaryText() {
  const nums = rankNums();
  const lines = [];
  lines.push('MY VALUES (Lodestar ACT values card sort)');
  lines.push(formatDate(new Date().toISOString()));
  lines.push('');
  state.core.forEach((id, i) => {
    const v = val(id);
    const r = state.reflections[id];
    lines.push(`${nums[i]}. ${v.name}${r?.living != null ? ` (living it: ${r.living}/10)` : ''}`);
    if (r?.meaning?.trim()) lines.push(`   ${r.meaning.trim()}`);
    if (r?.why) lines.push(`   Valued ${WHY_TEXT[r.why]}${r.leadsTo?.trim() ? `: ${r.leadsTo.trim()}` : ''}`);
  });
  if (state.actions.length) {
    lines.push('', 'MY COMMITTED ACTIONS');
    state.actions.forEach((a) => {
      lines.push(`- [${a.done ? 'x' : ' '}] ${val(a.valueId)?.name}${a.areaId && areaById(a.areaId) ? ` (${areaById(a.areaId).name})` : ''}: ${a.step}${a.when ? ` (${a.when})` : ''}`);
      if (a.obstacles) lines.push(`    What might show up: ${a.obstacles}`);
      if (a.response) lines.push(`    What I'll do then: ${a.response}`);
    });
  }
  const areaLines = areaSummaryLines();
  if (areaLines.length) lines.push('', 'MY LIFE AREAS', ...areaLines);
  const others = inPile('very').filter((id) => !state.core.includes(id));
  if (others.length) lines.push('', `Also very important to me: ${others.map((id) => val(id).name).join(', ')}`);
  return lines.join('\n');
}

function viewResults() {
  const nums = rankNums();
  setTitle('My values');
  if (!state.core.length) {
    app.innerHTML = `<h1 class="visually-hidden">My values</h1>${emptyState({ title: 'Your values will appear here', body: 'Work through the card sort and your core values, reflections and action plan will be gathered on this page.', href: progress().sorted ? '#/core' : '#/sort', cta: progress().started ? 'Continue the card sort' : 'Begin the card sort' })}
    <div class="inline-actions inline-actions--center"><button type="button" class="btn btn--ghost btn--sm" data-action="import">Restore from a backup file</button></div>`;
    return;
  }
  const others = inPile('very').filter((id) => !state.core.includes(id));
  const some = inPile('some').filter((id) => !state.core.includes(id));
  const chart = bullseyeSVG();
  const canShare = typeof navigator.share === 'function';

  app.innerHTML = `
    <header class="page-head results-head">
      <p class="eyebrow">Your compass</p>
      <h1>My values</h1>
      <p class="lede">These are the directions you chose. Like a compass, they don’t tell you where you’ll end up; they help you choose your next step.</p>
      <p class="meta print-only">Lodestar ACT values card sort · ${formatDate(new Date().toISOString())}</p>
    </header>

    <div class="results-grid ${chart ? '' : 'results-grid--single'}">
      <section aria-labelledby="core-title">
        <h2 id="core-title">Core values</h2>
        <ol class="value-list">
          ${state.core.map((id, i) => {
            const v = val(id);
            const r = state.reflections[id];
            return `<li class="value">
              <span class="value__n" aria-hidden="true">${nums[i]}</span>
              <div class="value__body">
                <h3 class="value__name">${esc(v.name)}</h3>
                ${r?.meaning?.trim() ? `<p class="value__meaning">${esc(r.meaning.trim())}</p>` : `<p class="value__desc">${esc(v.desc)}</p>`}
                ${r?.why ? `<p class="value__why">Valued ${WHY_TEXT[r.why]}${r.leadsTo?.trim() ? `: ${esc(r.leadsTo.trim())}` : ''}</p>` : ''}
                ${r?.living != null ? `<div class="meter" aria-hidden="true"><span style="width:${r.living * 10}%"></span></div><p class="value__living">Living it: <strong>${r.living}</strong> out of 10</p>` : ''}
              </div>
            </li>`;
          }).join('')}
        </ol>
        <p class="no-print"><a href="#/reflect">Edit reflections</a> · <a href="#/rank">Change order</a> · <a href="#/core">Change values</a></p>
      </section>
      ${chart ? `<section aria-labelledby="be-heading" class="results-chart"><h2 id="be-heading">Bull’s-eye</h2>${chart}</section>` : ''}
    </div>

    <section class="section" aria-labelledby="plan-h">
      <h2 id="plan-h">My committed actions</h2>
      ${state.actions.length ? `<ul class="action-list">${state.actions.map((a) => actionHTML(a, { editable: false })).join('')}</ul>` : '<p class="muted">No actions planned yet.</p>'}
      <p class="no-print"><a href="#/act">${state.actions.length ? 'Add or update actions' : 'Plan an action'}</a></p>
    </section>

    ${others.length || some.length ? `<section class="section" aria-labelledby="also-h">
      <h2 id="also-h">Also important to me</h2>
      ${others.length ? `<p><strong>Very important:</strong> ${others.map((id) => esc(val(id).name)).join(', ')}</p>` : ''}
      ${some.length ? `<p><strong>Somewhat important:</strong> ${some.map((id) => esc(val(id).name)).join(', ')}</p>` : ''}
    </section>` : ''}

    <section class="section toolbox no-print" aria-labelledby="keep-h">
      <h2 id="keep-h">Keep or share your results</h2>
      <p class="muted">Your results are stored only in this browser. To keep them safe or move them to another device, save a copy.</p>
      <div class="toolbox__btns">
        <button type="button" class="btn btn--secondary" data-action="print">Print or save as PDF</button>
        <button type="button" class="btn btn--secondary" data-action="copy">Copy as text</button>
        ${canShare ? '<button type="button" class="btn btn--secondary" data-action="share">Share…</button>' : ''}
        <button type="button" class="btn btn--secondary" data-action="export">Download backup file</button>
        <button type="button" class="btn btn--ghost" data-action="import">Restore from backup</button>
        <button type="button" class="btn btn--ghost btn--danger" data-action="start-over">Start over</button>
      </div>
    </section>

    ${resultsAreasSection()}

    <section class="section tiles no-print" aria-label="Next">
      <a class="tile" href="#/decide">
        <h2 class="tile__title">Facing a decision?</h2>
        <p>Check your options against these values with the decision helper.</p>
        <span class="tile__go">Open the decision helper ${arrowIcon('right')}</span>
      </a>
      <a class="tile" href="#/learn#living">
        <h2 class="tile__title">Living your values day to day</h2>
        <p>Ideas for using your values when life gets hard.</p>
        <span class="tile__go">Read more ${arrowIcon('right')}</span>
      </a>
    </section>`;
}

/* ------------------------------------------------------------------ *
 * Life areas (optional, offered after the action plan exists)
 *
 * ACT treats life areas as the places where values are lived, not as values.
 * Research notes (docs/research/, reports on the life areas step) shaped this:
 * people pick only the areas that fit their life, rate one area per screen on
 * plain 5-point scales, can say an area is painful or not part of their life
 * without it counting against them, and never see a combined or "gap" score.
 * ------------------------------------------------------------------ */

const AREA_STATUS = {
  active: 'This matters to me',
  hard: 'Matters to me, but it’s hard right now',
  notnow: 'Not part of my life right now',
};
const IMPORTANCE = ['Slightly', 'Somewhat', 'Quite', 'Very', 'Extremely'];
const LIVING = ['Not at all', 'A little', 'Somewhat', 'Mostly', 'Fully'];

const allAreas = () => [...AREAS, ...state.customAreas];
// An area's linked values, limited to current core values. A value dropped
// from the core list no longer shows or counts toward the cap, but its link is
// kept in storage so it returns if the value is chosen again.
const areaValues = (a) => a.values.filter((v) => state.core.includes(v));
const areaById = (id) => allAreas().find((a) => a.id === id);
const pickedAreas = () => Object.keys(state.areas).filter((id) => areaById(id));

function areaSummaryLines() {
  return pickedAreas().map((id) => {
    const a = state.areas[id];
    const bits = [];
    if (a.status !== 'active') bits.push(AREA_STATUS[a.status].toLowerCase());
    if (a.status !== 'notnow' && a.importance) bits.push(`importance: ${IMPORTANCE[a.importance - 1].toLowerCase()}`);
    if (a.status !== 'notnow' && a.living) bits.push(`living it lately: ${LIVING[a.living - 1].toLowerCase()}`);
    const vals = areaValues(a).map((v) => val(v)?.name).filter(Boolean);
    return `- ${areaById(id).name}${bits.length ? ` (${bits.join('; ')})` : ''}${vals.length ? `: ${vals.join(', ')}` : ''}`;
  });
}

function viewAreas(param = '') {
  setTitle('My life areas');
  const [mode, n] = param.split('/');
  if (mode === 'pick' || !pickedAreas().length) return areasPick();
  if (mode === 'rate') return areasRate(Math.max(1, Number(n) || 1));
  return areasSummary();
}

const MAX_CUSTOM_AREAS = 20;

// `pending` holds ticks that haven't been confirmed with Continue yet, so that
// adding or removing a custom area doesn't save picks the person may back out of.
function areasPick(pending) {
  const picked = pending || new Set(pickedAreas());
  const atLimit = state.customAreas.length >= MAX_CUSTOM_AREAS;
  app.innerHTML = `
    <p class="crumb no-print"><a href="#/results">${arrowIcon('left')} My values</a></p>
    <header class="page-head">
      <p class="eyebrow">Optional · about 3 minutes</p>
      <h1>Map your values to your life</h1>
      <p class="lede">Values are lived in particular places: at home, at work, with friends, in your body. Choose the areas of life you’d like to look at, then decide which of your values each one most needs from you.</p>
    </header>
    <form id="areas-form" class="core-form" novalidate>
      <fieldset>
        <legend><span class="legend-title">Which areas would you like to look at?</span></legend>
        <p class="field-hint">Pick a few that matter right now; around three to five works well. Leave out any that don’t fit your life. You can also add your own.</p>
        <ul class="pick-list">
          ${allAreas().map((a) => `<li class="area-pick">
            <label class="pick">
              <input type="checkbox" value="${esc(a.id)}" ${picked.has(a.id) ? 'checked' : ''}>
              <span class="pick__box" aria-hidden="true">${checkIcon()}</span>
              <span class="pick__text"><strong>${esc(a.name)}</strong>${a.def ? `<span>${esc(a.def)}</span>` : '<span>Your own area</span>'}</span>
            </label>
            ${a.id.startsWith('area-') ? `<button type="button" class="icon-btn area-pick__remove" data-remove-area="${esc(a.id)}" aria-label="Remove ${esc(a.name)}"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>` : ''}
          </li>`).join('')}
        </ul>
      </fieldset>
      <div class="field add-area">
        <label for="new-area" class="field-label">Add your own area <span class="muted">(optional)</span></label>
        <div class="add-area__row">
          <input id="new-area" type="text" maxlength="40" autocomplete="off" placeholder="e.g. My garden, Caring for Dad, Music" ${atLimit ? 'disabled aria-describedby="area-limit"' : ''}>
          <button type="button" class="btn btn--ghost btn--sm" id="add-area-btn" ${atLimit ? 'aria-disabled="true"' : ''}>Add</button>
        </div>
        ${atLimit ? `<p class="field-hint" id="area-limit">You’ve added ${MAX_CUSTOM_AREAS} of your own areas, the most allowed. Remove one to add another.</p>` : ''}
      </div>
      <p class="error" id="areas-err" hidden></p>
      <div class="nav-row">
        <a class="btn btn--ghost" href="#/results">Not now</a>
        <button type="submit" class="btn btn--primary"><span>Continue</span>${arrowIcon('right')}</button>
      </div>
    </form>`;

  const form = document.getElementById('areas-form');
  const ticked = () => new Set([...form.querySelectorAll('input[type=checkbox]:checked')].map((c) => c.value));

  document.getElementById('add-area-btn').addEventListener('click', () => {
    const input = document.getElementById('new-area');
    if (state.customAreas.length >= MAX_CUSTOM_AREAS) return;
    const name = input.value.trim().slice(0, 40);
    if (!name) { input.focus(); return; }
    const keep = ticked();
    const area = { id: store.uid('area-'), name, def: '' };
    // The area's name is saved so it stays in the list; whether it's picked is
    // only saved when the person presses Continue.
    state.customAreas.push(area);
    persist();
    keep.add(area.id);
    areasPick(keep);
    announce(`${name} added and selected.`);
    // At the limit the text field is disabled, so move focus to the new area instead.
    const field = document.getElementById('new-area');
    if (field && !field.disabled) field.focus();
    else document.querySelector(`#areas-form input[value="${CSS.escape(area.id)}"]`)?.focus();
  });
  document.getElementById('new-area').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('add-area-btn').click(); }
  });
  form.addEventListener('click', (e) => {
    const id = e.target.closest('[data-remove-area]')?.dataset.removeArea;
    if (!id) return;
    const area = areaById(id);
    confirmDialog({
      title: `Remove “${area.name}”?`,
      body: 'This removes the area and anything you noted for it. Actions linked to it keep their value but lose the area tag.',
      confirm: 'Remove area',
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      const keep = ticked();
      keep.delete(id);
      state.customAreas = state.customAreas.filter((a) => a.id !== id);
      delete state.areas[id];
      state.actions.forEach((a) => { if (a.areaId === id) a.areaId = ''; });
      persist();
      areasPick(keep);
      announce(`${area.name} removed.`);
      document.getElementById('new-area')?.focus();
    });
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const chosen = [...ticked()];
    const err = document.getElementById('areas-err');
    if (!chosen.length) {
      err.textContent = 'Choose at least one area, or select “Not now” to go back.';
      err.hidden = false;
      err.setAttribute('tabindex', '-1');
      err.focus();
      return;
    }
    const next = {};
    for (const id of chosen) next[id] = state.areas[id] || { status: 'active', importance: null, living: null, values: [] };
    state.areas = next;
    persist();
    location.hash = '#/areas/rate/1';
  });
}

function seg(name, labels, current, legend, hint = '') {
  return `<fieldset class="field">
    <legend class="field-label">${legend}</legend>
    ${hint ? `<p class="field-hint">${hint}</p>` : ''}
    <div class="seg seg--scale">
      ${labels.map((label, i) => `<label class="seg__opt"><input type="radio" name="${name}" value="${i + 1}" ${current === i + 1 ? 'checked' : ''}><span>${label}</span></label>`).join('')}
    </div>
  </fieldset>`;
}

function areasRate(n) {
  const ids = pickedAreas();
  if (n > ids.length) { location.hash = '#/areas'; return; }
  const id = ids[n - 1];
  const area = areaById(id);
  const a = state.areas[id];
  const last = n === ids.length;
  setTitle(`${area.name} · Life areas`);

  app.innerHTML = `
    <p class="crumb no-print"><a href="#/areas/pick">${arrowIcon('left')} Choose areas</a></p>
    <header class="page-head">
      <p class="eyebrow">Life area ${n} of ${ids.length}</p>
      <h1>${esc(area.name)}</h1>
      ${area.def ? `<p class="lede">${esc(area.def)}</p>` : ''}
    </header>
    <form id="area-form" class="card-form area-form" novalidate>
      <fieldset class="field">
        <legend class="field-label">How is this area for you right now?</legend>
        <div class="radio-row">
          ${Object.entries(AREA_STATUS).map(([k, label]) => `<label class="radio"><input type="radio" name="status" value="${k}" ${a.status === k ? 'checked' : ''}><span>${label}</span></label>`).join('')}
        </div>
      </fieldset>
      <p class="nudge" id="hard-note" ${a.status === 'hard' ? '' : 'hidden'}>That’s okay. Areas that hurt are often where our values run deepest. Answer only what feels right, and skip the rest. If you need support, <a href="#/about">help is available</a>.</p>
      <div id="area-details" ${a.status === 'notnow' ? 'hidden' : ''}>
        ${seg('importance', IMPORTANCE, a.importance, 'How important is this area to you?')}
        ${seg('living', LIVING, a.living, 'Lately, how much have you been living the way you want here? <span class="muted">(optional)</span>', 'Think about the past two weeks. There’s no right answer, and a low number isn’t a failure.')}
        <fieldset class="field">
          <legend class="field-label">Which of your values does this area most need from you? <span class="muted">(up to ${MAX_AREA_VALUES})</span></legend>
          ${state.core.length ? `<div class="area-chips">
            ${state.core.map((vid) => `<label class="chip-opt"><input type="checkbox" name="values" value="${esc(vid)}" ${a.values.includes(vid) ? 'checked' : ''}><span>${esc(val(vid).name)}</span></label>`).join('')}
          </div>
          <p class="error" id="vals-err" hidden></p>` : '<p class="muted">Once you have chosen your core values, you can link them to this area.</p>'}
        </fieldset>
      </div>
      <div class="nav-row">
        <a class="btn btn--ghost" href="${n === 1 ? '#/areas/pick' : `#/areas/rate/${n - 1}`}">${arrowIcon('left')}<span>Back</span></a>
        <a class="btn btn--primary" href="${last ? '#/areas' : `#/areas/rate/${n + 1}`}"><span>${last ? 'See my life areas' : 'Next area'}</span>${arrowIcon('right')}</a>
      </div>
    </form>`;

  const form = document.getElementById('area-form');
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'status') {
      a.status = t.value;
      document.getElementById('area-details').hidden = t.value === 'notnow';
      document.getElementById('hard-note').hidden = t.value !== 'hard';
    } else if (t.name === 'importance') {
      a.importance = Number(t.value);
    } else if (t.name === 'living') {
      a.living = Number(t.value);
    } else if (t.name === 'values') {
      const err = document.getElementById('vals-err');
      err.hidden = true;
      if (t.checked && areaValues(a).length >= MAX_AREA_VALUES) {
        t.checked = false;
        err.textContent = `Choose up to ${MAX_AREA_VALUES}. Unselect one to make room.`;
        err.hidden = false;
        announce(err.textContent);
        return;
      }
      if (t.checked) {
        // Links to values that are no longer core values are kept, so they come
        // back if the value is chosen again. They are only replaced once the
        // person actively fills a slot they were holding.
        const hidden = a.values.filter((v) => !state.core.includes(v));
        const keepHidden = hidden.slice(0, Math.max(0, MAX_AREA_VALUES - areaValues(a).length - 1));
        a.values = [...new Set([...areaValues(a), t.value, ...keepHidden])];
      } else {
        a.values = a.values.filter((v) => v !== t.value);
      }
    }
    persist();
  });
}

function areaBars(a) {
  const bar = (label, value, labels) => (value ? `<div class="area-bar">
      <span class="area-bar__label">${label}: <strong>${labels[value - 1]}</strong></span>
      <span class="area-bar__track" aria-hidden="true"><span style="width:${value * 20}%"></span></span>
    </div>` : '');
  return bar('Importance', a.importance, IMPORTANCE) + bar('Living it lately', a.living, LIVING);
}

function areasSummary() {
  const ids = pickedAreas();
  // Gently point to areas that matter a lot but have had little room lately.
  // Shown as a suggestion only; never as a score.
  const roomToGrow = ids.filter((id) => {
    const a = state.areas[id];
    return a.status === 'active' && a.importance >= 4 && a.living && a.living <= 2;
  });
  app.innerHTML = `
    <p class="crumb no-print"><a href="#/results">${arrowIcon('left')} My values</a></p>
    <header class="page-head">
      <p class="eyebrow">Optional</p>
      <h1>My life areas</h1>
      <p class="lede">Where your values live. Use this to choose where your next small step could go.</p>
    </header>
    ${roomToGrow.length ? `<div class="insight">${starIcon(18)}<span>${roomToGrow.map((id) => `<strong>${esc(areaById(id).name)}</strong>`).join(' and ')} ${roomToGrow.length > 1 ? 'matter' : 'matters'} a lot to you, and there hasn’t been much room for ${roomToGrow.length > 1 ? 'them' : 'it'} lately. That could be a good place for one small step.</span></div>` : ''}
    <ul class="area-list">
      ${ids.map((id, i) => {
        const area = areaById(id);
        const a = state.areas[id];
        return `<li class="area-card${a.status === 'notnow' ? ' area-card--quiet' : ''}">
          <div class="area-card__head">
            <h2 class="area-card__name">${esc(area.name)}</h2>
            ${a.status !== 'active' ? `<span class="tag tag--status">${esc(AREA_STATUS[a.status])}</span>` : ''}
          </div>
          ${a.status !== 'notnow' ? areaBars(a) : ''}
          ${areaValues(a).length ? `<p class="area-card__values">${areaValues(a).map((v) => `<span class="tag">${esc(val(v).name)}</span>`).join(' ')}</p>` : ''}
          <p class="area-card__links no-print">
            <a href="#/areas/rate/${i + 1}">Edit<span class="visually-hidden"> ${esc(area.name)}</span></a>
            ${a.status !== 'notnow' && state.core.length ? ` · <a href="#/act/${esc(id)}">Plan a step here<span class="visually-hidden">: ${esc(area.name)}</span></a>` : ''}
          </p>
        </li>`;
      }).join('')}
    </ul>
    <div class="inline-actions no-print">
      <a class="btn btn--ghost btn--sm" href="#/areas/pick">Change areas</a>
      <button type="button" class="btn btn--ghost btn--sm btn--danger" data-action="clear-areas">Remove life areas</button>
    </div>
    <div class="nav-row">
      <a class="btn btn--ghost" href="#/results">${arrowIcon('left')}<span>My values</span></a>
      ${state.core.length ? `<a class="btn btn--primary" href="#/act${roomToGrow[0] ? `/${esc(roomToGrow[0])}` : ''}"><span>Plan a step</span>${arrowIcon('right')}</a>` : ''}
    </div>`;
}

function resultsAreasSection() {
  const ids = pickedAreas();
  if (!ids.length) {
    return `<section class="section no-print area-invite" aria-labelledby="areas-h">
      <h2 id="areas-h">Map your values to your life</h2>
      <p>Optional, about 3 minutes. Choose a few areas of life, such as family, work or health, and decide which of your values each one most needs from you. It can help you see where your next step could go.</p>
      <a class="btn btn--secondary" href="#/areas/pick">Add life areas</a>
    </section>`;
  }
  return `<section class="section" aria-labelledby="areas-h">
    <h2 id="areas-h">My life areas</h2>
    <ul class="area-mini">
      ${ids.map((id) => {
        const a = state.areas[id];
        const names = areaValues(a).map((v) => val(v)?.name).filter(Boolean);
        return `<li><strong>${esc(areaById(id).name)}</strong>${a.status !== 'active' ? ` <span class="muted">(${esc(AREA_STATUS[a.status].toLowerCase())})</span>` : ''}${names.length ? `: ${names.map(esc).join(', ')}` : ''}</li>`;
      }).join('')}
    </ul>
    <p class="no-print"><a href="#/areas">See and edit life areas</a></p>
  </section>`;
}

/* ------------------------------------------------------------------ *
 * Decision helper (a values "choice point")
 * ------------------------------------------------------------------ */

const RATING = [
  { n: -1, label: 'Away', long: 'Moves me away from this value' },
  { n: 0, label: 'Neither', long: 'Neither toward nor away' },
  { n: 1, label: 'Toward', long: 'Moves me toward this value' },
];

function viewDecide(param) {
  if (param) return viewDecision(param);
  setTitle('Decision helper');
  const list = [...state.decisions].sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
  app.innerHTML = `
    <header class="page-head">
      <p class="eyebrow">Values in action</p>
      <h1>Make a decision with your values</h1>
      <p class="lede">When you are stuck between options, it can help to set aside “which will feel better?” and ask “which moves me toward the person I want to be?” This tool walks you through that question for each of your core values.</p>
    </header>
    ${!state.core.length ? `<div class="notice">
        <p><strong>You haven’t chosen your core values yet.</strong> The decision helper uses them, so it works best after the card sort.</p>
        <a class="btn btn--primary" href="#/${progress().sorted ? 'core' : 'sort'}">${progress().started ? 'Continue the card sort' : 'Begin the card sort'}</a>
      </div>` : `<button type="button" class="btn btn--primary btn--lg" data-action="new-decision"><span aria-hidden="true">+</span><span>New decision</span></button>`}
    ${list.length ? `<section class="section" aria-labelledby="saved-h">
      <h2 id="saved-h">Saved decisions</h2>
      <ul class="decision-list">
        ${list.map((d) => `<li><a class="decision-link" href="#/decide/${esc(d.id)}">
          <strong>${esc(d.question || 'Untitled decision')}</strong>
          <span class="muted">${plural(d.options.length, 'option')} · ${formatDate(d.updated || d.created)}</span>
        </a></li>`).join('')}
      </ul>
    </section>` : ''}
    <details class="prompts">
      <summary>How this works, and what it isn’t</summary>
      <p>In ACT, a “choice point” is any moment where you can move toward what matters or away from it. Hard choices often pull us toward whatever reduces discomfort fastest. Rating your options against your values makes the trade-offs visible.</p>
      <p>This is a mirror, not a calculator. It won’t tell you the “right” answer, and a value-guided choice can still feel scary. Use the result as one input, alongside practical facts and the people you trust.</p>
    </details>`;
}

function newDecision() {
  const now = new Date().toISOString();
  const d = {
    id: store.uid('d'),
    question: '',
    options: [{ id: store.uid('o'), label: '' }, { id: store.uid('o'), label: '' }],
    ratings: {},
    feelings: '',
    choice: '',
    created: now,
    updated: now,
  };
  d.options.forEach((o) => { d.ratings[o.id] = {}; });
  state.decisions.push(d);
  persist();
  location.hash = `#/decide/${d.id}`;
}

function optionName(o, i) {
  return o.label.trim() || `Option ${String.fromCharCode(65 + i)}`;
}

function viewDecision(id) {
  const d = state.decisions.find((x) => x.id === id);
  if (!d) {
    setTitle('Decision not found');
    app.innerHTML = `<h1 class="visually-hidden">Decision not found</h1>${emptyState({ title: 'That decision isn’t here', body: 'It may have been deleted, or saved in a different browser.', href: '#/decide', cta: 'Back to decisions' })}`;
    return;
  }
  setTitle(d.question ? `Decision: ${d.question.slice(0, 40)}` : 'New decision');
  const values = state.core.length ? state.core : [];

  app.innerHTML = `
    <p class="crumb"><a href="#/decide">${arrowIcon('left')} All decisions</a></p>
    <header class="page-head">
      <p class="eyebrow">Decision helper</p>
      <h1>${d.question ? esc(d.question) : 'New decision'}</h1>
    </header>
    <form id="decision-form" class="decision" novalidate>
      <section class="card-form" aria-labelledby="d1">
        <h2 id="d1"><span class="num-badge" aria-hidden="true">1</span>What are you deciding?</h2>
        <div class="field">
          <label for="d-q" class="field-label">Your question</label>
          <input id="d-q" type="text" autocomplete="off" maxlength="500" value="${esc(d.question)}" placeholder="e.g. Should I take the new job?">
        </div>
        <fieldset class="field">
          <legend class="field-label">Your options</legend>
          <p class="field-hint">Two to four options. “Stay as I am” can be an option too.</p>
          <ol class="option-inputs" id="option-inputs">
            ${d.options.map((o, i) => `<li>
              <label for="opt-${esc(o.id)}" class="visually-hidden">Option ${i + 1}</label>
              <input id="opt-${esc(o.id)}" type="text" autocomplete="off" maxlength="200" data-opt="${esc(o.id)}" value="${esc(o.label)}" placeholder="Option ${String.fromCharCode(65 + i)}">
              ${d.options.length > 2 ? `<button type="button" class="icon-btn" data-remove-opt="${esc(o.id)}" aria-label="Remove option ${i + 1}"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>` : ''}
            </li>`).join('')}
          </ol>
          ${d.options.length < 4 ? '<button type="button" class="btn btn--ghost btn--sm" data-action="add-opt"><span aria-hidden="true">+</span><span>Add an option</span></button>' : ''}
        </fieldset>
      </section>

      <section class="card-form" aria-labelledby="d2">
        <h2 id="d2"><span class="num-badge" aria-hidden="true">2</span>Check each option against your values</h2>
        <p class="field-hint">Imagine yourself having chosen each option. Would it move you toward or away from each value?</p>
        ${values.length ? d.options.map((o, oi) => `
          <fieldset class="opt-matrix">
            <legend class="opt-matrix__legend" data-legend="${esc(o.id)}">${esc(optionName(o, oi))}</legend>
            ${values.map((vid) => {
              const v = val(vid);
              const cur = d.ratings[o.id]?.[vid];
              const gname = `r-${o.id}-${vid}`;
              return `<div class="rate-row" role="radiogroup" aria-labelledby="${esc(gname)}-l">
                <span class="rate-row__value" id="${esc(gname)}-l"><span class="visually-hidden" data-optname="${esc(o.id)}">${esc(optionName(o, oi))}: </span>${esc(v.name)}</span>
                <span class="seg">
                  ${RATING.map((r) => `<label class="seg__opt seg__opt--${r.n < 0 ? 'away' : r.n > 0 ? 'toward' : 'neither'}">
                    <input type="radio" name="${esc(gname)}" value="${r.n}" data-o="${esc(o.id)}" data-v="${esc(vid)}" ${cur === r.n ? 'checked' : ''}>
                    <span>${r.label}</span>
                  </label>`).join('')}
                </span>
              </div>`;
            }).join('')}
          </fieldset>`).join('') : '<p class="notice">Choose your core values first, using the <a href="#/sort">card sort</a>.</p>'}
      </section>

      <section class="card-form" aria-labelledby="d3">
        <h2 id="d3"><span class="num-badge" aria-hidden="true">3</span>What your ratings show</h2>
        <div id="d-summary" aria-live="polite"></div>
      </section>

      <section class="card-form" aria-labelledby="d4">
        <h2 id="d4"><span class="num-badge" aria-hidden="true">4</span>Make room, then choose</h2>
        <div class="field">
          <label for="d-feel" class="field-label">What difficult thoughts or feelings show up when you imagine taking the values-guided option? Are you willing to make room for them?</label>
          <textarea id="d-feel" rows="3">${esc(d.feelings)}</textarea>
        </div>
        <div class="field">
          <label for="d-choice" class="field-label">What will you do? What is your next small step?</label>
          <textarea id="d-choice" rows="3">${esc(d.choice)}</textarea>
        </div>
      </section>

      <div class="nav-row">
        <button type="button" class="btn btn--ghost btn--danger" data-action="delete-decision">Delete this decision</button>
        <a class="btn btn--primary" href="#/decide">Save and close</a>
      </div>
      <p class="muted center">Changes save automatically on this device.</p>
    </form>`;

  const touch = () => { d.updated = new Date().toISOString(); persistSoon(); };
  const drawSummary = () => {
    const host = document.getElementById('d-summary');
    if (!host) return;
    if (!values.length) { host.innerHTML = ''; return; }
    const nums = rankNums();
    const weights = values.map((_, i) => values.length - (nums[i] - 1)); // higher rank, more weight; ties share
    const maxW = weights.reduce((a, b) => a + b, 0);
    const rows = d.options.map((o, oi) => {
      const r = d.ratings[o.id] || {};
      const toward = values.filter((v) => r[v] === 1);
      const away = values.filter((v) => r[v] === -1);
      const rated = values.filter((v) => r[v] != null).length;
      const score = values.reduce((s, v, i) => s + (r[v] || 0) * weights[i], 0);
      return { o, oi, toward, away, rated, score };
    });
    const anyRated = rows.some((x) => x.rated > 0);
    if (!anyRated) {
      host.innerHTML = '<p class="muted">Rate some options above and a summary will appear here.</p>';
      return;
    }
    const best = Math.max(...rows.map((x) => x.score));
    const leaders = rows.filter((x) => x.score === best && x.rated > 0);
    host.innerHTML = `<ul class="summary-list">${rows.map((x) => {
      const pct = Math.round((x.score / maxW) * 50); // -50..50
      return `<li class="summary">
        <h3 class="summary__name">${esc(optionName(x.o, x.oi))}</h3>
        <div class="diverge" aria-hidden="true"><span class="diverge__mid"></span><span class="diverge__bar ${pct < 0 ? 'is-neg' : 'is-pos'}" style="${pct < 0 ? `right:50%;width:${-pct}%` : `left:50%;width:${pct}%`}"></span></div>
        <p><span class="pill pill--toward">Toward ${x.toward.length}</span> ${x.toward.length ? x.toward.map((v) => esc(val(v).name)).join(', ') : '<span class="muted">none</span>'}</p>
        <p><span class="pill pill--away">Away ${x.away.length}</span> ${x.away.length ? x.away.map((v) => esc(val(v).name)).join(', ') : '<span class="muted">none</span>'}</p>
        ${x.rated < values.length ? `<p class="muted small">${values.length - x.rated} of ${values.length} values not yet rated.</p>` : ''}
      </li>`;
    }).join('')}</ul>
    ${best > 0 && leaders.length === 1 ? `<p class="insight">${starIcon(18)}<span>Weighing your values by rank, <strong>${esc(optionName(leaders[0].o, leaders[0].oi))}</strong> moves you furthest toward what matters to you.</span></p>`
      : leaders.length > 1 && best > 0 ? `<p class="insight">${starIcon(18)}<span>Several options are equally aligned with your values. Notice which one you would be proud of having chosen.</span></p>`
      : '<p class="insight">' + starIcon(18) + '<span>None of the options clearly moves you toward your values. Is there another option you haven’t considered yet?</span></p>'}`;
  };
  drawSummary();

  const form = document.getElementById('decision-form');
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'd-q') {
      d.question = t.value.slice(0, 500);
      app.querySelector('h1').textContent = d.question || 'New decision';
      touch();
    } else if (t.dataset.opt) {
      const i = d.options.findIndex((o) => o.id === t.dataset.opt);
      if (i > -1) {
        d.options[i].label = t.value.slice(0, 200);
        const name = optionName(d.options[i], i);
        app.querySelectorAll(`[data-legend="${CSS.escape(t.dataset.opt)}"]`).forEach((el) => { el.textContent = name; });
        app.querySelectorAll(`[data-optname="${CSS.escape(t.dataset.opt)}"]`).forEach((el) => { el.textContent = `${name}: `; });
        drawSummary();
        touch();
      }
    } else if (t.id === 'd-feel') { d.feelings = t.value.slice(0, 2000); touch(); }
    else if (t.id === 'd-choice') { d.choice = t.value.slice(0, 2000); touch(); }
  });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t.type === 'radio' && t.dataset.o) {
      d.ratings[t.dataset.o] = d.ratings[t.dataset.o] || {};
      d.ratings[t.dataset.o][t.dataset.v] = Number(t.value);
      touch();
      drawSummary();
    }
  });
  form.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove-opt]');
    if (rm) {
      const oid = rm.dataset.removeOpt;
      d.options = d.options.filter((o) => o.id !== oid);
      delete d.ratings[oid];
      touch(); persist();
      viewDecision(id);
      announce('Option removed.');
      app.querySelector('#option-inputs input')?.focus();
    }
  });
  onCleanup(persist);
}

/* ------------------------------------------------------------------ *
 * Static pages
 * ------------------------------------------------------------------ */

function viewLearn() {
  setTitle('About values');
  app.innerHTML = learnHTML(VALUES.length);
}

function viewAbout() {
  setTitle('About, privacy and support');
  app.innerHTML = aboutHTML();
}

function viewNotFound() {
  setTitle('Page not found');
  app.innerHTML = `<h1 class="visually-hidden">Page not found</h1>${emptyState({ title: 'Page not found', body: 'That page doesn’t exist.', href: '#/', cta: 'Go home' })}`;
}

/* ------------------------------------------------------------------ *
 * Global actions (event delegation)
 * ------------------------------------------------------------------ */

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  if (el.getAttribute('aria-disabled') === 'true') return;
  switch (action) {
    case 'undo': undo(); break;
    case 'add-custom': openCustomDialog(); break;
    case 'resort': confirmDialog({
      title: 'Sort the deck again?',
      body: 'Your piles will be cleared and the cards reshuffled. Your chosen core values, reflections and actions will be kept.',
      confirm: 'Reshuffle and sort again',
    }).then((ok) => {
      if (!ok) return;
      state.order = store.shuffle([...VALUES.map((v) => v.id), ...state.custom.map((c) => c.id)]);
      state.pos = 0; state.piles = {}; state.history = []; state.bw = {};
      persist(); render();
    }); break;
    case 'pairwise': runPairwise(); break;
    case 'narrow': runNarrowing(); break;
    case 'clear-areas': confirmDialog({
      title: 'Remove your life areas?',
      body: 'This removes the areas you chose and what you noted for each. Your values, reflections and actions stay as they are.',
      confirm: 'Remove life areas',
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      state.areas = {};
      state.customAreas = [];
      state.actions.forEach((a) => { a.areaId = ''; });
      persist();
      location.hash = '#/results';
      announce('Life areas removed.');
    }); break;
    case 'use-top5': confirmDialog({
      title: 'Use the suggested five?',
      body: 'This replaces your current core values and resets their order. Your reflections are kept and come back if you choose those values again.',
      confirm: 'Use these five',
    }).then((ok) => {
      if (!ok) return;
      state.core = topFive();
      state.ties = [];
      state.ranked = false;
      persist();
      viewCore();
      announce(`Your core values are now: ${state.core.map((id) => val(id).name).join(', ')}.`);
      app.querySelector('h1')?.focus();
    }); break;
    case 'dismiss-update': {
      state.deckUpdated = false;
      persist();
      el.closest('.notice')?.remove();
      announce('Notice dismissed.');
      app.querySelector('h1')?.focus();
      break;
    }
    case 'start-over': confirmDialog({
      title: 'Start over?',
      body: 'This permanently erases your sorted cards, core values, reflections, actions and saved decisions from this device. You might want to download a backup first.',
      confirm: 'Erase everything',
      danger: true,
    }).then((ok) => {
      if (!ok) return;
      state = store.clear();
      persist();
      announce('Everything has been erased.');
      if (location.hash === '#/' || location.hash === '') render(); else location.hash = '#/';
    }); break;
    case 'print': window.print(); break;
    case 'copy': copyText(summaryText()); break;
    case 'share':
      navigator.share({ title: 'My values', text: summaryText() }).catch(() => {});
      break;
    case 'export': exportJSON(); break;
    case 'import': importJSON(); break;
    case 'new-decision': newDecision(); break;
    case 'add-opt': {
      const { param } = parseHash();
      const d = state.decisions.find((x) => x.id === param);
      if (d && d.options.length < 4) {
        const o = { id: store.uid('o'), label: '' };
        d.options.push(o); d.ratings[o.id] = {};
        persist(); viewDecision(param);
        document.getElementById(`opt-${o.id}`)?.focus();
        announce('Option added.');
      }
      break;
    }
    case 'delete-decision': {
      const { param } = parseHash();
      confirmDialog({ title: 'Delete this decision?', body: 'This can’t be undone.', confirm: 'Delete', danger: true }).then((ok) => {
        if (!ok) return;
        state.decisions = state.decisions.filter((x) => x.id !== param);
        persist();
        location.hash = '#/decide';
        announce('Decision deleted.');
      });
      break;
    }
    case 'theme': cycleTheme(); break;
    default: break;
  }
});

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    announce('Copied your values to the clipboard.');
    toast('Copied to clipboard');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.append(ta); ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    announce(ok ? 'Copied your values to the clipboard.' : 'Copying is not available in this browser.');
    toast(ok ? 'Copied to clipboard' : 'Copy not available');
  }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify({ app: 'lodestar', ...state }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `lodestar-values-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  announce('Backup file downloaded.');
}

function importJSON() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('too big');
      const data = JSON.parse(await file.text());
      if (data.app !== 'lodestar') throw new Error('not lodestar');
      const ok = await confirmDialog({ title: 'Restore this backup?', body: 'This will replace what is currently saved on this device.', confirm: 'Restore' });
      if (!ok) return;
      state = store.normalize(data);
      persist();
      announce('Backup restored.');
      toast('Backup restored');
      render();
    } catch {
      confirmDialog({ title: 'Couldn’t read that file', body: 'Please choose a backup file downloaded from Lodestar.', confirm: 'OK', hideCancel: true });
    }
  });
  input.click();
}

/* Dialogs */

function confirmDialog({ title, body, confirm, danger = false, hideCancel = false }) {
  return new Promise((resolve) => {
    const dlg = document.createElement('dialog');
    dlg.className = 'dialog';
    dlg.setAttribute('aria-labelledby', 'dlg-title');
    dlg.setAttribute('aria-describedby', 'dlg-body');
    dlg.innerHTML = `<form method="dialog">
      <h2 id="dlg-title">${esc(title)}</h2>
      <p id="dlg-body">${esc(body)}</p>
      <div class="dialog__btns">
        ${hideCancel ? '' : '<button value="cancel" class="btn btn--ghost" autofocus>Cancel</button>'}
        <button value="ok" class="btn ${danger ? 'btn--danger-solid' : 'btn--primary'}" ${hideCancel ? 'autofocus' : ''}>${esc(confirm)}</button>
      </div>
    </form>`;
    const opener = document.activeElement;
    document.body.append(dlg);
    dlg.addEventListener('close', () => {
      resolve(dlg.returnValue === 'ok');
      dlg.remove();
      if (opener && document.contains(opener)) opener.focus();
    });
    dlg.showModal();
  });
}

// ACT treats outcomes (wealth, status) and feelings (happiness) as things we
// hope for, not values. Rather than refuse them, invite a step "up the ladder".
function customNudge(text) {
  if (/\b(wealth|wealthy|money|rich|success|successful|fame|famous|status|power|powerful|popular|popularity|admired|respected|recognition|winning|prestige)\b/i.test(text)) {
    return 'This sounds like something you\u2019d like to have. If you had it, what would it let you do, or how would you act? That quality may be the value underneath. You can still add this card.';
  }
  if (/\b(happy|happiness|calm|confident|confidence|content|contentment|relaxed|stress-free)\b/i.test(text)) {
    return 'This sounds like a feeling, and feelings come and go on their own. If you felt this way, what would you be doing differently? That may be the value. You can still add this card.';
  }
  return '';
}

function openCustomDialog() {
  const dlg = document.createElement('dialog');
  dlg.className = 'dialog';
  dlg.setAttribute('aria-labelledby', 'cdlg-title');
  dlg.innerHTML = `<form method="dialog" novalidate>
    <h2 id="cdlg-title">Add your own value</h2>
    <p class="muted">Is something important missing from the deck? Add it in your own words.</p>
    <div class="field">
      <label for="c-name" class="field-label">Value name</label>
      <input id="c-name" type="text" maxlength="40" autocomplete="off" required aria-describedby="c-err">
      <p class="error" id="c-err" hidden>Give your value a name.</p>
      <p class="nudge" id="c-nudge" hidden></p>
    </div>
    <div class="field">
      <label for="c-desc" class="field-label">What it means to you <span class="muted">(optional)</span></label>
      <textarea id="c-desc" rows="2" maxlength="160"></textarea>
    </div>
    <fieldset class="field">
      <legend class="field-label">Which pile?</legend>
      <div class="radio-row">
        ${PILE_ORDER.map((p, i) => `<label class="radio"><input type="radio" name="c-pile" value="${p}" ${i === 0 ? 'checked' : ''}><span>${PILES[p].label}</span></label>`).join('')}
      </div>
    </fieldset>
    <div class="dialog__btns">
      <button value="cancel" class="btn btn--ghost" formnovalidate>Cancel</button>
      <button value="ok" class="btn btn--primary" id="c-save">Add value</button>
    </div>
  </form>`;
  const opener = document.activeElement;
  document.body.append(dlg);
  const name = dlg.querySelector('#c-name');
  const nudge = dlg.querySelector('#c-nudge');
  const checkNudge = () => {
    const text = `${name.value} ${dlg.querySelector('#c-desc').value}`;
    const msg = customNudge(text);
    nudge.textContent = msg;
    nudge.hidden = !msg;
  };
  name.addEventListener('input', checkNudge);
  dlg.querySelector('#c-desc').addEventListener('input', checkNudge);
  dlg.querySelector('#c-save').addEventListener('click', (e) => {
    if (!name.value.trim()) {
      e.preventDefault();
      dlg.querySelector('#c-err').hidden = false;
      name.setAttribute('aria-invalid', 'true');
      name.focus();
    }
  });
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'ok' && name.value.trim()) {
      const pile = dlg.querySelector('input[name="c-pile"]:checked').value;
      const c = { id: store.uid('custom-'), name: name.value.trim().slice(0, 40), desc: dlg.querySelector('#c-desc').value.trim().slice(0, 160) || 'A value in my own words.', custom: true };
      state.custom.push(c);
      state.piles[c.id] = pile;
      persist();
      announce(`${c.name} added to ${PILES[pile].label}.`);
      toast(`Added “${c.name}”`);
      const onReview = parseHash().name === 'sort' && state.pos >= state.order.length;
      if (onReview) viewSortReview(); else updateSortUI(false);
    }
    dlg.remove();
    if (opener && document.contains(opener)) opener.focus();
  });
  dlg.showModal();
}

let toastTimer;
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('aria-hidden', 'true'); // announced via the live region instead
    document.body.append(t);
  }
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
}

/* Theme */

const THEMES = ['system', 'light', 'dark'];
function applyTheme(t) {
  const root = document.documentElement;
  if (t === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
  const btn = document.querySelector('[data-action="theme"]');
  if (btn) {
    btn.querySelector('.theme-label').textContent = { system: 'Auto', light: 'Light', dark: 'Dark' }[t];
    btn.setAttribute('aria-label', `Color theme: ${{ system: 'automatic', light: 'light', dark: 'dark' }[t]}. Activate to change.`);
  }
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.remove();
}
function cycleTheme() {
  let cur = 'system';
  try { cur = localStorage.getItem('lodestar:theme') || 'system'; } catch { /* ignore */ }
  const next = THEMES[(THEMES.indexOf(cur) + 1) % THEMES.length];
  try { localStorage.setItem('lodestar:theme', next); } catch { /* ignore */ }
  applyTheme(next);
  announce(`Theme: ${{ system: 'automatic, following your device', light: 'light', dark: 'dark' }[next]}.`);
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

(function boot() {
  let theme = 'system';
  try { theme = localStorage.getItem('lodestar:theme') || 'system'; } catch { /* ignore */ }
  applyTheme(theme);
  if (!store.persistent) {
    document.getElementById('storage-warning')?.removeAttribute('hidden');
  }
  render();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
})();
