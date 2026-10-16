const CACHE = 'stjornufraedi-v1.2.0';
const BASE = new URL('./', self.location.href);
const FILES = ['./', './index.html', './styles.css', './app.js', './data.js', './imagery.js', './planet-details.js', './assets/starfield.svg', './assets/planets/mercury.jpg', './assets/planets/venus.jpg', './assets/planets/earth.jpg', './assets/planets/mars.jpg', './assets/planets/jupiter.jpg', './assets/planets/saturn.jpg', './assets/planets/uranus.jpg', './assets/planets/neptune.jpg', './icon.svg', './manifest.webmanifest'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(f => new URL(f, BASE).href))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('stjornufraedi-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== BASE.origin || !new URL(event.request.url).pathname.startsWith(BASE.pathname)) return;
  event.respondWith(fetch(event.request).then(response => response).catch(async () => {
    const cache = await caches.open(CACHE);
    const match = await cache.match(event.request, { ignoreSearch: true });
    if (match) return match;
    if (event.request.mode === 'navigate') return cache.match(new URL('./index.html', BASE).href);
    return new Response('Skrá er ekki tiltæk án nets.', { status: 503, headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
  }));
});
