// Offline support. Pages are fetched network-first (so updates arrive quickly);
// static assets are served from cache and refreshed in the background.
const VERSION = 'lodestar-v2';
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
  './assets/icons/icon.svg',
  './assets/fonts/atkinson-hyperlegible-latin-400-normal.woff2',
  './assets/fonts/atkinson-hyperlegible-latin-400-italic.woff2',
  './assets/fonts/atkinson-hyperlegible-latin-700-normal.woff2',
  './assets/fonts/atkinson-hyperlegible-latin-700-italic.woff2',
  './assets/fonts/fraunces-latin-opsz-normal.woff2',
  './assets/fonts/fraunces-latin-opsz-italic.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

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
        .catch(() => (isShell ? caches.match('./index.html') : caches.match(req).then((r) => r || caches.match('./index.html')))),
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
