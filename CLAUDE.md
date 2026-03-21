# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Public-facing static store for **RALOZ COL S.A.S** (Colombian school uniforms + watches). No build step — pure HTML/CSS/JS served directly by Cloudflare Pages. The backend is a separate Flask app at `https://raloz-web.onrender.com` (also in `../sofware raloz/raloz-web/`).

To serve locally:
```bash
python -m http.server 8080
```

## CSS versioning

All CSS `<link>` tags use a `?v=YYYYMMDD` cache-bust query string. When you modify any CSS file, update the version in **all five** `<link>` tags in `index.html` to force Cloudflare to invalidate the cache.

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
    ui.js              ← all UI init functions: menu, scroll, FAQ, counters, back-to-top
    tienda.js          ← online store: API load with 90s retry loop, school selector, product grid
    catalogo.js        ← static catalog section (offline, from data files)
    checkout.js        ← talla modal, carrito panel, checkout form → MercadoPago
    relojes.js         ← watch catalog rendering + color selector modal
    cotizador.js       ← quote calculator (registers window.* functions)
    lookbook.js        ← gallery lightbox (registers window.* functions)
  data/
    productos.js       ← PRODUCTOS (id→metadata) + PRODUCTOS_POR_ESCUELA (school→[ids])
    precios.js         ← PRECIOS[colegio_id][producto_id][talla] = price (279 prices)
    relojes.js         ← RELOJES array (static catalog with colors/stock)
    colegios.js        ← school metadata
```

## Critical constraint: product name matching

Product `nombre` strings in `js/data/productos.js` must **exactly match** the names stored in the backend database (including emojis and accented characters). A mismatch silently breaks price lookups in the live store.

## Offline / API fallback pattern

`tienda.js` polls `/api/tienda/colegios` up to 90 seconds (Render free-tier cold start). If it fails, the store falls back to static data from `js/data/` and marks products "No disponible en línea". `api.js` auto-selects `localhost:5000` vs `raloz-web.onrender.com` based on `window.location.hostname`.

The Service Worker (`sw.js`) caches static assets with `raloz-static-v2` and API responses with `raloz-api-v1`. Update these cache names when making breaking changes to either.

## Inline functions vs modules

`cotizador.js` and `lookbook.js` register functions on `window.*` because `index.html` uses inline `onclick=` attributes to call them. Functions like `selectSchool()`, `clearSchool()`, `filtrarPorTipo()`, `galeriaAbrir()`, `galeriaCerrar()`, `galeriaNav()` are all defined this way — do not refactor them to unexported module functions without updating every `onclick` in the HTML.

## Watches catalog

Watches are entirely static (`js/data/relojes.js` → `js/modules/relojes.js`). There is no backend endpoint for watches. Stock and prices must be updated manually in the data file.

## CSS split

| File | Responsibility |
|---|---|
| `base.css` | CSS variables, reset, typography |
| `layout.css` | Navbar, hero, footer, announcement bar, whatsapp float, back-to-top |
| `components.css` | Cards, buttons, badges, modals, carrito panel |
| `pages.css` | Section-specific styles (stats, categories, lookbook, catalog, FAQ, etc.) |
| `responsive.css` | All `@media` breakpoints |
