// ===================================================================
// MÓDULO — Cotizador (estado + funciones)
// ===================================================================

import { ESCUELAS } from '../data/colegios.js';
import { PRODUCTOS, PRODUCTOS_POR_ESCUELA } from '../data/productos.js';
import {
  formatCOP,
  obtenerTallas,
  obtenerPrecio,
  obtenerPrecioMinimo,
  obtenerProductosEscuela,
  showNotification,
  scrollToSection,
} from '../core/utils.js';

let cotizadorItems = [];
let itemCounter = 0;
let escuelaSeleccionadaCotizador = null;

// Permite que otros módulos (catalogo) sincronicen la escuela seleccionada
export function setEscuelaCotizador(id) {
  escuelaSeleccionadaCotizador = id;
}

// ─── Cotizador base ───────────────────────────────────────────────

/** Abre el cotizador con un producto preseleccionado */
window.addToCotizador = function(productoId, escuelaId) {
  const producto = PRODUCTOS[productoId];
  if (!producto) return;

  escuelaSeleccionadaCotizador = escuelaId;

  const cotizador = document.getElementById('cotizador');
  if (cotizador) scrollToSection(cotizador);

  setTimeout(() => {
    agregarProductoAlCotizador(productoId, escuelaId);
  }, 400);
};

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
    precio: obtenerPrecio(escuelaId, productoId, tallas[0]),
  };

  cotizadorItems.push(item);
  renderCotizadorItems();
}

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

window.updateItemTalla = function(id, talla) {
  const item = cotizadorItems.find(i => i.id === id);
  if (item) {
    item.talla = talla;
    item.precio = obtenerPrecio(item.escuelaId, item.productoId, talla);
    renderCotizadorItems();
  }
};

window.updateItemQty = function(id, delta) {
  const item = cotizadorItems.find(i => i.id === id);
  if (item) {
    item.cantidad = Math.max(1, item.cantidad + delta);
    renderCotizadorItems();
  }
};

window.removeItem = function(id) {
  cotizadorItems = cotizadorItems.filter(i => i.id !== id);
  renderCotizadorItems();
  updateCotBadge();
};

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

// ─── Cotizador V2 — flujo tipo catálogo ──────────────────────────

let cotEscuelaSeleccionada = null;
let cotTipoFiltro = null;

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

window.cotClearSchool = function() {
  cotEscuelaSeleccionada = null;
  cotTipoFiltro = null;

  const selector = document.getElementById('cotSelectorEscuelas');
  const productos = document.getElementById('cotProductosSection');

  if (selector) selector.style.display = 'block';
  if (productos) productos.style.display = 'none';
};

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
    const tallaOptions = tallas.map(t =>
      `<option value="${t}">${t} - ${formatCOP(obtenerPrecio(cotEscuelaSeleccionada.id, producto.id, t))}</option>`
    ).join('');

    const card = document.createElement('div');
    card.className = 'producto-card producto-card-cot';
    card.innerHTML = `
      <div class="producto-icon"><i class="${producto.icon}"></i></div>
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
    cotizadorItems.push({
      id,
      productoId,
      escuelaId: cotEscuelaSeleccionada.id,
      nombre: producto.nombre,
      tipo: producto.tipo,
      talla,
      cantidad: 1,
      precio,
    });
    renderCotizadorItems();
    updateCotBadge();
  }

  showNotification('✅ Prenda agregada a la cotización', 'success');

  setTimeout(() => {
    const carrito = document.getElementById('cotCarrito');
    if (carrito) carrito.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 200);
};

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
      mensaje += `  • ${item.nombre} (Talla: ${item.talla}) × ${item.cantidad} = ${formatCOP(subtotal)}\n`;
    });
    mensaje += `\n💰 *Total: ${formatCOP(total)}*\n`;
  }

  if (notas) mensaje += `\n📝 *Notas:* ${notas}\n`;
  mensaje += `\n¡Gracias por tu interés en RALOZ COL S.A.S!`;

  const encoded = encodeURIComponent(mensaje);
  window.open(`https://wa.me/573213412903?text=${encoded}`, '_blank');

  showNotification('📱 Mensaje enviado a WhatsApp', 'success');
};
