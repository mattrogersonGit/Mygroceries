const CACHE = 'trolley-v2';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Never intercept Supabase calls - always want fresh data straight from the network.
  if (e.request.url.includes('supabase.co')) return;

  // Network-first for the app shell itself, so code changes show up on next reload
  // instead of being masked by a stale cache. Falls back to cache when offline.
  const isAppShell = e.request.mode === 'navigate' || e.request.url.endsWith('index.html');
  if (isAppShell) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(e.request)),
    );
    return;
  }

  // Cache-first for static assets (manifest, icons) that rarely change.
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request)),
  );
});
