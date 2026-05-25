// Jeju Family Adventure PWA — v5 (cache bypass for HTML)
const CACHE = 'jeju-trip-v5';
const BASE = 'https://ghimmy.github.io/Korea-Trip/';
const STATIC = [
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(STATIC); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  var isHTML = url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('/Korea-Trip');

  // Network-first for HTML so updates show immediately. Fall back to cache only if offline.
  if (isHTML) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(function() { return caches.match(BASE + 'index.html'); })
    );
    return;
  }

  // Cache-first for static assets (icons, manifest)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      }).catch(function() { return cached; });
    })
  );
});
