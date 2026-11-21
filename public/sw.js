// ========================================================
// Service Worker LaporKampus (PWA Manual)
// ========================================================

const CACHE_NAME = 'laporkampus-v1';
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
];

// 1. Install Event: Precache App Shell dan Halaman Offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Bersihkan Cache Versi Lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan sentuh atau cache request mutasi atau API upload/auth
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/upload')
  ) {
    return;
  }

  // A. Navigasi Halaman HTML (mode: 'navigate') -> Network-First dengan Fallback ke /offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Simpan salinan halaman berhasil ke cache
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          // Jika offline atau jaringan putus, ambil dari cache atau arahkan ke /offline
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match('/offline');
          return offlinePage || new Response('Anda sedang luring (offline)', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        })
    );
    return;
  }

  // B. Aset Statis (JS, CSS, Gambar, Font) -> Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    /\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|css|js)$/i.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: coba network, fallback ke cache jika ada
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
