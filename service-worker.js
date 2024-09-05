var CACHE_VERSION = 4;
var CURRENT_CACHES = {
    prefetch: 'parrots-feast-cache-v' + CACHE_VERSION,
    ondemand: 'parrots-feast-cache-ondemand-v' + CACHE_VERSION
};
const urlsToPrefetch = [
    'index.html',
    'styles.css',
    'script.js',
    'manifest.json',
    'icon-192x192.png',
    'apple-touch-icon.png',
    'arrow-down.svg',
    'arrow-left.svg',
    'arrow-right.svg',
    'arrow-up.svg',
    'background-music-endgame.mp3',
    'biscuit1.png',
    'biscuit2.png',
    'biscuit3.png',
    'bolt.svg',
    'boxing_bell.wav',
    'button_last.png',
    'button_top.png',
    'clock_tick.wav',
    'compress.svg',
    'eat_biscuit.wav',
    'eat_fruit.mp3',
    'eat_seed.wav',
    'end_game_background.png',
    'end_last_level_background.png',
    'end_level_background.png',
    'expand.svg',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon.ico',
    'fruit1.png',
    'fruit2.png',
    'fruit3.png',
    'gong.wav',
    'icon.png',
    'parrot.png',
    'parrot_flipped.png',
    'rocket-disabled.svg',
    'rocket.svg',
    'scores_background.png',
    'seed1.png',
    'seed2.png',
    'seed3.png',
    'start_background.png',
    'weight-hanging.svg',
    'background-level-arabia.png',
    'background-level-armageddon.png',
    'background-level-cityrio.png',
    'background-level-crystalworld.png',
    'background-level-house80.png',
    'background-level-japanfantasy.png',
    'background-level-jungle.png',
    'background-level-pirates.png',
    'background-level-savana.png',
    'background-level-space.png',
    'background-level-jurassic.png',
    'background-level-artic.png',
    'background-level-superhero.png',
    'background-music-arabia.mp3',
    'background-music-armageddon.mp3',
    'background-music-cityrio.mp3',
    'background-music-crystalworld.mp3',
    'background-music-house80.mp3',
    'background-music-japanfantasy.mp3',
    'background-music-jungle.mp3',
    'background-music-pirates.mp3',
    'background-music-savana.mp3',
    'background-music-space.mp3',
    'background-music-jurassic.mp3',
    'background-music-artic.mp3',
    'background-music-superhero.mp3'
];

self.addEventListener('install', function(event) {
  var now = Date.now();
  console.log('Handling install event. Resources to prefetch:', urlsToPrefetch);
  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
      var cachePromises = urlsToPrefetch.map(function(urlToPrefetch) {
        var url = new URL(urlToPrefetch, location.href);
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
        var request = new Request(url, {mode: 'no-cors'});
        return fetch(request).then(function(response) {
          if (response.status >= 400) {
            throw new Error('Request for ' + urlToPrefetch + ' failed with status ' + response.statusText);
          } else if (response.status === 206) {
            // Se la risposta è parziale, effettua una nuova richiesta per ottenere il file completo
            var fullRequest = new Request(url, { headers: { 'Range': 'bytes=0-' } });
            return fetch(fullRequest).then(function(fullResponse) {
              if (fullResponse.status === 200) {
                return cache.put(urlToPrefetch, fullResponse);
              } else {
                throw new Error('Failed to fetch the complete file for ' + urlToPrefetch);
              }
            });
          } else {
            return cache.put(urlToPrefetch, response);
          }
        }).catch(function(error) {
          console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
        });
      });
      return Promise.all(cachePromises).then(function() {
        console.log('Pre-fetching complete.');
      });
    }).catch(function(error) {
      console.error('Pre-fetching failed:', error);
    })
  );
});

self.addEventListener('activate', function(event) {
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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
          if (networkResponse && networkResponse.status !== 206) { // Esclude le risposte parziali
            return putcache(event.request, networkResponse).then(() => {
                return networkResponse;
            });
          } else {
            return networkResponse; // Restituisce comunque la risposta parziale all'utente
          }
      });
    }).catch((error) => {
      console.error('Fetching failed:', error);
      throw error;
    })
  );
});

  
function putcache(request, response) {
    if (response.type === "error" || response.type === "opaque" || request.url.startsWith('chrome-extension')) {
        return Promise.resolve(); // non mettere in cache errori di rete o richieste da estensioni Chrome
    }
    return caches
        .open(CURRENT_CACHES.ondemand)
        .then((cache) => cache.put(request, response.clone()));
}


