// Offline support. Pages are fetched network-first (so updates arrive quickly);
// static assets are served from cache and refreshed in the background.
const VERSION = 'lodestar-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/theme-init.js',
  './assets/js/app.js',
  './assets/js/store.js',
  './assets/js/values.js',
  './assets/js/content.js',
  './assets/js/config.js',
  './assets/icons/icon.svg',
  './assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2',
  './assets/fonts/atkinson-hyperlegible-latin-400-italic.woff2',
  './assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2',
  './assets/fonts/atkinson-hyperlegible-latin-700-italic.woff2',
  './assets/fonts/fraunces-latin-opsz-normal.woff2',
  './assets/fonts/fraunces-latin-opsz-italic.woff2',
];

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the browser's HTTP cache, so every file in this
  // install comes from the same deploy and the modules always match.
  event.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Shown for pages other than the app that were never visited online. The app
// shell can't stand in for them: its relative asset paths would break.
function offlinePage() {
  const html = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<title>Offline \u00b7 Lodestar</title><body style="font:17px/1.6 system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem;color:#1d2b2f;background:#f6f1e9">'
    + '<h1>You\u2019re offline</h1><p>This page hasn\u2019t been saved for offline use yet. Connect to the internet and try again.</p>'
    + '<p><a href="' + new URL(self.registration.scope).pathname + '" style="color:#1e5e59">Open the Lodestar card sort</a>, which works offline.</p></body></html>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Only the app shell is cached as the offline page; other pages (like the
    // docs) are cached under their own URL so they never replace it.
    const scope = new URL(self.registration.scope).pathname;
    const path = new URL(req.url).pathname;
    const isShell = path === scope || path === `${scope}index.html`;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(isShell ? './index.html' : req, copy)); }
          return res;
        })
        .catch(() => (isShell ? caches.match('./index.html') : caches.match(req).then((r) => r || offlinePage()))),
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); } return res; })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
