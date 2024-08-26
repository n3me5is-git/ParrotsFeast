const CACHE_NAME = 'parrots-feast-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icon-192x192.png',,
  // Puoi aggiungere qui altre risorse essenziali da mettere in cache all'installazione
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Risponde con la risorsa cache se disponibile
      }

      // Se non è nella cache, effettua la richiesta di rete e la mette in cache dinamicamente
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone()); // Mette in cache la risorsa
          return networkResponse;
        });
      });
    }).catch((error) => {
      console.error('Fetching failed:', error);
      throw error;
    })
  );
});