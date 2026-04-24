const CACHE_NAME = 'ww-cache-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './app.js',
  './components/components.js',
  './store.js',
  './utils.js',
  './manifest.json',
  './styles.css'
];

// 1. Install & Pre-cache Core Assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// 2. Activate & Clean Up Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// 3. Fetch & Dynamically Cache External Assets (Offline-First)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // Do not intercept POST (Google Sheets Sync)
  if (event.request.url.includes('script.google.com')) return; // Ignore Apps Script URLs
  
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached; // Serve from cache immediately
      
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return response;
      });
    })
  );
});
