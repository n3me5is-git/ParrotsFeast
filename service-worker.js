var CACHE_VERSION = 1;
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
    'background-level1.png',
    'background-level2.png',
    'background-level3.png',
    'background-level4.png',
    'background-level5.png',
    'background-level6.png',
    'background-level7.png',
    'background-level8.png',
    'background-level9.png',
    'background-music-endgame.mp3',
    'background-music1.mp3',
    'background-music2.mp3',
    'background-music3.mp3',
    'background-music4.mp3',
    'background-music5.mp3',
    'background-music6.mp3',
    'background-music7.mp3',
    'background-music8.mp3',
    'background-music9.mp3',
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
    'weight-hanging.svg'
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
            throw new Error('request for ' + urlToPrefetch +
              ' failed with status ' + response.statusText);
          }
          return cache.put(urlToPrefetch, response);
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
          if (networkResponse) {
            return putcache(event.request, networkResponse).then(() => {
                return networkResponse;
            });
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


