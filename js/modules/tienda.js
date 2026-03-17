// ===================================================================
// MÓDULO — Tienda online (catálogo + filtros + carga API)
// ===================================================================

import { PRODUCTOS, PRODUCTOS_POR_ESCUELA } from '../data/productos.js';
import { PRECIOS } from '../data/precios.js';
import { RalozAPI } from '../core/api.js';
import { formatCOP, scrollToSection } from '../core/utils.js';
import { Carrito } from '../core/carrito.js';
import { abrirTallaModal } from './checkout.js';

// ─── Estado del módulo ────────────────────────────────────────────
let _colegioId     = null;
let _colegioNombre = null;
let _productos     = [];   // lista completa mergeada (todas las tallas con stock real)
let _filtroActivo  = 'todos';
let _refreshTimer  = null;

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
    _detenerRefresh();
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

// ─── Normalización de nombres (para merge) ────────────────────────

const normNombre = s => s.toLowerCase().trim()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─── Merge: superpone datos de API sobre base estática ────────────

function mergeConAPI(base, apiProductos) {
  const resultado = base.map(p => ({ ...p }));
  (apiProductos || []).forEach(apiP => {
    const idx = resultado.findIndex(p =>
      normNombre(p.nombre) === normNombre(apiP.nombre)
    );
    if (idx >= 0) {
      resultado[idx] = {
        ...resultado[idx],
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
  return resultado;
}

// ─── Refresh de stock (silencioso) ────────────────────────────────

function _detenerRefresh() {
  if (_refreshTimer) { clearInterval(_refreshTimer); _refreshTimer = null; }
}

async function _refreshStock() {
  if (!_colegioId) return;

  const data = await RalozAPI.getCatalogoTienda(_colegioId);
  if (!data?.productos?.length) return;

  const escuelaId = getEscuelaStaticId(_colegioNombre);
  const base      = escuelaId ? buildStaticProductos(escuelaId) : [];
  _productos      = mergeConAPI(base, data.productos);

  window._tiendaProductos = _productos;
  filtrarProductos(_filtroActivo, _productos);

  // Indicador: muestra la hora de la última actualización
  const ind = document.getElementById('stockRefreshInd');
  if (ind) {
    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    ind.textContent = `Actualizado ${hora}`;
    ind.style.opacity = '1';
    setTimeout(() => { if (ind) ind.style.opacity = '0'; }, 4000);
  }
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
  const paso1    = document.getElementById('tiendaPaso1');
  const paso2    = document.getElementById('tiendaPaso2');
  const nombreEl = document.getElementById('tiendaColegioNombre');
  const grid     = document.getElementById('tiendaProductosGrid');
  const filtros  = document.getElementById('tiendaTipoFiltros');

  paso1.style.display = 'none';
  paso2.style.display = 'block';
  nombreEl.textContent = nombre;
  grid.innerHTML = '<div class="tienda-loading-cat"><div class="tienda-spinner"></div><p>Cargando uniformes...</p></div>';
  filtros.innerHTML = '';

  Carrito.colegio_id = id;
  Carrito.colegio_nombre = nombre;
  Carrito.guardar();

  // Guardar estado del módulo
  _colegioId     = id;
  _colegioNombre = nombre;
  _filtroActivo  = 'todos';
  _detenerRefresh();

  // Base estática + merge con API
  const escuelaId = getEscuelaStaticId(nombre);
  const base      = escuelaId ? buildStaticProductos(escuelaId) : [];
  const data      = await RalozAPI.getCatalogoTienda(id);
  _productos      = mergeConAPI(base, data?.productos);

  if (!_productos.length) {
    grid.innerHTML = '<p class="tienda-empty">No hay productos disponibles para este colegio por el momento.</p>';
    return;
  }

  // Filtros por tipo (deduplicados y ordenados)
  const tiposRaw = _productos.map(p => (p.tipo || 'Otros').trim());
  const tipos = [...new Map(tiposRaw.map(t => [t.toLowerCase(), t])).values()].sort();
  const horaInicio = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  filtros.innerHTML = `
    <button class="tienda-filtro active" data-tipo="todos">Todos (${_productos.length})</button>
    ${tipos.map(t => {
      const count = _productos.filter(p => (p.tipo || 'Otros').trim().toLowerCase() === t.toLowerCase()).length;
      return `<button class="tienda-filtro" data-tipo="${t}">${t} (${count})</button>`;
    }).join('')}
    <span id="stockRefreshInd" style="font-size:0.72rem;color:#4caf50;margin-left:auto;opacity:0;transition:opacity 0.6s;align-self:center;white-space:nowrap;">
      <i class="fa-solid fa-circle-check"></i> Actualizado ${horaInicio}
    </span>
  `;

  filtros.querySelectorAll('.tienda-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.querySelectorAll('.tienda-filtro').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _filtroActivo = btn.dataset.tipo;
      filtrarProductos(_filtroActivo, _productos);
    });
  });

  window._tiendaProductos = _productos;
  renderProductos(_productos);
  scrollToSection(document.getElementById('tienda-online'));

  // Auto-refresh de stock cada 60 segundos (solo si la pestaña está activa)
  _refreshTimer = setInterval(() => {
    if (document.getElementById('tiendaPaso2')?.style.display !== 'none'
        && document.visibilityState === 'visible') {
      _refreshStock();
    }
  }, 60000);
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
    const precioMin  = Math.min(...p.tallas.map(t => t.precio));
    const stockTotal = p.tallas.reduce((s, t) => s + t.stock, 0);
    const sinStock   = stockTotal === 0;
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

  // window._tiendaProductos apunta siempre a la lista completa (_productos)
  // para que el click handler encuentre el producto aunque la vista esté filtrada
  window._tiendaProductos = _productos;

  grid.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);

      // Actualizar stock desde la API justo antes de abrir el modal
      await _refreshStock();

      const producto = window._tiendaProductos?.find(p => p.id_producto === id);
      if (producto && !producto._static) abrirTallaModal(producto);
    });
  });
}
