// Cache de l'application pour qu'elle s'ouvre sans internet.
// Changer VERSION quand la liste SHELL change (et VERSION dans app.js).
const VERSION = 'alif-v5';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'data/letters.js',
  'data/stories.js',
  'data/chars.js',
  'data/images.js',
  'data/words.js',
  'motus.js',
  'ordre.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const save = (res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return res;
  };
  if (url.origin === location.origin) {
    // Réseau d'abord (dernière version), sinon la copie en cache (hors ligne).
    e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then(save).catch(() => caches.match(e.request, { ignoreSearch: true })));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    // Polices : mises en cache au premier chargement.
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then(save)));
  }
});
