// Jeju Family Adventure PWA — v1
const CACHE = 'jeju-trip-v1';
const STATIC = [
  '/travel-app/manifest.json',
  '/travel-app/icon-192.png',
  '/travel-app/icon-512.png',
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
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = new URL(e.request.url);
  if (url.pathname === '/travel-app/' || url.pathname === '/travel-app/index.html') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(function() { return caches.match('/travel-app/index.html'); })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        var clone = res.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        return res;
      });
    })
  );
});
