# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Public-facing static store for **RALOZ COL S.A.S** (Colombian school uniforms + watches). No build step — pure HTML/CSS/JS served directly by Cloudflare Pages. The backend is a separate Flask app at `https://raloz-web.onrender.com` (also in `../sofware raloz/raloz-web/`).

To serve locally:
```bash
python -m http.server 8080
```

## CSS versioning

All CSS `<link>` tags use a `?v=YYYYMMDD` cache-bust query string (with an optional letter suffix, e.g. `?v=20260321m`). When you modify any CSS file, update the version in **all five** `<link>` tags in `index.html` to force Cloudflare to invalidate the cache. The JS `main.js` `<script>` tag uses the same version string and must also be bumped.

## JS module architecture

`js/main.js` is the ES module entry point. Everything is imported from sub-modules; nothing is loaded via separate `<script>` tags (except the inline carousel script at the bottom of `index.html`).

```
js/
  main.js              ← entry point: imports and calls all init functions
  core/
    api.js             ← RalozAPI (fetch wrapper) + initRalozIntegration()
    carrito.js         ← Carrito singleton (cart state, localStorage, badge)
    utils.js           ← formatCOP, scrollToSection, showNotification, mostrarToast
  modules/
    ui.js              ← all UI init functions: menu, scroll, FAQ, counters, back-to-top, sticky CTA
    tienda.js          ← online store: static-first render, API sync in background, school selector, product grid
    catalogo.js        ← static catalog section (offline, from data files)
    checkout.js        ← talla modal, carrito panel, checkout form → MercadoPago
    relojes.js         ← watch catalog rendering + color selector modal
    cotizador.js       ← quote calculator (registers window.* functions)
    lookbook.js        ← gallery lightbox (registers window.* functions)
  data/
    productos.js       ← PRODUCTOS (id→metadata) + PRODUCTOS_POR_ESCUELA (school→[ids])
    precios.js         ← PRECIOS[colegio_id][producto_id][talla] = price (static fallback)
    relojes.js         ← RELOJES array (static catalog with colors/stock)
    colegios.js        ← ESCUELAS metadata (id, nombre, displayName, productosCount)
```

## Critical constraint: product name matching

Product `nombre` strings in `js/data/productos.js` must **exactly match** the names stored in the backend database (including emojis and accented characters). A mismatch silently breaks price lookups in the live store.

## Checkout flow

`abrirTallaModal(producto, opts)` → user picks talla → `Carrito.agregar()` → user opens panel → `abrirCheckout()` → form submit → `procesarCheckout()` → `RalozAPI.crearPedido()` → MercadoPago redirect.

Cart items shape: `{ id_producto, nombre, talla, cantidad, precio, tipo_pedido, stock_disponible, id_reserva? }`. The `Carrito` singleton holds a `sessionId` (UUID) used for stock reservations. Cart state persists to `localStorage`.

`tipo_pedido` values: `'normal'` (stock available), `'fabricacion'` (zero stock, made to order), `'mixto'` (partial stock). Products with `stock === 0` auto-flag as `esFabricacion: true`.

**Payment options for fabricación items:** "Abono 50%" (pays half now via MercadoPago, remainder paid at pickup/before shipping) or "Pago total". The `checkoutTotalDisplay` updates dynamically when switching options — `abrirCheckout()` initializes to the 50% amount when fabricación items are present.

## API integration

`RalozAPI.baseURL` auto-selects `localhost:5000` vs `raloz-web.onrender.com` based on `window.location.hostname`. All methods return `null` on failure (never throw from the store UI perspective).

Public endpoints used by the store:
- `GET /tienda/colegios` — list of schools
- `GET /tienda/catalogo/:id` — products + real stock for a school
- `POST /tienda/reservar` — reserve stock for cart session
- `POST /tienda/pedido` — create order → returns MercadoPago init_point

## Offline / API fallback pattern

`tienda.js` renders the static school list immediately (`COLEGIOS_ESTATICOS`), then calls `_sincronizarColegiosAPI()` in the background. When the API responds with colegio names in UPPERCASE (e.g. "MARILLAC"), `tienda.js` normalizes them using `COLEGIOS_ESTATICOS` before rendering. A keep-alive ping fires every 10 minutes so Render (free tier, ~90s cold start) stays warm. If unreachable, prices and stock fall back to `js/data/precios.js` and products are marked "No disponible en línea".

## Service Worker

`sw.js` uses two caches: `raloz-static-v5` (pre-caches only `/`, `/index.html`, `/logo.svg`, `/favicon.ico`) and `raloz-api-v1` (API responses, network-first). CSS/JS are **not** pre-cached — they are cached on first fetch via their versioned URLs. On activate, the SW sends `SW_UPDATED` to all open tabs, triggering `window.location.reload()` in `main.js` so users always get the latest assets. **Bump `CACHE_STATIC` version in `sw.js` only when making breaking changes.**

## Inline functions vs modules

`cotizador.js` and `lookbook.js` register functions on `window.*` because `index.html` uses inline `onclick=` attributes. Functions like `selectSchool()`, `clearSchool()`, `filtrarPorTipo()`, `galeriaAbrir()`, `galeriaCerrar()`, `galeriaNav()`, and `window.abrirTiendaColegio()` (in `tienda.js`) are all defined this way — do not refactor them to unexported module functions without updating every `onclick` in the HTML.

## Lookbook gallery

`galeriaImagenes` in `lookbook.js` is the source of truth for the lightbox. The `onclick="galeriaAbrir(N)"` indices in `index.html` must match the array order exactly. When adding or removing photos, update both files together.

## Watches catalog

Watches are entirely static (`js/data/relojes.js` → `js/modules/relojes.js`). There is no backend endpoint for watches. Stock and prices must be updated manually in the data file.

## CSS split

| File | Responsibility |
|---|---|
| `base.css` | CSS variables, reset, typography |
| `layout.css` | Navbar, hero, footer, announcement bar, whatsapp float, back-to-top, sticky CTA |
| `components.css` | Cards, buttons, badges, modals, carrito panel, stat numbers |
| `pages.css` | Section-specific styles (hero brand name, stats, lookbook, catalog, checkout abono selector, FAQ, etc.) |
| `responsive.css` | All `@media` breakpoints |
