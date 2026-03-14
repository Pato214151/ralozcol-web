// ===================================================================
// RALOZ COL S.A.S — Service Worker v1.0
// Caché offline para estáticos + respaldo de API (colegios/productos)
// ===================================================================

const CACHE_STATIC = 'raloz-static-v1';
const CACHE_API    = 'raloz-api-v1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/pages.css',
  '/css/responsive.css',
  '/js/main.js',
  '/logo.svg',
  '/favicon.ico',
];

// ─── Install: pre-caché de archivos estáticos ─────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: limpiar cachés antiguas ───────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_API)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch ───────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Peticiones a la API: network-first con fallback a caché
  if (url.hostname.includes('raloz-web.onrender.com')) {
    e.respondWith(networkFirstAPI(e.request));
    return;
  }

  // Archivos estáticos: cache-first
  e.respondWith(cacheFirstStatic(e.request));
});

// ─── Estrategia: network-first para la API ───────────────────────
async function networkFirstAPI(req) {
  const cache = await caches.open(CACHE_API);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) {
      // Inyectar flag para que el frontend sepa que viene de caché
      const data = await cached.json().catch(() => null);
      if (data) {
        return new Response(JSON.stringify({ ...data, _fromCache: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Sin conexión' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Estrategia: cache-first para estáticos ──────────────────────
async function cacheFirstStatic(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    if (req.mode === 'navigate') {
      return caches.match('/index.html');
    }
    return new Response('', { status: 503 });
  }
}
