const STATIC_CACHE_NAME = 'family-tree-cache-v1';
const DATA_CACHE_NAME = 'family-tree-data-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/utils/crypto.ts',
  '/components/TreeNode.tsx',
  '/components/PersonCard.tsx',
  '/components/AddPersonModal.tsx',
  '/components/DetailsModal.tsx',
  '/components/ShareModal.tsx',
  '/components/PasswordPromptModal.tsx',
  '/components/StatisticsModal.tsx',
  '/components/BirthdayNotifier.tsx',
  '/components/GoogleSearchPanel.tsx',
  '/components/ImportModal.tsx',
  '/components/ExportModal.tsx',
  '/components/charts/DoughnutChart.tsx',
  '/components/charts/BarChart.tsx',
  '/components/charts/GenerationChart.tsx',
  '/components/charts/BirthRateChart.tsx',
  '/components/charts/NameList.tsx',
  '/components/charts/AdditionalStats.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://aistudiocdn.com/react@^19.1.1',
  'https://aistudiocdn.com/react-dom@^19.1.1/',
  'https://i.postimg.cc/fyGRn3Dd/geni.png',
  'https://i.postimg.cc/DZBW1Cbf/Geni-cover.png',
  'https://avatar.iran.liara.run/public/boy?username=Founder',
  'https://identity.netlify.com/v1/netlify-identity-widget.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const requests = urlsToCache.map(url => {
            if (url.startsWith('http')) {
                return new Request(url, { mode: 'no-cors' });
            }
            return url;
        });
        return cache.addAll(requests);
      })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle API calls
  if (url.pathname.startsWith('/.netlify/functions/')) {
    // For non-GET requests (like POST), always go to the network. Do not cache.
    if (event.request.method !== 'GET') {
      event.respondWith(fetch(event.request));
      return;
    }

    // For GET requests, use a network-first strategy.
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // If successful, clone the response and update the cache.
          const responseToCache = networkResponse.clone();
          caches.open(DATA_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // If the network fails, try to serve the response from the cache.
          console.log('[SW] Network failed, trying cache for:', event.request.url);
          return caches.match(event.request).then(response => {
            return response || Promise.reject('no-match');
          });
        })
    );
    return;
  }
  
  // Handle static assets with a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
            (response) => {
                // Check if we received a valid response for static assets
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    if (response && response.type === 'opaque') {
                       // Opaque responses are for third-party resources, cache them.
                    } else {
                       return response;
                    }
                }

                const responseToCache = response.clone();
                caches.open(STATIC_CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                return response;
            }
        ).catch(error => {
            console.log('Fetch failed; returning offline page instead.', error);
            // Optional: return an offline fallback page for static assets.
        });
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [STATIC_CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});