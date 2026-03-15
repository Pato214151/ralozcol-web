# RALOZ COL SAS — Tienda Web

Tienda en línea para venta de uniformes escolares. Los usuarios seleccionan colegio, eligen productos y pagan con MercadoPago.

## Despliegue

| Servicio      | Plataforma      | URL                                |
|---------------|-----------------|------------------------------------|
| Tienda web    | Cloudflare Pages| https://ralozcol-web.pages.dev     |
| API backend   | Render          | https://raloz-web.onrender.com     |

## Estructura

```
Raloz/
├── index.html
├── css/
│   ├── base.css
│   ├── components.css
│   ├── layout.css
│   ├── pages.css
│   └── responsive.css
├── js/
│   ├── main.js              # Entry point — inicializa todos los módulos
│   ├── core/
│   │   ├── api.js           # Cliente HTTP → raloz-web.onrender.com
│   │   ├── carrito.js       # Estado del carrito (sessionStorage)
│   │   └── utils.js         # Helpers: formatCOP, toast, scroll
│   ├── data/
│   │   ├── productos.js     # Catálogo estático de productos
│   │   ├── precios.js       # Precios base por colegio
│   │   └── colegios.js      # Lista de colegios
│   └── modules/
│       ├── tienda.js        # Catálogo + filtros + carga desde API
│       ├── checkout.js      # Modal de talla + carrito + checkout
│       ├── catalogo.js      # Selector de escuela (página principal)
│       ├── cotizador.js     # Cotizador de uniformes
│       ├── lookbook.js      # Galería de uniformes
│       └── ui.js            # Menú, scroll, animaciones, FAQ
└── sw.js                    # Service Worker (caché offline)
```

## Flujo de compra

```
1. Usuario entra a la tienda
2. Selecciona colegio  →  /api/tienda/colegios
3. Ve productos        →  /api/tienda/catalogo/{id}
4. Elige talla y agrega al carrito (sessionStorage)
5. Llena datos en checkout
6. POST /api/tienda/pedido  →  recibe pago_url
7. Redirección a MercadoPago
8. Pago confirmado
```

## Modo offline / fallback estático

Si el backend no responde (Render en plan gratuito tarda hasta 90s en despertar), la tienda usa datos estáticos de `/js/data/` con precios locales y marca los productos como "No disponible en línea" hasta que la API responda.

## Correr localmente

```bash
# Abrir index.html directamente en el navegador
# O con servidor local:
python -m http.server 8080
# → http://localhost:8080
```

Para apuntar al backend local, editar `js/core/api.js`:

```js
baseURL: window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'   // ← backend local
  : 'https://raloz-web.onrender.com/api'
```

## Desplegar en Cloudflare Pages

1. Conectar repositorio `ralozcol-web` en Cloudflare Pages
2. Sin build command (HTML/CSS/JS estático)
3. Directorio raíz: `/`
4. Rama: `main`

Los cambios en `main` se despliegan automáticamente.
