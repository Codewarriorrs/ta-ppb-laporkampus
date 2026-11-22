// ========================================================
// Service Worker LaporKampus (PWA Offline-First Engine v2)
// ========================================================

const CACHE_NAME = 'laporkampus-v2';
const PRECACHE_ASSETS = [
  '/',
  '/fasilitas',
  '/lapor',
  '/laporan-saya',
  '/profil',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
];

// 1. Install Event: Precache seluruh core app shell agar offline tidak blink
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Gunakan per-asset catching agar jika ada 1 aset belum siap tidak membatalkan yang lain
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('[SW] Gagal precache aset:', asset, err);
        }
      }
    })
  );
});

// 2. Activate Event: Bersihkan cache versi usang & langsung klaim client
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

  // Abaikan request bukan GET atau auth
  if (request.method !== 'GET' || url.pathname.startsWith('/api/auth')) {
    return;
  }

  // A. NAVIGASI HALAMAN (HTML): Cepat, anti-blink dengan Cache-Fallback instan
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Buat fetch dengan timeout 2 detik agar di jaringan lambat/offline tidak ngeblink lama
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const networkResponse = await fetch(request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        } catch (error) {
          // Offline / timeout: langsung ambil dari cache halaman yang bersangkutan
          const cached = await caches.match(request);
          if (cached) return cached;

          // Coba cache root atau offline
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          const offlineFallback = await caches.match('/offline');
          return (
            offlineFallback ||
            new Response('Halaman offline tersedia di perangkat.', {
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          );
        }
      })()
    );
    return;
  }

  // B. API DATA GET (/api/reports, /api/facilities) -> Stale-While-Revalidate agar list tetap tampil offline
  if (url.pathname.startsWith('/api/reports') || url.pathname.startsWith('/api/facilities')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);

        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // C. Aset Statis (JS, CSS, Font, Gambar): Stale-While-Revalidate
  const isStatic =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    /\.(png|jpg|jpeg|svg|webp|woff|woff2|css|js)$/i.test(url.pathname);

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Revalidate di background jika online
          fetch(request)
            .then((res) => {
              if (res && res.status === 200) {
                caches.open(CACHE_NAME).then((c) => c.put(request, res));
              }
            })
            .catch(() => {});
          return cached;
        }
        return fetch(request).then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Default
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
