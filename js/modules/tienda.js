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

// Colegios estáticos — se muestran de inmediato sin esperar la API
const COLEGIOS_ESTATICOS = [
  { id_colegio: 1, nombre: 'Colegio Marillac',            ciudad: 'Bogotá' },
  { id_colegio: 2, nombre: 'Colegio Adventista del Norte', ciudad: 'Bogotá' },
  { id_colegio: 3, nombre: 'Colegio Manyanet',             ciudad: 'Bogotá' },
];

export async function initTiendaOnline() {
  Carrito.cargar();

  const loading   = document.getElementById('tiendaLoading');
  const contenido = document.getElementById('tiendaContenido');
  if (!loading) return;

  // ① Mostrar catálogo estático DE INMEDIATO — sin esperar la API
  renderTiendaColegios(COLEGIOS_ESTATICOS);
  loading.style.display   = 'none';
  contenido.style.display = 'block';

  document.getElementById('tiendaVolverColegios')?.addEventListener('click', () => {
    _detenerRefresh();
    document.getElementById('tiendaPaso2').style.display = 'none';
    document.getElementById('tiendaPaso1').style.display = 'block';
  });

  // ② Intentar conectar con la API en segundo plano (Render tarda hasta 90s)
  _sincronizarColegiosAPI();

  // Keep-alive: ping cada 10 min para que Render no vuelva a dormir
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetch(`${RalozAPI.baseURL}/health`, { method: 'HEAD' }).catch(() => {});
    }
  }, 600000);
}

// Función global para que los botones de la sección Colegios abran directamente
// la tienda con el colegio seleccionado (reemplaza el antiguo selectSchool del catálogo estático)
window.abrirTiendaColegio = function(clave) {
  const mapa = {
    MARILLAC:   { id: 1, nombre: 'Colegio Marillac' },
    ADVENTISTA: { id: 2, nombre: 'Colegio Adventista del Norte' },
    MANYANET:   { id: 3, nombre: 'Colegio Manyanet' },
  };
  const c = mapa[clave];
  if (!c) return;

  document.getElementById('tienda-online')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Dar tiempo al scroll antes de cargar el catálogo
  setTimeout(() => cargarCatalogoColegio(c.id, c.nombre), 350);
};

async function _sincronizarColegiosAPI() {
  const ind = document.getElementById('tiendaApiInd');
  if (ind) { ind.className = 'tienda-api-ind conectando'; ind.textContent = '⏳ Sincronizando precios en línea...'; }

  try {
    const res = await fetch(`${RalozAPI.baseURL}/tienda/colegios`, {
      signal: AbortSignal.timeout(90000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.colegios?.length) {
        // Si el usuario aún está en el paso 1, actualizamos la lista de colegios
        if (document.getElementById('tiendaPaso1')?.style.display !== 'none') {
          renderTiendaColegios(data.colegios);
        }
        if (ind) { ind.className = 'tienda-api-ind online'; ind.textContent = '✓ Tienda en línea — precios en tiempo real'; }
        setTimeout(() => { if (ind) ind.style.opacity = '0'; }, 4000);
        return;
      }
    }
  } catch { /* falla silenciosa — la tienda estática ya está visible */ }

  if (ind) { ind.className = 'tienda-api-ind offline'; ind.textContent = '📦 Precios desde catálogo local'; }
  setTimeout(() => { if (ind) ind.style.opacity = '0'; }, 5000);
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
      icon: p.icon,
      tallas,
      _static: true,
    };
  }).filter(Boolean);
}

// Mapea p.tipo a clase CSS y a icono FontAwesome
function tipoToStyle(tipo) {
  const t = (tipo || '').toLowerCase().trim();
  if (t.includes('completo'))          return { cls: 'tpc-tipo-completo',  icon: 'fa-solid fa-box-open' };
  if (t.includes('niño') && !t.includes('físi')) return { cls: 'tpc-tipo-nino',      icon: 'fa-solid fa-person' };
  if (t.includes('niña') && !t.includes('físi')) return { cls: 'tpc-tipo-nina',      icon: 'fa-solid fa-person-dress' };
  if (t.includes('física') || t.includes('fisica')) return { cls: 'tpc-tipo-edu',   icon: 'fa-solid fa-person-running' };
  if (t.includes('diario'))            return { cls: 'tpc-tipo-diario',    icon: 'fa-solid fa-vest' };
  if (t.includes('media') || t.includes('calcet')) return { cls: 'tpc-tipo-medias', icon: 'fa-solid fa-socks' };
  if (t.includes('accesorio') || t.includes('delantal')) return { cls: 'tpc-tipo-accesorio', icon: 'fa-solid fa-star' };
  return { cls: 'tpc-tipo-default', icon: 'fa-solid fa-shirt' };
}

// ─── Normalización de nombres (para merge) ────────────────────────

const normNombre = s => s.toLowerCase().trim()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// ─── Merge: la API manda, estáticos solo como fallback ────────────
// Arranca desde los productos de la API (stock real) y agrega los
// estáticos que la API no devolvió (p.ej. colegios sin datos aún).

function mergeConAPI(base, apiProductos) {
  if (!apiProductos?.length) return base.map(p => ({ ...p }));

  // Todos los productos de la API con _static: false
  const resultado = apiProductos.map(p => ({ ...p, _static: false }));

  // Solo agregar estáticos que NO existen en la API
  base.forEach(baseP => {
    const yaEsta = resultado.some(p =>
      normNombre(p.nombre) === normNombre(baseP.nombre)
    );
    if (!yaEsta) resultado.push({ ...baseP });
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

  grid.innerHTML = colegios.map(c => {
    const count = (PRODUCTOS_POR_ESCUELA[c.id_colegio] || []).length;
    return `
    <button class="tienda-colegio-card" data-id="${c.id_colegio}" data-nombre="${c.nombre}">
      <div class="tc-icon-wrap"><i class="fa-solid fa-school-flag"></i></div>
      <div class="tc-text">
        <span class="tc-nombre">${c.nombre}</span>
        <span class="tc-meta">
          ${c.ciudad ? `<span class="tc-ciudad"><i class="fa-solid fa-location-dot"></i> ${c.ciudad}</span>` : ''}
          ${count ? `<span class="tc-count"><i class="fa-solid fa-shirt"></i> ${count} prendas</span>` : ''}
        </span>
      </div>
      <i class="fa-solid fa-chevron-right tc-arrow"></i>
    </button>
  `}).join('');

  grid.querySelectorAll('.tienda-colegio-card').forEach(btn => {
    btn.addEventListener('click', () => cargarCatalogoColegio(
      parseInt(btn.dataset.id),
      btn.dataset.nombre
    ));
  });
}

// ─── Helper: construye y monta los filtros por tipo ───────────────

function _renderFiltros(filtros, productos) {
  const tiposRaw = productos.map(p => (p.tipo || 'Otros').trim());
  const tipos = [...new Map(tiposRaw.map(t => [t.toLowerCase(), t])).values()].sort();
  filtros.innerHTML = `
    <button class="tienda-filtro active" data-tipo="todos">Todos (${productos.length})</button>
    ${tipos.map(t => {
      const count = productos.filter(p => (p.tipo || 'Otros').trim().toLowerCase() === t.toLowerCase()).length;
      return `<button class="tienda-filtro" data-tipo="${t}">${t} (${count})</button>`;
    }).join('')}
    <span id="stockRefreshInd" style="font-size:0.72rem;color:#4caf50;margin-left:auto;opacity:0;transition:opacity 0.6s;align-self:center;white-space:nowrap;">
      <i class="fa-solid fa-circle-check"></i>
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
}

// ─── Sincronización silenciosa con la API ─────────────────────────

async function _sincronizarCatalogoAPI(id, base) {
  try {
    const data = await RalozAPI.getCatalogoTienda(id);
    if (!data?.productos?.length) return;

    _productos = mergeConAPI(base, data.productos);
    window._tiendaProductos = _productos;

    const filtros = document.getElementById('tiendaTipoFiltros');
    if (filtros) {
      _renderFiltros(filtros, _productos);
      const activeBtn = filtros.querySelector(`[data-tipo="${_filtroActivo}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
    filtrarProductos(_filtroActivo, _productos);

    const ind = document.getElementById('stockRefreshInd');
    if (ind) {
      const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      ind.textContent = `✓ Precios en tiempo real · ${hora}`;
      ind.style.opacity = '1';
      setTimeout(() => { if (ind) ind.style.opacity = '0'; }, 5000);
    }
  } catch { /* falla silenciosa — el catálogo estático ya está visible */ }
}

// ─── Carga del catálogo (estático inmediato + merge API en background) ─

async function cargarCatalogoColegio(id, nombre) {
  const paso1    = document.getElementById('tiendaPaso1');
  const paso2    = document.getElementById('tiendaPaso2');
  const nombreEl = document.getElementById('tiendaColegioNombre');
  const filtros  = document.getElementById('tiendaTipoFiltros');
  const grid     = document.getElementById('tiendaProductosGrid');

  paso1.style.display = 'none';
  paso2.style.display = 'block';
  nombreEl.textContent = nombre;

  Carrito.colegio_id = id;
  Carrito.colegio_nombre = nombre;
  Carrito.guardar();

  _colegioId     = id;
  _colegioNombre = nombre;
  _filtroActivo  = 'todos';
  _detenerRefresh();

  // ① Render estático INMEDIATO — sin esperar la API
  const escuelaId = getEscuelaStaticId(nombre);
  const base      = escuelaId ? buildStaticProductos(escuelaId) : [];
  _productos      = base;

  if (!_productos.length) {
    grid.innerHTML = '<p class="tienda-empty">No hay productos disponibles para este colegio por el momento.</p>';
    filtros.innerHTML = '';
    return;
  }

  _renderFiltros(filtros, base);
  renderProductos(base);
  scrollToSection(document.getElementById('tienda-online'));

  // ② API en segundo plano — actualiza stock y precios reales sin spinner
  _sincronizarCatalogoAPI(id, base);

  // Auto-refresh de stock cada 60 segundos
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
    // Ignorar precios 0 para el mínimo (tallas sin precio configurado)
    const preciosValidos = p.tallas.map(t => t.precio).filter(pr => pr > 0);
    const precioMin      = preciosValidos.length > 0 ? Math.min(...preciosValidos) : null;
    const stockTotal     = p.tallas.reduce((s, t) => s + (t.stock || 0), 0);
    const esFab          = p.fabricacion === true;
    const esAnticipo     = esFab || p._static;

    const { cls: tipoCls, icon: tipoIcon } = tipoToStyle(p.tipo);
    const iconFinal = p.icon || tipoIcon;

    let badgeStock = '';
    if (esFab) {
      badgeStock = '<span class="tpc-fab-badge"><i class="fa-solid fa-scissors"></i> Pedido por fabricación</span>';
    } else if (p._static) {
      badgeStock = '<span class="tpc-fab-badge">🪡 Disponible por pedido</span>';
    } else if (stockTotal === 0) {
      badgeStock = '<span class="tpc-fab-badge">🪡 Pedir con anticipación</span>';
    } else if (stockTotal < 5) {
      badgeStock = `<span class="tpc-stock-poco"><i class="fa-solid fa-triangle-exclamation"></i> ¡Últimas ${stockTotal} unidades!</span>`;
    } else {
      badgeStock = `<span class="tpc-stock-ok"><i class="fa-solid fa-check"></i> ${stockTotal} disponibles</span>`;
    }

    const btnClass = esAnticipo ? 'btn-agregar-carrito btn-fab' : 'btn-agregar-carrito';
    const btnLabel = esAnticipo
      ? '<i class="fa-solid fa-scissors"></i> Pedir con anticipación'
      : '<i class="fa-solid fa-cart-plus"></i> Agregar al carrito';

    const tallasTexto = p.tallas.length > 0
      ? `Tallas: ${[...new Set(p.tallas.map(t => t.talla))].join(', ')}`
      : '';

    return `
      <div class="tienda-producto-card${esAnticipo ? ' tpc-fabricacion' : ''}">
        <div class="tpc-imagen ${tipoCls}">
          <i class="${iconFinal} tpc-icon"></i>
          ${!esAnticipo && stockTotal > 0 && stockTotal < 5 ? '<span class="tpc-badge-poco">¡Últimas unidades!</span>' : ''}
          ${esAnticipo ? '<span class="tpc-badge-fab">🪡</span>' : ''}
        </div>
        <div class="tpc-info">
          <p class="tpc-nombre">${p.nombre}</p>
          ${p.tipo ? `<span class="tpc-tipo-tag">${p.tipo}</span>` : ''}
          <div class="tpc-precio-wrap">
            ${precioMin !== null
              ? `<span class="tpc-precio-desde">Desde</span>
                 <span class="tpc-precio">${formatCOP(precioMin)}</span>`
              : `<span class="tpc-precio-desde">Precio a consultar</span>`
            }
          </div>
          ${tallasTexto ? `<span class="tpc-tallas-hint">${tallasTexto}</span>` : ''}
          ${esAnticipo ? '<span class="tpc-fab-tiempo"><i class="fa-solid fa-clock"></i> Entrega 1-2 meses · 50% abono</span>' : ''}
          ${badgeStock}
        </div>
        <button class="${btnClass}" data-id="${p.id_producto}" data-nombre="${p.nombre}"
          data-fab="${esFab}" data-anticipo="${esAnticipo}">
          ${btnLabel}
        </button>
      </div>
    `;
  }).join('');

  window._tiendaProductos = _productos;

  grid.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id        = parseInt(btn.dataset.id);
      const esAnticipo = btn.dataset.anticipo === 'true';
      const esFab     = btn.dataset.fab === 'true';

      // Solo refrescar stock si el producto tiene/puede tener stock
      if (!esAnticipo) await _refreshStock();

      const producto = window._tiendaProductos?.find(p => p.id_producto === id);
      if (!producto) return;

      // Abrir modal: fabricacion pura si el producto es fab o estático
      abrirTallaModal(producto, { esFabricacion: esFab || producto._static });
    });
  });
}
