/**
 * RALOZ COL S.A.S — JavaScript Principal v5.0
 * Sistema completo de catálogo, cotizador y gestión de uniformes escolares
 * Incluye datos de 279 precios reales para 3 colegios y 18 productos
 * Última actualización: 2026-03-03
 */

// ===================================================================
// CATÁLOGO DE DATOS — Base estática con integración API
// ===================================================================

const ESCUELAS = {
  MARILLAC: { id: 1, nombre: 'MARILLAC', displayName: 'Colegio Marillac', productosCount: 15 },
  ADVENTISTA: { id: 2, nombre: 'ADVENTISTA', displayName: 'Colegio Adventista', productosCount: 13 },
  MANYANET: { id: 3, nombre: 'MANYANET', displayName: 'Colegio Manyanet', productosCount: 13 }
};

const PRODUCTOS = {
  1: { id: 1, codigo: 'PD-NINO', nombre: 'Pantalón Diario Niño', tipo: 'Diario Niño', icon: 'fa-solid fa-person' },
  2: { id: 2, codigo: 'CC-NINO', nombre: 'Camisa Cuello Niño', tipo: 'Diario Niño', icon: 'fa-solid fa-shirt' },
  3: { id: 3, codigo: 'BLAZER', nombre: 'Blazer', tipo: 'Diario', icon: 'fa-solid fa-vest' },
  4: { id: 4, codigo: 'CHALECO', nombre: 'Chaleco', tipo: 'Diario', icon: 'fa-solid fa-vest-patches' },
  5: { id: 5, codigo: 'CHQ-DIARIO', nombre: 'Chaqueta Diario', tipo: 'Diario', icon: 'fa-solid fa-jacket' },
  6: { id: 6, codigo: 'JARDINERA', nombre: 'Jardinera Niña', tipo: 'Diario Niña', icon: 'fa-solid fa-person-dress' },
  7: { id: 7, codigo: 'BLUSA', nombre: 'Blusa Niña', tipo: 'Diario Niña', icon: 'fa-solid fa-shirt' },
  8: { id: 8, codigo: 'PANT-EDU', nombre: 'Pantalón Ed. Física', tipo: 'Ed. Física', icon: 'fa-solid fa-person-running' },
  9: { id: 9, codigo: 'CAMISETA', nombre: 'Camiseta Ed. Física', tipo: 'Ed. Física', icon: 'fa-solid fa-shirt' },
  10: { id: 10, codigo: 'CHQ-EDU', nombre: 'Chaqueta Ed. Física', tipo: 'Ed. Física', icon: 'fa-solid fa-person-running' },
  11: { id: 11, codigo: 'PANTALONETA', nombre: 'Pantaloneta', tipo: 'Ed. Física', icon: 'fa-solid fa-person-running' },
  12: { id: 12, codigo: 'MEDIAS', nombre: 'Medias Ed. Física', tipo: 'Medias', icon: 'fa-solid fa-socks' },
  13: { id: 13, codigo: 'UNI-DIARIO-NINO', nombre: 'Uniforme Diario Niño COMPLETO', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  14: { id: 14, codigo: 'UNI-DIARIO-NINA', nombre: 'Uniforme Diario Niña COMPLETO', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  15: { id: 15, codigo: 'UNI-EDU', nombre: 'Uniforme Ed. Física COMPLETO', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  16: { id: 16, codigo: 'UNI-DIARIO-NINO-M', nombre: 'Uniforme Diario Niño COMPLETO (Manyanet)', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  17: { id: 17, codigo: 'UNI-DIARIO-NINA-M', nombre: 'Uniforme Diario Niña COMPLETO (Manyanet)', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  18: { id: 18, codigo: 'DELANTAL', nombre: 'Delantal', tipo: 'accesorio', icon: 'fa-solid fa-star' }
};

// Mapeo de productos disponibles por escuela
const PRODUCTOS_POR_ESCUELA = {
  1: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18],
  2: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15],
  3: [1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17]
};

// TABLA MAESTRA DE PRECIOS: escuela → producto → talla → precio
// 279 precios reales del sistema RALOZ
const PRECIOS = {
  1: { // MARILLAC
    1: { '6-8': 56000, '10-12': 60000, '14-16': 63300, 'S-M': 69800, 'L': 75200, 'XL': 80000 },
    2: { '6-8': 40000, '10-12': 45000, '14-16': 50000, 'S-M': 55000, 'L': 60000, 'XL': 63000 },
    3: { '6-8': 140000, '10-12': 148000, '14-16': 155000, 'S-M': 160000, 'L': 175000, 'XL': 185000 },
    4: { '6-8': 56000, '10-12': 59000, '14-16': 63000, 'S-M': 67000, 'L': 73000, 'XL': 75000 },
    6: { '6-8': 75000, '10-12': 80000, '14-16': 86000, 'S-M': 95000, 'L': 102000, 'XL': 108000 },
    7: { '6-8': 48000, '10-12': 52000, '14-16': 56000, 'S-M': 60000, 'L': 64000, 'XL': 68000 },
    8: { '6-8': 62700, '10-12': 69900, '14-16': 73900, 'S-M': 84800, 'L': 86400, 'XL': 87900 },
    9: { '6-8': 40000, '10-12': 43000, '14-16': 45000, 'S-M': 49000, 'L': 53000, 'XL': 57000 },
    10: { '6-8': 76300, '10-12': 80600, '14-16': 89300, 'S-M': 91400, 'L': 95800, 'XL': 102200 },
    11: { '6-8': 40000, '10-12': 42000, '14-16': 44000, 'S-M': 45000, 'L': 47000, 'XL': 53000 },
    12: { '4-6': 15000, '6-8': 15000, '8-10': 15000, '10-12': 15000, '12-14': 15000 },
    13: { '6': 292000, '8': 292000, '10': 312000, '12': 312000, '14': 331300, '16': 331300, 'S': 351800, 'M': 351800, 'L': 383200, 'XL': 403000 },
    14: { '6': 319000, '8': 319000, '10': 339000, '12': 339000, '14': 360000, '16': 360000, 'S': 382000, 'M': 382000, 'L': 414000, 'XL': 436000 },
    15: { '6': 219000, '8': 219000, '10': 235500, '12': 235500, '14': 252200, '16': 252200, 'S': 270200, 'M': 270200, 'L': 282200, 'XL': 300100 },
    18: { '6': 35000, '8': 35000, '10': 35000, '12': 35000, '14': 35000, '16': 45000 }
  },
  2: { // ADVENTISTA
    1: { '6-8': 51000, '10-12': 55000, '14-16': 58300, 'S-M': 64800, 'L': 70200, 'XL': 75000 },
    2: { '6-8': 50000, '10-12': 54500, '14-16': 56000, 'S-M': 60000, 'L': 66000, 'XL': 70000 },
    3: { '6-8': 134500, '10-12': 143000, '14-16': 150000, 'S-M': 167000, 'L': 177000, 'XL': 190000 },
    4: { '6-8': 51000, '10-12': 54000, '14-16': 58000, 'S-M': 62000, 'L': 68000, 'XL': 70000 },
    6: { '6-8': 80000, '10-12': 86000, '14-16': 92000, 'S-M': 98500, 'L': 100000, 'XL': 110000 },
    7: { '6-8': 46000, '10-12': 55000, '14-16': 60000, 'S-M': 65000, 'L': 70000, 'XL': 76000 },
    8: { '6-8': 57700, '10-12': 64900, '14-16': 68900, 'S-M': 79800, 'L': 81400, 'XL': 82900 },
    9: { '6-8': 35000, '10-12': 38000, '14-16': 40000, 'S-M': 44000, 'L': 48000, 'XL': 52000 },
    10: { '6-8': 71300, '10-12': 75600, '14-16': 84300, 'S-M': 86400, 'L': 90800, 'XL': 97200 },
    12: { '4-6': 15000, '6-8': 15000, '8-10': 15000, '10-12': 16000, '12-14': 16000 },
    13: { '6': 286500, '8': 286500, '10': 306500, '12': 306500, '14': 322300, '16': 322300, 'S': 353800, 'M': 353800, 'L': 381200, 'XL': 405000 },
    14: { '6': 311500, '8': 311500, '10': 338000, '12': 338000, '14': 360000, '16': 360000, 'S': 408500, 'M': 408500, 'L': 430500, 'XL': 456000 },
    15: { '6': 164000, '8': 164000, '10': 178500, '12': 178500, '14': 193200, '16': 193200, 'S': 210200, 'M': 210200, 'L': 220200, 'XL': 232100 }
  },
  3: { // MANYANET
    1: { '6-8': 62000, '10-12': 69000, '14-16': 73000, 'S-M': 79000, 'L': 85000, 'XL': 86000 },
    2: { '6-8': 42100, '10-12': 46400, '14-16': 49700, 'S-M': 58300, 'L': 67000, 'XL': 69000 },
    5: { '6-8': 90000, '10-12': 102100, '14-16': 109200, 'S-M': 115100, 'L': 119100, 'XL': 135000 },
    6: { '6-8': 80000, '10-12': 90000, '14-16': 95000, 'S-M': 104000, 'L': 112000, 'XL': 120000 },
    7: { '6-8': 45800, '10-12': 54000, '14-16': 57000, 'S-M': 64000, 'L': 66000, 'XL': 68000 },
    8: { '6-8': 59200, '10-12': 63700, '14-16': 68700, 'S-M': 78800, 'L': 80000, 'XL': 85000 },
    9: { '6-8': 40000, '10-12': 43000, '14-16': 45000, 'S-M': 53000, 'L': 57000, 'XL': 60000 },
    10: { '6-8': 86000, '10-12': 91000, '14-16': 99300, 'S-M': 104000, 'L': 110000, 'XL': 120000 },
    11: { '6-8': 35000, '10-12': 37000, '14-16': 39000, 'S-M': 40000, 'L': 44000, 'XL': 48000 },
    12: { '4-6': 16000, '6-8': 16000, '8-10': 16000, '10-12': 16000, '12-14': 16000 },
    15: { '6': 220200, '8': 220200, '10': 234700, '12': 234700, '14': 252000, '16': 252000, 'S': 275800, 'M': 275800, 'L': 291000, 'XL': 313000 },
    16: { '6': 194100, '8': 194100, '10': 217500, '12': 217500, '14': 231900, '16': 231900, 'S': 252400, 'M': 252400, 'L': 271100, 'XL': 290000 },
    17: { '6': 215800, '8': 215800, '10': 246100, '12': 246100, '14': 261200, '16': 261200, 'S': 283100, 'M': 283100, 'L': 297100, 'XL': 323000 }
  }
};

// ===================================================================
// MÓDULO DE INTEGRACIÓN CON API RALOZ — Endpoints Públicos
// ===================================================================
const RalozAPI = {
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://raloz-web.onrender.com/api',
  isOnline: false,

  async ping() {
    try {
      const res = await fetch(`${this.baseURL}/health`, {
        signal: AbortSignal.timeout(4000),
      });
      this.isOnline = res.ok;
    } catch {
      this.isOnline = false;
    }
    return this.isOnline;
  },

  async get(endpoint) {
    try {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch { return null; }
  },

  async post(endpoint, body) {
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  // Tienda online
  async getColegiosTienda()  { return this.get('/tienda/colegios'); },
  async getCatalogoTienda(id){ return this.get(`/tienda/catalogo/${id}`); },
  async crearPedido(data)    { return this.post('/tienda/pedido', data); },
  async consultarPedido(ref) { return this.get(`/tienda/pedido/${encodeURIComponent(ref)}`); },

  // Compatibilidad con el resto del sitio
  async getColegios()        { return this.getColegiosTienda(); },
  async getCatalogo(id)      { return this.getCatalogoTienda(id); },
  async enviarPedido(data)   { return this.crearPedido(data); },
};

// ===================================================================
// COTIZADOR — Estado global y funciones
// ===================================================================
let cotizadorItems = [];
let itemCounter = 0;
let escuelaSeleccionadaCotizador = null;

/**
 * Formatea número como precio en COP
 */
function formatCOP(value) {
  return '$' + Math.round(value).toLocaleString('es-CO');
}

/**
 * Obtiene el precio mínimo de un producto en una escuela
 */
function obtenerPrecioMinimo(escuelaId, productoId) {
  if (!PRECIOS[escuelaId] || !PRECIOS[escuelaId][productoId]) {
    return 0;
  }
  const preciosPorTalla = PRECIOS[escuelaId][productoId];
  return Math.min(...Object.values(preciosPorTalla));
}

/**
 * Obtiene tallas disponibles para un producto en una escuela
 */
function obtenerTallas(escuelaId, productoId) {
  if (!PRECIOS[escuelaId] || !PRECIOS[escuelaId][productoId]) {
    return [];
  }
  return Object.keys(PRECIOS[escuelaId][productoId]);
}

/**
 * Obtiene el precio de una talla específica
 */
function obtenerPrecio(escuelaId, productoId, talla) {
  if (!PRECIOS[escuelaId] || !PRECIOS[escuelaId][productoId]) {
    return 0;
  }
  return PRECIOS[escuelaId][productoId][talla] || 0;
}

/**
 * Abre el cotizador con un producto preseleccionado
 */
window.addToCotizador = function(productoId, escuelaId) {
  const producto = PRODUCTOS[productoId];
  if (!producto) return;

  escuelaSeleccionadaCotizador = escuelaId;

  // Scroll al cotizador
  const cotizador = document.getElementById('cotizador');
  if (cotizador) {
    scrollToSection(cotizador);
  }

  // Pre-seleccionar producto en el formulario
  setTimeout(() => {
    agregarProductoAlCotizador(productoId, escuelaId);
  }, 400);
};

/**
 * Agrega un producto al cotizador
 */
function agregarProductoAlCotizador(productoId, escuelaId) {
  const producto = PRODUCTOS[productoId];
  const tallas = obtenerTallas(escuelaId, productoId);

  if (tallas.length === 0) {
    showNotification('⚠️ Este producto no está disponible en esta escuela', 'error');
    return;
  }

  itemCounter++;
  const id = `item-${itemCounter}`;
  const item = {
    id,
    productoId,
    escuelaId,
    nombre: producto.nombre,
    tipo: producto.tipo,
    talla: tallas[0],
    cantidad: 1,
    precio: obtenerPrecio(escuelaId, productoId, tallas[0])
  };

  cotizadorItems.push(item);
  renderCotizadorItems();
}

/**
 * Renderiza los items del cotizador
 */
function renderCotizadorItems() {
  const container = document.getElementById('cotizador-items');
  const totalDiv = document.getElementById('cotizadorTotal');
  const totalAmt = document.getElementById('totalAmount');

  if (!container) return;

  if (cotizadorItems.length === 0) {
    container.innerHTML = `
      <div class="cot-item-empty">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Agrega prendas a tu cotización desde el catálogo o selecciona desde los botones de abajo.</p>
      </div>`;
    if (totalDiv) totalDiv.style.display = 'none';
    return;
  }

  let total = 0;
  container.innerHTML = cotizadorItems.map(item => {
    const tallas = obtenerTallas(item.escuelaId, item.productoId);
    const tallaOptions = tallas.map(t =>
      `<option value="${t}" ${t === item.talla ? 'selected' : ''}>${t} - ${formatCOP(obtenerPrecio(item.escuelaId, item.productoId, t))}</option>`
    ).join('');

    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    return `
    <div class="cot-item" id="${item.id}">
      <span class="cot-item-name">${item.nombre}</span>
      <select class="cot-item-talla" onchange="updateItemTalla('${item.id}', this.value)"
        style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:0.2rem 0.4rem;color:#e8edf5;font-size:0.78rem;">
        ${tallaOptions}
      </select>
      <div class="cot-item-qty">
        <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)">−</button>
        <span class="qty-val">${item.cantidad}</span>
        <button class="qty-btn" onclick="updateItemQty('${item.id}', +1)">+</button>
      </div>
      <span style="color:var(--yellow);font-size:0.85rem;font-weight:700;min-width:80px;text-align:right;">${formatCOP(subtotal)}</span>
      <button class="cot-item-remove" onclick="removeItem('${item.id}')" title="Eliminar">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>`;
  }).join('');

  if (totalDiv && totalAmt) {
    totalDiv.style.display = 'flex';
    totalAmt.textContent = formatCOP(total);
  }

  updateCotBadge();
}

/**
 * Actualiza la talla de un item
 */
window.updateItemTalla = function(id, talla) {
  const item = cotizadorItems.find(i => i.id === id);
  if (item) {
    item.talla = talla;
    item.precio = obtenerPrecio(item.escuelaId, item.productoId, talla);
    renderCotizadorItems();
  }
};

/**
 * Actualiza la cantidad de un item
 */
window.updateItemQty = function(id, delta) {
  const item = cotizadorItems.find(i => i.id === id);
  if (item) {
    item.cantidad = Math.max(1, item.cantidad + delta);
    renderCotizadorItems();
  }
};

/**
 * Elimina un item del cotizador
 */
window.removeItem = function(id) {
  cotizadorItems = cotizadorItems.filter(i => i.id !== id);
  renderCotizadorItems();
  updateCotBadge();
};

/**
 * Limpia el cotizador
 */
/**
 * Agregar item al cotizador desde el formulario (compatibilidad)
 */
window.addItemForm = function() {
  if (!escuelaSeleccionadaCotizador) {
    showNotification('⚠️ Por favor selecciona un colegio primero', 'error');
    return;
  }
  const productosEscuela = PRODUCTOS_POR_ESCUELA[escuelaSeleccionadaCotizador] || [];
  if (productosEscuela.length > 0) {
    agregarProductoAlCotizador(productosEscuela[0], escuelaSeleccionadaCotizador);
    showNotification('✅ Prenda agregada al cotizador', 'success');
  }
};

// ===================================================================
// COTIZADOR V2 — Flujo tipo catálogo
// ===================================================================
let cotEscuelaSeleccionada = null;
let cotTipoFiltro = null;

/**
 * Selecciona una escuela en el cotizador
 */
window.cotSelectSchool = function(nombreEscuela) {
  const escuela = ESCUELAS[nombreEscuela];
  if (!escuela) return;

  cotEscuelaSeleccionada = escuela;
  escuelaSeleccionadaCotizador = escuela.id;
  cotTipoFiltro = null;

  const selector = document.getElementById('cotSelectorEscuelas');
  const productos = document.getElementById('cotProductosSection');
  const tag = document.getElementById('cotEscuelaTag');

  if (selector) selector.style.display = 'none';
  if (productos) productos.style.display = 'block';
  if (tag) tag.textContent = escuela.displayName;

  cotRenderProductos();

  setTimeout(() => {
    scrollToSection(productos);
  }, 100);
};

/**
 * Vuelve al selector de escuela del cotizador
 */
window.cotClearSchool = function() {
  cotEscuelaSeleccionada = null;
  cotTipoFiltro = null;

  const selector = document.getElementById('cotSelectorEscuelas');
  const productos = document.getElementById('cotProductosSection');

  if (selector) selector.style.display = 'block';
  if (productos) productos.style.display = 'none';
};

/**
 * Filtra productos en el cotizador
 */
window.cotFiltrar = function(tipo) {
  cotTipoFiltro = tipo;

  const btns = document.querySelectorAll('#cotTipoFilters .tipo-btn');
  btns.forEach(btn => btn.classList.remove('active'));
  if (!tipo) {
    btns[0]?.classList.add('active');
  } else {
    btns.forEach(btn => {
      if (btn.textContent.trim().includes(tipo)) btn.classList.add('active');
    });
  }

  cotRenderProductos();
};

/**
 * Renderiza los productos en el grid del cotizador
 */
function cotRenderProductos() {
  if (!cotEscuelaSeleccionada) return;

  const grid = document.getElementById('cotProductosGrid');
  if (!grid) return;

  let productos = obtenerProductosEscuela(cotEscuelaSeleccionada.id);

  if (cotTipoFiltro) {
    productos = productos.filter(p => p.tipo === cotTipoFiltro);
  }

  grid.innerHTML = '';

  productos.forEach(producto => {
    const precioMinimo = obtenerPrecioMinimo(cotEscuelaSeleccionada.id, producto.id);
    const tallas = obtenerTallas(cotEscuelaSeleccionada.id, producto.id);

    const card = document.createElement('div');
    card.className = 'producto-card producto-card-cot';

    const tallaOptions = tallas.map(t =>
      `<option value="${t}">${t} - ${formatCOP(obtenerPrecio(cotEscuelaSeleccionada.id, producto.id, t))}</option>`
    ).join('');

    card.innerHTML = `
      <div class="producto-icon">
        <i class="${producto.icon}"></i>
      </div>
      <div class="producto-info">
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <span class="producto-tipo">${producto.tipo}</span>
      </div>
      <div class="producto-precio">
        <span class="precio-desde">Desde ${formatCOP(precioMinimo)}</span>
      </div>
      <div class="producto-talla-select">
        <select id="cot-talla-${producto.id}" class="cot-talla-dropdown">
          ${tallaOptions}
        </select>
      </div>
      <button class="btn btn-agregar-cot" onclick="cotAgregarProducto(${producto.id})">
        <i class="fa-solid fa-plus"></i> Agregar
      </button>
    `;
    grid.appendChild(card);
  });
}

/**
 * Agrega un producto desde el grid del cotizador
 */
window.cotAgregarProducto = function(productoId) {
  if (!cotEscuelaSeleccionada) return;

  const tallaSelect = document.getElementById(`cot-talla-${productoId}`);
  const talla = tallaSelect?.value;

  if (!talla) {
    agregarProductoAlCotizador(productoId, cotEscuelaSeleccionada.id);
  } else {
    const producto = PRODUCTOS[productoId];
    const precio = obtenerPrecio(cotEscuelaSeleccionada.id, productoId, talla);

    itemCounter++;
    const id = `item-${itemCounter}`;
    const item = {
      id,
      productoId,
      escuelaId: cotEscuelaSeleccionada.id,
      nombre: producto.nombre,
      tipo: producto.tipo,
      talla,
      cantidad: 1,
      precio
    };

    cotizadorItems.push(item);
    renderCotizadorItems();
    updateCotBadge();
  }

  showNotification('✅ Prenda agregada a la cotización', 'success');

  // Scroll al carrito
  setTimeout(() => {
    const carrito = document.getElementById('cotCarrito');
    if (carrito) carrito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
};

/**
 * Actualiza el badge del carrito
 */
function updateCotBadge() {
  const badge = document.getElementById('cotBadge');
  if (badge) {
    badge.textContent = cotizadorItems.length;
    badge.style.display = cotizadorItems.length > 0 ? 'inline-flex' : 'none';
  }
}

window.limpiarCotizador = function() {
  cotizadorItems = [];
  renderCotizadorItems();
  updateCotBadge();

  ['cot-nombre', 'cot-telefono', 'cot-notas'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  showNotification('🗑️ Cotización limpiada', 'info');
};

/**
 * Envía la cotización por WhatsApp
 */
window.enviarCotizacionWhatsApp = function() {
  const nombre = document.getElementById('cot-nombre')?.value?.trim();
  const telefono = document.getElementById('cot-telefono')?.value?.trim();
  const colegio = document.getElementById('cot-colegio')?.value;
  const notas = document.getElementById('cot-notas')?.value?.trim();

  if (!nombre) {
    showNotification('⚠️ Por favor completa tu nombre antes de enviar', 'error');
    return;
  }

  let mensaje = `🎒 *COTIZACIÓN RALOZ COL S.A.S*\n\n`;
  mensaje += `👤 *Nombre:* ${nombre}\n`;
  if (telefono) mensaje += `📞 *Teléfono:* ${telefono}\n`;
  if (colegio) mensaje += `🏫 *Colegio:* ${colegio}\n\n`;

  if (cotizadorItems.length > 0) {
    mensaje += `📋 *Prendas solicitadas:*\n`;
    let total = 0;
    cotizadorItems.forEach(item => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;
      const productoInfo = PRODUCTOS[item.productoId];
      mensaje += `  • ${item.nombre} (Talla: ${item.talla}) × ${item.cantidad} = ${formatCOP(subtotal)}\n`;
    });
    mensaje += `\n💰 *Total: ${formatCOP(total)}*\n`;
  }

  if (notas) mensaje += `\n📝 *Notas:* ${notas}\n`;
  mensaje += `\n¡Gracias por tu interés en RALOZ COL S.A.S!`;

  const encoded = encodeURIComponent(mensaje);
  const url = `https://wa.me/573213412903?text=${encoded}`;
  window.open(url, '_blank');

  showNotification('📱 Mensaje enviado a WhatsApp', 'success');
};

// ===================================================================
// SELECTOR DE ESCUELA Y CATÁLOGO DINÁMICO
// ===================================================================

let escuelaSeleccionada = null;
let tipoFiltroActual = null;

/**
 * Selecciona una escuela y muestra sus productos
 */
window.selectSchool = function(nombreEscuela) {
  const escuela = ESCUELAS[nombreEscuela];
  if (!escuela) {
    showNotification('Escuela no válida', 'error');
    return;
  }

  escuelaSeleccionada = escuela;
  escuelaSeleccionadaCotizador = escuela.id;
  tipoFiltroActual = null;

  // Ocultar selector, mostrar productos
  const selectorEscuelas = document.getElementById('selectorEscuelas');
  const productosSection = document.getElementById('productosSection');

  if (selectorEscuelas) selectorEscuelas.style.display = 'none';
  if (productosSection) productosSection.style.display = 'block';

  // Actualizar encabezado
  const escuelaTag = document.getElementById('escuelaTag');
  if (escuelaTag) escuelaTag.textContent = escuela.displayName;

  // Renderizar productos
  renderizarProductos();

  setTimeout(() => {
    const productosSection = document.getElementById('productosSection');
    if (productosSection) {
      scrollToSection(productosSection);
    }
  }, 100);
};

/**
 * Vuelve al selector de escuela
 */
window.clearSchool = function() {
  escuelaSeleccionada = null;
  tipoFiltroActual = null;

  const selectorEscuelas = document.getElementById('selectorEscuelas');
  const productosSection = document.getElementById('productosSection');

  if (selectorEscuelas) selectorEscuelas.style.display = 'block';
  if (productosSection) productosSection.style.display = 'none';

  setTimeout(() => {
    const selectorEscuelas = document.getElementById('selectorEscuelas');
    if (selectorEscuelas) {
      scrollToSection(selectorEscuelas);
    }
  }, 100);
};

/**
 * Renderiza los productos en el grid
 */
function renderizarProductos() {
  if (!escuelaSeleccionada) return;

  const grid = document.getElementById('productosGrid');
  if (!grid) return;

  let productos = obtenerProductosEscuela(escuelaSeleccionada.id);

  if (tipoFiltroActual) {
    productos = productos.filter(p => p.tipo === tipoFiltroActual);
  }

  const contadorProductos = document.getElementById('contadorProductos');
  if (contadorProductos) {
    contadorProductos.textContent = `${productos.length} productos`;
  }

  grid.innerHTML = '';

  productos.forEach(producto => {
    const precioMinimo = obtenerPrecioMinimo(escuelaSeleccionada.id, producto.id);
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `
      <div class="producto-icon">
        <i class="${producto.icon}"></i>
      </div>
      <div class="producto-info">
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <span class="producto-tipo">${producto.tipo}</span>
      </div>
      <div class="producto-precio">
        <span class="precio-desde">Desde ${formatCOP(precioMinimo)}</span>
      </div>
      <button class="btn btn-cotizar" onclick="addToCotizador(${producto.id}, ${escuelaSeleccionada.id})">
        Cotizar
      </button>
    `;
    grid.appendChild(card);
  });
}

/**
 * Obtiene los productos disponibles para una escuela
 */
function obtenerProductosEscuela(idEscuela) {
  const idsProductos = PRODUCTOS_POR_ESCUELA[idEscuela] || [];
  return idsProductos.map(id => PRODUCTOS[id]).filter(p => p);
}

/**
 * Filtra productos por tipo
 */
window.filtrarPorTipo = function(tipo) {
  if (!escuelaSeleccionada) return;

  if (tipoFiltroActual === tipo) {
    tipoFiltroActual = null;
    document.querySelectorAll('.tipo-btn').forEach(btn => btn.classList.remove('active'));
  } else {
    tipoFiltroActual = tipo;
    document.querySelectorAll('.tipo-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.textContent.trim() === tipo) btn.classList.add('active');
    });
  }

  renderizarProductos();
};

/**
 * Limpia los filtros
 */
window.limpiarFiltros = function() {
  tipoFiltroActual = null;
  document.querySelectorAll('.tipo-btn').forEach(btn => btn.classList.remove('active'));
  renderizarProductos();
};

// Actualizar contadores de botones de escuela
function actualizarContadoresEscuelas() {
  const botones = document.querySelectorAll('.school-btn');
  botones.forEach(btn => {
    const nombreEscuela = btn.textContent.split('\n')[0].trim();
    let idEscuela = null;

    if (nombreEscuela.includes('Marillac')) idEscuela = 1;
    else if (nombreEscuela.includes('Adventista')) idEscuela = 2;
    else if (nombreEscuela.includes('Manyanet')) idEscuela = 3;

    if (idEscuela) {
      const cantProductos = PRODUCTOS_POR_ESCUELA[idEscuela].length;
      const lineas = btn.innerHTML.split('\n');
      let htmlActualizado = '';
      for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].includes('productos')) {
          htmlActualizado += `${cantProductos} productos\n`;
        } else {
          htmlActualizado += lineas[i] + '\n';
        }
      }
      btn.innerHTML = htmlActualizado;
    }
  });
}

// ===================================================================
// CATÁLOGO ANTIGUOS TABS (compatibilidad)
// ===================================================================
function initCatalogo() {
  const tabs = document.querySelectorAll('.cat-tab');
  const cards = document.querySelectorAll('.uniforme-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const colegio = tab.dataset.colegio;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      cards.forEach(card => {
        const match = colegio === 'todos' || card.dataset.colegio === colegio;
        if (match) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  cards.forEach(card => {
    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  });
}

// ===================================================================
// FAQ — Acordeón
// ===================================================================
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      document.querySelectorAll('.faq-question').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling?.classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer?.classList.add('open');
      }
    });
  });
}

// ===================================================================
// INTEGRACIÓN CON API RALOZ
// ===================================================================
async function initRalozIntegration() {
  const apiDot = document.getElementById('apiDot');
  const apiText = document.getElementById('apiStatusText');

  if (apiDot) apiDot.className = 'api-dot connecting';
  if (apiText) apiText.textContent = 'Conectando con RALOZ...';

  const online = await RalozAPI.ping();

  if (online) {
    if (apiDot) apiDot.className = 'api-dot online';
    if (apiText) apiText.textContent = 'Conectado con RALOZ — precios en tiempo real';

    const portalDot = document.querySelector('#portalStatus .status-dot');
    const portalTxt = document.querySelector('#portalStatus span:last-child');
    if (portalDot) portalDot.className = 'status-dot online';
    if (portalTxt) portalTxt.textContent = 'Sistema online — datos en tiempo real';

    const dashboard = await RalozAPI.getDashboard();
    if (dashboard) updatePortalCard(dashboard);

  } else {
    if (apiDot) apiDot.className = 'api-dot offline';
    if (apiText) apiText.textContent = 'Modo estático — precios locales';
  }
}

function updatePortalCard(data) {
  const stock = data.total_stock ?? data.stock ?? '—';
  const ventas = data.ventas_mes ?? data.ventas ?? '—';
  const pendientes = data.pedidos_pendientes ?? data.pendientes ?? '—';

  const stockEl = document.getElementById('stockDisplay');
  const ventasEl = document.getElementById('ventasDisplay');
  const pendEl = document.getElementById('pendientesDisplay');

  if (stockEl) stockEl.textContent = typeof stock === 'number' ? stock.toLocaleString() : stock;
  if (ventasEl) ventasEl.textContent = typeof ventas === 'number' ? ventas.toLocaleString() : ventas;
  if (pendEl) pendEl.textContent = typeof pendientes === 'number' ? pendientes.toLocaleString() : pendientes;
}

// ===================================================================
// UI HELPERS
// ===================================================================
function showNotification(message, type = 'info') {
  const n = document.createElement('div');
  n.className = `notification notification-${type}`;
  n.textContent = message;
  n.setAttribute('role', 'alert');
  n.setAttribute('aria-live', 'polite');
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => n.remove(), 300);
  }, 4000);
}

// ===================================================================
// CORE MODULES (Compatibilidad)
// ===================================================================
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('nav ul');
  if (!toggle || !menu) return;

  const toggleMenu = (forceClose = false) => {
    menu.classList.toggle('active', !forceClose);
    const isOpen = menu.classList.contains('active');
    toggle.textContent = isOpen ? '✕' : '☰';
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    toggle.setAttribute('aria-expanded', isOpen);
  };

  toggle.addEventListener('click', () => toggleMenu());
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  });
  document.querySelectorAll('nav a').forEach(l => {
    l.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggleMenu(true);
    });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menu.classList.contains('active')) toggleMenu(true);
  }, { passive: true });
  document.addEventListener('click', e => {
    if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) toggleMenu(true);
  }, { passive: true });
}

function scrollToSection(target) {
  if (!target) return;
  const nav = document.querySelector('nav');
  const navHeight = nav ? nav.offsetHeight : 0;
  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  window.scrollTo({ top: absoluteTop - navHeight - 8, behavior: 'smooth' });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        scrollToSection(target);
      }
    });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('section, .uniforme-card, .producto-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });
}

function initActiveNavIndicator() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  let ticking = false;
  const nav = document.querySelector('nav');

  const update = () => {
    const navH = nav ? nav.offsetHeight : 64;
    const scrollMid = window.scrollY + navH + 60;
    let current = '';
    sections.forEach(s => {
      const rect = s.getBoundingClientRect();
      const absTop = rect.top + window.scrollY;
      if (scrollMid >= absTop) current = s.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.pageYOffset > 80), { passive: true });
}

function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.style.opacity = window.pageYOffset > 300 ? '1' : '0';
        btn.style.visibility = window.pageYOffset > 300 ? 'visible' : 'hidden';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;

      const update = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString('es-CO');
        if (current < target) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function initFormMonitoring() {
  const iframe = document.querySelector('.form-container iframe');
  const fallback = document.querySelector('.form-fallback');
  if (!iframe || !fallback) return;

  let loaded = false;
  let timeout = setTimeout(() => {
    if (!loaded) {
      iframe.style.display = 'none';
      fallback.hidden = false;
      showNotification('⏱️ El formulario tardó en cargar. Usa el enlace directo.', 'info');
    }
  }, 10000);

  iframe.addEventListener('load', () => {
    clearTimeout(timeout);
    loaded = true;
    iframe.style.display = 'block';
    fallback.hidden = true;
  });
  iframe.addEventListener('error', () => {
    clearTimeout(timeout);
    iframe.style.display = 'none';
    fallback.hidden = false;
  });
}

function initOfflineDetection() {
  window.addEventListener('online', () => showNotification('✅ Conexión restaurada', 'success'));
  window.addEventListener('offline', () => showNotification('⚠️ Sin conexión a internet', 'error'));
}

function initWhatsAppThrottle() {
  const btn = document.querySelector('.whatsapp-float');
  if (!btn) return;
  let lastClick = 0;
  btn.addEventListener('click', e => {
    if (Date.now() - lastClick < 2000) {
      e.preventDefault();
      showNotification('⏳ Espera un momento antes de volver a hacer clic', 'info');
      return;
    }
    lastClick = Date.now();
  });
}

function initImagePreload() {
  ['banner.webp', 'whatsapp.webp'].forEach(src => {
    const l = document.createElement('link');
    l.rel = 'preload';
    l.as = 'image';
    l.href = src;
    document.head.appendChild(l);
  });
}

// ===================================================================
// INICIALIZACIÓN
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Actualizar contadores de escuelas
  actualizarContadoresEscuelas();

  const modules = [
    initMobileMenu,
    initSmoothScroll,
    initScrollAnimations,
    initActiveNavIndicator,
    initNavScroll,
    initBackToTop,
    initCounters,
    initFormMonitoring,
    initCatalogo,
    initFAQ,
    initOfflineDetection,
    initWhatsAppThrottle,
    initImagePreload,
  ];

  modules.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.warn('[RALOZ]', fn.name, e);
    }
  });

  // API integration (async, no bloquea)
  initRalozIntegration().catch(() => {});

  // Tienda online
  initTiendaOnline().catch(() => {});
});

// ===================================================================
// TIENDA ONLINE — Catálogo + Carrito + Checkout + Wompi
// ===================================================================

// Estado global del carrito
const Carrito = {
  items: [],          // [{id_producto, nombre, talla, cantidad, precio, colegio_id}]
  colegio_id: null,
  colegio_nombre: '',

  agregar(item) {
    const key = `${item.id_producto}-${item.talla}`;
    const existe = this.items.find(i => `${i.id_producto}-${i.talla}` === key);
    if (existe) {
      existe.cantidad += item.cantidad;
    } else {
      this.items.push({ ...item });
    }
    this.renderBadge();
    this.guardar();
  },

  quitar(id_producto, talla) {
    this.items = this.items.filter(i => !(i.id_producto === id_producto && i.talla === talla));
    this.renderBadge();
    this.guardar();
  },

  vaciar() {
    this.items = [];
    this.colegio_id = null;
    this.colegio_nombre = '';
    this.renderBadge();
    this.guardar();
  },

  total() {
    return this.items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  },

  count() {
    return this.items.reduce((s, i) => s + i.cantidad, 0);
  },

  renderBadge() {
    const badge = document.getElementById('carritoBadge');
    const float = document.getElementById('carritoFloat');
    if (!badge || !float) return;
    const n = this.count();
    badge.textContent = n;
    float.style.display = n > 0 ? 'block' : 'none';
  },

  guardar() {
    try {
      sessionStorage.setItem('raloz_carrito', JSON.stringify({
        items: this.items,
        colegio_id: this.colegio_id,
        colegio_nombre: this.colegio_nombre,
      }));
    } catch {}
  },

  cargar() {
    try {
      const d = JSON.parse(sessionStorage.getItem('raloz_carrito') || 'null');
      if (d) {
        this.items = d.items || [];
        this.colegio_id = d.colegio_id;
        this.colegio_nombre = d.colegio_nombre || '';
      }
    } catch {}
    this.renderBadge();
  },
};

function formatCOP(v) {
  return '$' + Math.round(v).toLocaleString('es-CO');
}

async function initTiendaOnline() {
  Carrito.cargar();

  const loading   = document.getElementById('tiendaLoading');
  const error     = document.getElementById('tiendaError');
  const contenido = document.getElementById('tiendaContenido');

  if (!loading) return;

  // Mensaje dinámico mientras espera (el servidor gratis tarda hasta 50s en despertar)
  const loadingMsg = loading.querySelector('p');
  let seg = 0;
  const mensajes = [
    'Cargando tienda...',
    'Conectando con el servidor...',
    'El servidor está despertando, espera un momento...',
    'Ya casi está listo...',
    'Un momento más...',
  ];
  const intervalo = setInterval(() => {
    seg += 4;
    const idx = Math.min(Math.floor(seg / 8), mensajes.length - 1);
    if (loadingMsg) loadingMsg.textContent = mensajes[idx];
  }, 4000);

  // Reintentar hasta 70s para aguantar el cold start de Render (plan gratuito)
  let data = null;
  const inicio = Date.now();
  while (Date.now() - inicio < 70000) {
    try {
      const res = await fetch(`${RalozAPI.baseURL}/tienda/colegios`, {
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) { data = await res.json(); break; }
      if (res.status !== 503) break; // error real, no reintentar
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
  loading.style.display  = 'none';
  contenido.style.display = 'block';

  // Eventos del carrito flotante
  document.getElementById('carritoBtn')?.addEventListener('click', abrirCarritoPanel);
  document.getElementById('carritoCerrar')?.addEventListener('click', cerrarCarritoPanel);
  document.getElementById('tiendaVolverColegios')?.addEventListener('click', () => {
    document.getElementById('tiendaPaso2').style.display = 'none';
    document.getElementById('tiendaPaso1').style.display = 'block';
  });

  // Checkout
  document.getElementById('checkoutCerrar')?.addEventListener('click', cerrarCheckout);
  document.getElementById('checkoutOverlay')?.addEventListener('click', cerrarCheckout);
  document.getElementById('carritoCheckout')?.addEventListener('click', abrirCheckout);
  document.getElementById('checkoutForm')?.addEventListener('submit', procesarCheckout);

  // Modal de tallas
  document.getElementById('tallaCerrar')?.addEventListener('click', cerrarTallaModal);
  document.getElementById('tallaOverlay')?.addEventListener('click', cerrarTallaModal);
}

function renderTiendaColegios(colegios) {
  const grid = document.getElementById('tiendaColegiosGrid');
  if (!grid) return;

  grid.innerHTML = colegios.map(c => `
    <button class="tienda-colegio-card" data-id="${c.id_colegio}" data-nombre="${c.nombre}">
      <i class="fa-solid fa-school"></i>
      <span class="tc-nombre">${c.nombre}</span>
      ${c.ciudad ? `<span class="tc-ciudad">${c.ciudad}</span>` : ''}
    </button>
  `).join('');

  grid.querySelectorAll('.tienda-colegio-card').forEach(btn => {
    btn.addEventListener('click', () => cargarCatalogoColegio(
      parseInt(btn.dataset.id),
      btn.dataset.nombre
    ));
  });
}

async function cargarCatalogoColegio(id, nombre) {
  const paso1 = document.getElementById('tiendaPaso1');
  const paso2 = document.getElementById('tiendaPaso2');
  const nombreEl = document.getElementById('tiendaColegioNombre');
  const grid = document.getElementById('tiendaProductosGrid');
  const filtros = document.getElementById('tiendaTipoFiltros');

  paso1.style.display = 'none';
  paso2.style.display = 'block';
  nombreEl.textContent = nombre;
  grid.innerHTML = '<div class="tienda-loading-cat"><div class="tienda-spinner"></div><p>Cargando uniformes...</p></div>';
  filtros.innerHTML = '';

  Carrito.colegio_id = id;
  Carrito.colegio_nombre = nombre;
  Carrito.guardar();

  const data = await RalozAPI.getCatalogoTienda(id);

  if (!data || !data.productos || !data.productos.length) {
    grid.innerHTML = '<p class="tienda-empty">No hay productos disponibles para este colegio por el momento.</p>';
    return;
  }

  // Filtros por tipo
  const tipos = [...new Set(data.productos.map(p => p.tipo || 'Otros'))];
  filtros.innerHTML = `
    <button class="tienda-filtro active" data-tipo="todos">Todos</button>
    ${tipos.map(t => `<button class="tienda-filtro" data-tipo="${t}">${t}</button>`).join('')}
  `;

  filtros.querySelectorAll('.tienda-filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      filtros.querySelectorAll('.tienda-filtro').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtrarProductos(btn.dataset.tipo, data.productos);
    });
  });

  renderProductos(data.productos);
  scrollToSection(document.getElementById('tienda-online'));
}

function filtrarProductos(tipo, productos) {
  const filtrados = tipo === 'todos' ? productos : productos.filter(p => (p.tipo || 'Otros') === tipo);
  renderProductos(filtrados);
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
    return `
      <div class="tienda-producto-card">
        <div class="tpc-imagen">
          <i class="fa-solid fa-shirt tpc-icon"></i>
          ${stockTotal < 5 ? '<span class="tpc-badge-poco">¡Pocas unidades!</span>' : ''}
        </div>
        <div class="tpc-info">
          <h4 class="tpc-nombre">${p.nombre}</h4>
          <p class="tpc-tipo">${p.tipo || ''}</p>
          <p class="tpc-precio">Desde <strong>${formatCOP(precioMin)}</strong></p>
          <p class="tpc-stock">${stockTotal} unidades disponibles</p>
        </div>
        <button class="btn-agregar-carrito" data-id="${p.id_producto}" data-nombre="${p.nombre}">
          <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
        </button>
      </div>
    `;
  }).join('');

  // Guardar productos para el modal de tallas
  window._tiendaProductos = productos;

  grid.querySelectorAll('.btn-agregar-carrito').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const producto = window._tiendaProductos?.find(p => p.id_producto === id);
      if (producto) abrirTallaModal(producto);
    });
  });
}

// ─── Modal de selección de talla ───────────────────────────────────
function abrirTallaModal(producto) {
  document.getElementById('tallaNombreProducto').textContent = producto.nombre;
  const opciones = document.getElementById('tallaOpciones');

  opciones.innerHTML = producto.tallas.map(t => `
    <div class="talla-opcion">
      <div class="talla-info">
        <span class="talla-tag">Talla ${t.talla}</span>
        <span class="talla-precio">${formatCOP(t.precio)}</span>
        <span class="talla-stock-info">${t.stock} disponibles</span>
      </div>
      <div class="talla-cantidad">
        <button class="talla-menos" data-talla="${t.talla}">−</button>
        <span class="talla-cant-val" data-talla="${t.talla}">1</span>
        <button class="talla-mas" data-talla="${t.talla}" data-max="${t.stock}">+</button>
      </div>
      <button class="btn-talla-add" data-talla="${t.talla}" data-precio="${t.precio}" data-max="${t.stock}">
        <i class="fa-solid fa-cart-plus"></i> Agregar
      </button>
    </div>
  `).join('');

  // Eventos de cantidad
  opciones.querySelectorAll('.talla-menos').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = opciones.querySelector(`.talla-cant-val[data-talla="${btn.dataset.talla}"]`);
      const v = parseInt(el.textContent);
      if (v > 1) el.textContent = v - 1;
    });
  });
  opciones.querySelectorAll('.talla-mas').forEach(btn => {
    btn.addEventListener('click', () => {
      const el = opciones.querySelector(`.talla-cant-val[data-talla="${btn.dataset.talla}"]`);
      const v = parseInt(el.textContent);
      if (v < parseInt(btn.dataset.max)) el.textContent = v + 1;
    });
  });

  // Agregar al carrito desde el modal
  opciones.querySelectorAll('.btn-talla-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const talla = btn.dataset.talla;
      const cant = parseInt(opciones.querySelector(`.talla-cant-val[data-talla="${talla}"]`).textContent);
      Carrito.agregar({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        talla,
        cantidad: cant,
        precio: parseFloat(btn.dataset.precio),
      });
      cerrarTallaModal();
      mostrarToast(`${producto.nombre} talla ${talla} agregado al carrito`);
    });
  });

  document.getElementById('tallaModal').style.display = 'flex';
  document.getElementById('tallaOverlay').style.display = 'block';
}

function cerrarTallaModal() {
  document.getElementById('tallaModal').style.display = 'none';
  document.getElementById('tallaOverlay').style.display = 'none';
}

// ─── Panel del carrito ──────────────────────────────────────────────
function abrirCarritoPanel() {
  renderCarritoPanel();
  document.getElementById('carritoPanel').style.display = 'flex';
}

function cerrarCarritoPanel() {
  document.getElementById('carritoPanel').style.display = 'none';
}

function renderCarritoPanel() {
  const items = document.getElementById('carritoItems');
  const footer = document.getElementById('carritoPanelFooter');
  const total = document.getElementById('carritoTotal');

  if (!Carrito.items.length) {
    items.innerHTML = '<p class="carrito-empty"><i class="fa-solid fa-cart-shopping"></i><br>Tu carrito está vacío</p>';
    footer.style.display = 'none';
    return;
  }

  items.innerHTML = Carrito.items.map(i => `
    <div class="carrito-item">
      <div class="ci-info">
        <span class="ci-nombre">${i.nombre}</span>
        <span class="ci-detalle">Talla ${i.talla} · ${formatCOP(i.precio)} c/u</span>
      </div>
      <div class="ci-acciones">
        <span class="ci-cantidad">×${i.cantidad}</span>
        <span class="ci-subtotal">${formatCOP(i.precio * i.cantidad)}</span>
        <button class="ci-quitar" data-id="${i.id_producto}" data-talla="${i.talla}" aria-label="Quitar">×</button>
      </div>
    </div>
  `).join('');

  items.querySelectorAll('.ci-quitar').forEach(btn => {
    btn.addEventListener('click', () => {
      Carrito.quitar(parseInt(btn.dataset.id), btn.dataset.talla);
      renderCarritoPanel();
    });
  });

  total.textContent = formatCOP(Carrito.total());
  footer.style.display = 'block';
}

// ─── Checkout ──────────────────────────────────────────────────────
function abrirCheckout() {
  cerrarCarritoPanel();

  // Resumen
  const resumen = document.getElementById('checkoutResumenItems');
  resumen.innerHTML = Carrito.items.map(i => `
    <div class="checkout-item">
      <span>${i.nombre} T.${i.talla} ×${i.cantidad}</span>
      <span>${formatCOP(i.precio * i.cantidad)}</span>
    </div>
  `).join('');
  document.getElementById('checkoutTotalDisplay').textContent = formatCOP(Carrito.total());

  document.getElementById('checkoutModal').style.display = 'flex';
  document.getElementById('checkoutOverlay').style.display = 'block';
  document.getElementById('checkoutError').style.display = 'none';
}

function cerrarCheckout() {
  document.getElementById('checkoutModal').style.display = 'none';
  document.getElementById('checkoutOverlay').style.display = 'none';
}

async function procesarCheckout(e) {
  e.preventDefault();
  const btn = document.getElementById('checkoutPagarBtn');
  const errorEl = document.getElementById('checkoutError');

  const nombre   = document.getElementById('ck-nombre').value.trim();
  const email    = document.getElementById('ck-email').value.trim();
  const telefono = document.getElementById('ck-telefono').value.trim();
  const documento= document.getElementById('ck-documento').value.trim();

  if (!nombre || !email || !telefono) {
    errorEl.textContent = 'Por favor completa todos los campos requeridos.';
    errorEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';
  errorEl.style.display = 'none';

  try {
    const payload = {
      nombre_cliente:   nombre,
      email_cliente:    email,
      telefono_cliente: telefono,
      documento_cliente: documento,
      id_colegio:       Carrito.colegio_id,
      items: Carrito.items.map(i => ({
        id_producto: i.id_producto,
        nombre:      i.nombre,
        talla:       i.talla,
        cantidad:    i.cantidad,
      })),
    };

    const resp = await RalozAPI.crearPedido(payload);

    Carrito.vaciar();

    // Redirigir al checkout de MercadoPago
    if (resp.pago_url) {
      window.location.href = resp.pago_url;
    } else {
      // Si MP no está configurado aún, mostrar referencia
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Pedido creado';
      errorEl.style.background = '#e8f5e9';
      errorEl.style.color = '#2e7d32';
      errorEl.textContent = `Pedido #${resp.pedido.referencia} registrado. Nos contactaremos contigo para coordinar el pago.`;
      errorEl.style.display = 'block';
    }

  } catch (err) {
    errorEl.textContent = err.message || 'Error al procesar el pedido. Intenta de nuevo.';
    errorEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Pagar ahora';
  }
}

// ─── Toast de confirmación ─────────────────────────────────────────
function mostrarToast(msg) {
  let toast = document.getElementById('ralozToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ralozToast';
    toast.className = 'raloz-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}


// ─── LOOKBOOK CAROUSEL FUNCTIONS ──────────────────────────────────
let lbCurrentIndex = 0;
const lbSlideCount = 4;
const lbSlideWidth = 33.333;

function updateLookbookPosition() {
  const track = document.getElementById('lookbookTrack');
  const offset = -lbCurrentIndex * (lbSlideWidth + 0.667);
  track.style.transform = `translateX(calc(${offset}% + ${-lbCurrentIndex * 1}rem))`;
  
  const dots = document.querySelectorAll('.lb-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === lbCurrentIndex);
  });
}

function lbNext() {
  lbCurrentIndex = (lbCurrentIndex + 1) % lbSlideCount;
  updateLookbookPosition();
}

function lbPrev() {
  lbCurrentIndex = (lbCurrentIndex - 1 + lbSlideCount) % lbSlideCount;
  updateLookbookPosition();
}

function lbGoTo(index) {
  if (index >= 0 && index < lbSlideCount) {
    lbCurrentIndex = index;
    updateLookbookPosition();
  }
}
