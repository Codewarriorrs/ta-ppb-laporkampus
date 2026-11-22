// ========================================================
// Service Worker LaporKampus (PWA Offline-First Engine v3)
// ========================================================

const CACHE_NAME = 'laporkampus-v3';
const PRECACHE_ASSETS = [
  '/',
  '/fasilitas',
  '/lapor',
  '/laporan-saya',
  '/profil',
  '/birokrasi',
  '/login',
  '/register',
  '/offline',
  '/manifest.webmanifest',
  '/favicon.ico',
];

// 1. Install Event: Precache seluruh app shell & halaman utama
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of PRECACHE_ASSETS) {
        try {
          await cache.add(new Request(asset, { cache: 'reload' }));
        } catch (err) {
          console.warn('[SW] Precache skipped for:', asset, err);
        }
      }
    })
  );
});

// 2. Activate Event: Bersihkan cache lama & langsung klaim semua clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Abaikan selain GET atau request auth
  if (request.method !== 'GET' || url.pathname.startsWith('/api/auth')) {
    return;
  }

  // A. NAVIGASI HALAMAN (HTML): Network-first dengan fallback instan ke cache
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Timeout cepat 2 detik agar tidak hang/freeze saat jaringan terputus
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 2000);

          const networkResponse = await fetch(request, { signal: controller.signal });
          clearTimeout(timer);

          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        } catch (err) {
          // OFFLINE: Ambil dari cache
          // Cek request exact, url.pathname, atau ignoreSearch
          const cached =
            (await caches.match(request)) ||
            (await caches.match(url.pathname)) ||
            (await caches.match(request, { ignoreSearch: true })) ||
            (await caches.match('/')) ||
            (await caches.match('/offline'));

          if (cached) return cached;

          return new Response(
            '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>LaporKampus Offline</title></head><body style="font-family:sans-serif;padding:30px;text-align:center;"><h2>Anda sedang offline</h2><p>LaporKampus tetap dapat digunakan untuk mencatat laporan fasilitas. Laporan akan otomatis tersimpan di perangkat Anda.</p><a href="/lapor" style="display:inline-block;padding:10px 20px;background:#6d5ae6;color:#fff;border-radius:12px;text-decoration:none;margin-top:10px;">Buka Form Lapor Offline</a></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })()
    );
    return;
  }

  // B. NEXT.JS ASSETS & STATIC FILES (_next/static, chunks, fonts, images, css)
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    /\.(js|css|png|jpg|jpeg|svg|webp|woff|woff2|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request, { ignoreSearch: true }).then((cached) => {
        if (cached) {
          // Update di background jika ada koneksi
          fetch(request)
            .then((res) => {
              if (res && res.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(request, res));
              }
            })
            .catch(() => {});
          return cached;
        }

        return fetch(request)
          .then((networkRes) => {
            if (networkRes && networkRes.status === 200) {
              const copy = networkRes.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return networkRes;
          })
          .catch(() => {
            return new Response('', { status: 408 });
          });
      })
    );
    return;
  }

  // C. DATA GET API (/api/reports, /api/facilities) -> Stale While Revalidate
  if (url.pathname.startsWith('/api/reports') || url.pathname.startsWith('/api/facilities')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedRes = await cache.match(request);

        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cachedRes);

        return cachedRes || networkPromise;
      })
    );
    return;
  }

  // Default fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request, { ignoreSearch: true }))
  );
});
