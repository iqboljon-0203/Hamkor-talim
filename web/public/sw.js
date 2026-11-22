// Service Worker for Hamkor Ta'lim PWA
// HTML sahifalar har doim tarmoqdan olinadi (network-first), shunda yangi deploy'dan
// keyin eski HTML eski (o'chirilgan) JS chunk'larni so'rab, sayt buzilmaydi.
const CACHE_VERSION = 'v20261122';
const STATIC_CACHE = `hamkor-static-${CACHE_VERSION}`;
const PAGE_CACHE = `hamkor-pages-${CACHE_VERSION}`;
const OFFLINE_URLS = ['/', '/login'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== STATIC_CACHE && name !== PAGE_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isNavigation(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Faqat o'z domenimiz; Supabase va boshqa tashqi so'rovlarga aralashmaymiz
  if (url.origin !== self.location.origin) return;

  // Next.js RSC so'rovlari, API va sw.js — keshlanmaydi
  if (
    url.searchParams.has('_rsc') ||
    request.headers.get('RSC') === '1' ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/sw.js'
  ) {
    return;
  }

  // Hash'li statik fayllar o'zgarmaydi — cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // HTML sahifalar — network-first, internet bo'lmasa keshdan
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(url.pathname, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(url.pathname)
            .then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Rasmlar, ikonkalar, manifest — network-first, offline'da keshdan
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
