// ===================================================================
// MÓDULO — Tienda online (catálogo + filtros + carga API)
// ===================================================================

import { PRODUCTOS, PRODUCTOS_POR_ESCUELA } from '../data/productos.js';
import { PRECIOS } from '../data/precios.js';
import { RalozAPI } from '../core/api.js';
import { formatCOP, scrollToSection } from '../core/utils.js';
import { Carrito } from '../core/carrito.js';
import { abrirTallaModal } from './checkout.js';

export async function initTiendaOnline() {
  Carrito.cargar();

  const loading   = document.getElementById('tiendaLoading');
  const error     = document.getElementById('tiendaError');
  const contenido = document.getElementById('tiendaContenido');

  if (!loading) return;

  // Mensaje dinámico mientras el servidor Render despierta (plan gratuito, hasta 90s)
  const loadingMsg = loading.querySelector('p');
  let msgIdx = 0;
  const mensajes = [
    '🔄 Conectando con la tienda...',
    '⏳ El servidor está despertando, puede tomar hasta 30 segundos...',
    '☕ Mientras tanto, prepara tu café...',
    '📦 Cargando catálogo de uniformes...',
    '🏫 Ya casi está listo...',
  ];
  if (loadingMsg) loadingMsg.textContent = mensajes[0];
  const intervalo = setInterval(() => {
    msgIdx = (msgIdx + 1) % mensajes.length;
    if (loadingMsg) loadingMsg.textContent = mensajes[msgIdx];
  }, 6000);

  let data = null;
  const inicio = Date.now();
  while (Date.now() - inicio < 90000) {
    try {
      const res = await fetch(`${RalozAPI.baseURL}/tienda/colegios`, {
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) { data = await res.json(); break; }
      if (res.status !== 503) break;
    } catch { /* timeout de red, reintentar */ }
    await new Promise(r => setTimeout(r, 3000));
  }

  clearInterval(intervalo);

  if (!data || !data.colegios) {
    loading.style.display = 'none';
    error.style.display   = 'flex';
    return;
  }

  renderTiendaColegios(data.colegios);
  loading.style.display   = 'none';
  contenido.style.display = 'block';

  // Keep-alive: ping cada 10 min para que Render no duerma mientras el usuario navega
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetch(`${RalozAPI.baseURL}/health`, { method: 'HEAD' }).catch(() => {});
    }
  }, 600000);

  document.getElementById('tiendaVolverColegios')?.addEventListener('click', () => {
    document.getElementById('tiendaPaso2').style.display = 'none';
    document.getElementById('tiendaPaso1').style.display = 'block';
  });
}

// ─── Helpers de datos estáticos ───────────────────────────────────

function getEscuelaStaticId(nombre) {
  const n = (nombre || '').toUpperCase();
  if (n.includes('MARILLAC'))   return 1;
  if (n.includes('ADVENTISTA')) return 2;
  if (n.includes('MANYANET'))   return 3;
  return null;
}

function buildStaticProductos(escuelaStaticId) {
  const ids = PRODUCTOS_POR_ESCUELA[escuelaStaticId] || [];
  return ids.map(id => {
    const p = PRODUCTOS[id];
    if (!p) return null;
    const preciosEscuela = (PRECIOS[escuelaStaticId] || {})[id] || {};
    const tallas = Object.entries(preciosEscuela).map(([talla, precio]) => ({
      talla, precio, stock: 999,
    }));
    return {
      id_producto: id,
      nombre: p.nombre,
      tipo: p.tipo === 'accesorio' ? 'Accesorios' : p.tipo,
      tallas,
      _static: true,
    };
  }).filter(Boolean);
}

// ─── Render del grid de colegios ─────────────────────────────────

function renderTiendaColegios(colegios) {
  const grid = document.getElementById('tiendaColegiosGrid');
  if (!grid) return;

  grid.innerHTML = colegios.map(c => `
    <button class="tienda-colegio-card" data-id="${c.id_colegio}" data-nombre="${c.nombre}">
      <div class="tc-icon-wrap"><i class="fa-solid fa-school"></i></div>
      <div class="tc-text">
        <span class="tc-nombre">${c.nombre}</span>
        ${c.ciudad ? `<span class="tc-ciudad"><i class="fa-solid fa-location-dot"></i> ${c.ciudad}</span>` : ''}
      </div>
      <i class="fa-solid fa-chevron-right tc-arrow"></i>
    </button>
  `).join('');

  grid.querySelectorAll('.tienda-colegio-card').forEach(btn => {
    btn.addEventListener('click', () => cargarCatalogoColegio(
      parseInt(btn.dataset.id),
      btn.dataset.nombre
    ));
  });
}

// ─── Carga del catálogo (estático + merge stock API) ──────────────

async function cargarCatalogoColegio(id, nombre) {
  const paso1   = document.getElementById('tiendaPaso1');
  const paso2   = document.getElementById('tiendaPaso2');
  const nombreEl = document.getElementById('tiendaColegioNombre');
  const grid    = document.getElementById('tiendaProductosGrid');
  const filtros = document.getElementById('tiendaTipoFiltros');

  paso1.style.display = 'none';
  paso2.style.display = 'block';
  nombreEl.textContent = nombre;
  grid.innerHTML = '<div class="tienda-loading-cat"><div class="tienda-spinner"></div><p>Cargando uniformes...</p></div>';
  filtros.innerHTML = '';

  Carrito.colegio_id = id;
  Carrito.colegio_nombre = nombre;
  Carrito.guardar();

  // Base estática siempre completa
  const escuelaId = getEscuelaStaticId(nombre);
  let productos = escuelaId ? buildStaticProductos(escuelaId) : [];

  // Mezclar con API: reemplazar id_producto y tallas con los valores reales de DB
  const data = await RalozAPI.getCatalogoTienda(id);
  if (data?.productos?.length) {
    data.productos.forEach(apiP => {
      const idx = productos.findIndex(p =>
        p.nombre.toLowerCase().trim() === apiP.nombre.toLowerCase().trim()
      );
      if (idx >= 0) {
        // Usar id_producto y tallas de la API — son los IDs/tallas reales en la DB
        productos[idx] = {
          ...productos[idx],
          id_producto: apiP.id_producto,
          _static: false,
          tallas: (apiP.tallas || []).map(t => ({
            talla:  t.talla,
            precio: t.precio,
            stock:  t.stock,
          })),
        };
      }
    });
  }

  if (!productos.length) {
    grid.innerHTML = '<p class="tienda-empty">No hay productos disponibles para este colegio por el momento.</p>';
    return;
  }

  // Filtros por tipo (deduplicados y ordenados)
  const tiposRaw = productos.map(p => (p.tipo || 'Otros').trim());
  const tipos = [...new Map(tiposRaw.map(t => [t.toLowerCase(), t])).values()].sort();
  filtros.innerHTML = `
    <button class="tienda-filtro active" data-tipo="todos">Todos (${productos.length})</button>
    ${tipos.map(t => {
      const count = productos.filter(p => (p.tipo || 'Otros').trim().toLowerCase() === t.toLowerCase()).length;
      return `<button class="tienda-filtro" data-tipo="${t}">${t} (${count})</button>`;
    }).join('')}
  `;

  filtros.querySelectorAll('.tienda-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.querySelectorAll('.tienda-filtro').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtrarProductos(btn.dataset.tipo, productos);
    });
  });

  renderProductos(productos);
  scrollToSection(document.getElementById('tienda-online'));
}

function filtrarProductos(tipo, productos) {
  if (tipo === 'todos') { renderProductos(productos); return; }
  const t = tipo.trim().toLowerCase();
  renderProductos(productos.filter(p => (p.tipo || 'Otros').trim().toLowerCase() === t));
}

function renderProductos(productos) {
  const grid = document.getElementById('tiendaProductosGrid');
  if (!grid) return;

  if (!productos.length) {
    grid.innerHTML = '<p class="tienda-empty">Sin productos en esta categoría.</p>';
    return;
  }

  grid.innerHTML = productos.map(p => {
    const precioMin = Math.min(...p.tallas.map(t => t.precio));
    const stockTotal = p.tallas.reduce((s, t) => s + t.stock, 0);
    const sinStock = stockTotal === 0;
    return `
      <div class="tienda-producto-card">
        <div class="tpc-imagen">
          <i class="fa-solid fa-shirt tpc-icon"></i>
          ${stockTotal > 0 && stockTotal < 5 ? '<span class="tpc-badge-poco">¡Últimas unidades!</span>' : ''}
        </div>
        <div class="tpc-info">
          <p class="tpc-nombre">${p.nombre}</p>
          ${p.tipo ? `<span class="tpc-tipo-tag">${p.tipo}</span>` : ''}
          <div class="tpc-precio-wrap">
            <span class="tpc-precio-desde">Desde</span>
            <span class="tpc-precio">${formatCOP(precioMin)}</span>
          </div>
          <span class="tpc-cuotas">Pago seguro con MercadoPago</span>
          <span class="tpc-envio"><i class="fa-solid fa-truck"></i> Envío a domicilio</span>
          ${sinStock
            ? '<span class="tpc-sin-stock">Sin stock</span>'
            : p._static
              ? '<span class="tpc-sin-stock">No disponible en línea</span>'
              : `<span class="tpc-stock-ok"><i class="fa-solid fa-check"></i> ${stockTotal} disponibles</span>`}
        </div>
        <button class="btn-agregar-carrito" data-id="${p.id_producto}" data-nombre="${p.nombre}" ${sinStock || p._static ? 'disabled' : ''}>
          <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
        </button>
      </div>
    `;
  }).join('');

  // Guardar referencia para el modal de tallas
  window._tiendaProductos = productos;

  grid.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const producto = window._tiendaProductos?.find(p => p.id_producto === id);
      if (producto) abrirTallaModal(producto);
    });
  });
}
