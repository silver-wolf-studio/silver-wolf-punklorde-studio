const SHELL_CACHE = 'silver-wolf-shell-v2';
const RUNTIME_CACHE = 'silver-wolf-runtime-v2';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/silver-wolf-reference.jpg',
];

async function saveResponse(cacheName, request, response) {
  if (response && response.ok) {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith('silver-wolf-') && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET'
    || url.origin !== self.location.origin
    || url.pathname.startsWith('/api/')
  ) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => saveResponse(SHELL_CACHE, '/', response))
        .catch(async () => (await caches.match(event.request)) || caches.match('/')),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => saveResponse(RUNTIME_CACHE, event.request, response))
        .catch(() => undefined);
      return cached || network;
    }),
  );
});
