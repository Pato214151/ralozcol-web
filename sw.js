// ===================================================================
// RALOZ COL S.A.S — Service Worker v2.1
// Caché offline para estáticos + respaldo de API (colegios/productos)
// En localhost: pasa todo directo a la red, sin cachear.
// ===================================================================

const CACHE_STATIC = 'raloz-static-v7';
const CACHE_API    = 'raloz-api-v1';
const IS_LOCAL     = self.location.hostname === 'localhost' ||
                     self.location.hostname === '127.0.0.1';

const STATIC_FILES = [
  '/',
  '/index.html',
  '/logo.svg',
  '/favicon.ico',
];

// ─── Install ─────────────────────────────────────────────────────
self.addEventListener('install', e => {
  if (IS_LOCAL) { self.skipWaiting(); return; }
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: limpiar cachés antiguas + notificar tabs ──────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_STATIC && k !== CACHE_API)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })))
  );
});

// ─── Fetch ───────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  // En localhost: todo va directo a la red, sin interceptar
  if (IS_LOCAL) return;

  const url = new URL(e.request.url);

  // API: network-first con fallback a caché
  if (url.hostname.includes('raloz-web.onrender.com')) {
    e.respondWith(networkFirstAPI(e.request));
    return;
  }

  // HTML: siempre desde la red (no-store evita caché HTTP del browser)
  if (e.request.mode === 'navigate') {
    e.respondWith(networkFirstHTML(e.request));
    return;
  }

  // CSS/JS/imágenes versionadas: cache-first (URL nueva = cache miss = red)
  e.respondWith(cacheFirstStatic(e.request));
});

// ─── network-first HTML ──────────────────────────────────────────
async function networkFirstHTML(req) {
  const cache = await caches.open(CACHE_STATIC);
  try {
    const res = await fetch(new Request(req, { cache: 'no-store' }));
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    return cached || caches.match('/index.html') || new Response('Sin conexión', { status: 503 });
  }
}

// ─── network-first API ───────────────────────────────────────────
async function networkFirstAPI(req) {
  const cache = await caches.open(CACHE_API);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) {
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

// ─── cache-first estáticos ───────────────────────────────────────
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
    return new Response('', { status: 503 });
  }
}
