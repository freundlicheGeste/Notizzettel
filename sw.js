const CACHE_NAME = 'notizzettel-v1.0.3'; // Ändere die Nummer bei JEDEM Update!
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// Install Event
self.addEventListener('install', e => {
  self.skipWaiting(); // Erzwingt Aktivierung des neuen Service Workers
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets');
      return cache.addAll(assets);
    })
  );
});

// Activate Event - löscht alte Caches automatisch
self.addEventListener('activate', e => {
  self.clients.claim(); // Übernimmt sofort die Kontrolle
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Event - Schnell & Aktualisierend
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      const networkFetch = fetch(e.request).then(networkResponse => {
        // Hintergrund-Update des Caches
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkResponse.clone());
        });
        return networkResponse;
      });
      // Gib Cache zurück, falls vorhanden, sonst warte aufs Netzwerk
      return cachedResponse || networkFetch;
    }).catch(() => {
        // Fallback falls beides fehlschlägt (z.B. Offline & nicht im Cache)
    })
  );
});
