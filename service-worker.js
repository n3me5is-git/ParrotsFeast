const CACHE_NAME = 'parrots-feast-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/icon-192x192.png',
    '/apple-touch-icon.png',
    '/arrow-down.svg',
    '/arrow-left.svg',
    '/arrow-right.svg',
    '/arrow-up.svg',
    '/background-level1.png',
    '/background-level2.png',
    '/background-level3.png',
    '/background-level4.png',
    '/background-level5.png',
    '/background-music-endgame.mp3',
    '/background-music1.mp3',
    '/background-music2.mp3',
    '/background-music3.mp3',
    '/background-music4.mp3',
    '/background-music5.mp3',
    '/biscuit1.png',
    '/biscuit2.png',
    '/biscuit3.png',
    '/bolt.svg',
    '/boxing_bell.wav',
    '/button_last.png',
    '/button_top.png',
    '/clock_tick.wav',
    '/compress.svg',
    '/eat_biscuit.wav',
    '/eat_fruit.mp3',
    '/eat_seed.wav',
    '/end_game_background.png',
    '/end_last_level_background.png',
    '/end_level_background.png',
    '/expand.svg',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/favicon.ico',
    '/fruit1.png',
    '/fruit2.png',
    '/fruit3.png',
    '/gong.wav',
    '/icon.png',
    '/parrot.png',
    '/rocket-disabled.svg',
    '/rocket.svg',
    '/scores_background.png',
    '/seed1.png',
    '/seed2.png',
    '/seed3.png',
    '/start_background.png',
    '/weight-hanging.svg'
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