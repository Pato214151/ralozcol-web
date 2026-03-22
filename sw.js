// ===================================================================
// RALOZ COL S.A.S — Service Worker v2.0
// Caché offline para estáticos + respaldo de API (colegios/productos)
// ===================================================================

const CACHE_STATIC = 'raloz-static-v5';
const CACHE_API    = 'raloz-api-v1';

// Solo los archivos mínimos para modo offline.
// CSS/JS NO se pre-cachean aquí porque usan ?v= versioning:
// se cachean automáticamente en el primer fetch con su URL versionada.
const STATIC_FILES = [
  '/',
  '/index.html',
  '/logo.svg',
  '/favicon.ico',
];

// ─── Install: pre-caché mínimo ────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: limpiar cachés antiguas + notificar tabs ──────────
// Cuando se activa una nueva versión del SW, se avisa a todos los
// tabs abiertos para que recarguen y obtengan el CSS/JS nuevo.
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
  const url = new URL(e.request.url);

  // Peticiones a la API: network-first con fallback a caché
  if (url.hostname.includes('raloz-web.onrender.com')) {
    e.respondWith(networkFirstAPI(e.request));
    return;
  }

  // HTML de navegación: network-first (siempre HTML fresco)
  if (e.request.mode === 'navigate') {
    e.respondWith(networkFirstHTML(e.request));
    return;
  }

  // CSS/JS/imágenes: cache-first
  // Para CSS/JS versionados (?v=...) cada versión tiene URL única,
  // por lo que un cambio de versión siempre genera un cache miss → red.
  e.respondWith(cacheFirstStatic(e.request));
});

// ─── Estrategia: network-first para HTML ─────────────────────────
async function networkFirstHTML(req) {
  const cache = await caches.open(CACHE_STATIC);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    return cached || caches.match('/index.html') || new Response('Sin conexión', { status: 503 });
  }
}

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
    return new Response('', { status: 503 });
  }
}
