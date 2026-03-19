// ===================================================================
// MÓDULO — Tienda de Relojes
// ===================================================================

import { RELOJES } from '../data/relojes.js';
import { Carrito } from '../core/carrito.js';
import { formatCOP, mostrarToast } from '../core/utils.js';

// ─── Init ─────────────────────────────────────────────────────────

export function initRelojes() {
  renderRelojesGrid();
  initColorModal();
}

// ─── Grid de productos ────────────────────────────────────────────

function renderRelojesGrid() {
  const grid = document.getElementById('relojesGrid');
  if (!grid) return;

  grid.innerHTML = RELOJES.map(r => `
    <div class="reloj-card${r.destacado ? ' reloj-card-destacado' : ''}" data-id="${r.id_producto}">
      <div class="reloj-img-box">
        <i class="${r.icono}"></i>
        ${r.destacado ? '<span class="reloj-badge-dest"><i class="fa-solid fa-star"></i> Destacado</span>' : ''}
      </div>
      <div class="reloj-info">
        <h3 class="reloj-nombre">${r.nombre}</h3>
        <p class="reloj-desc">${r.descripcion}</p>
        <div class="reloj-colores-preview">
          ${r.colores.map(c => `
            <span class="reloj-color-dot"
                  style="background:${c.hex};${(c.hex === '#f5f5f5' || c.hex === '#ffffff') ? 'border:1.5px solid #ccc;' : ''}"
                  title="${c.nombre}"></span>
          `).join('')}
          <span class="reloj-colores-hint">${r.colores.length} color${r.colores.length > 1 ? 'es' : ''}</span>
        </div>
        <div class="reloj-precio-row">
          <span class="reloj-precio-desde">Desde</span>
          <strong class="reloj-precio">${formatCOP(r.precio_desde)}</strong>
        </div>
        <button class="btn-reloj-comprar" data-id="${r.id_producto}">
          <i class="fa-solid fa-cart-plus"></i> Seleccionar color
        </button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.btn-reloj-comprar').forEach(btn => {
    btn.addEventListener('click', () => {
      const reloj = RELOJES.find(r => r.id_producto === parseInt(btn.dataset.id));
      if (reloj) abrirColorModal(reloj);
    });
  });
}

// ─── Modal de color ───────────────────────────────────────────────

function initColorModal() {
  document.getElementById('colorCerrar')?.addEventListener('click', cerrarColorModal);
  document.getElementById('colorOverlay')?.addEventListener('click', cerrarColorModal);
}

function abrirColorModal(reloj) {
  document.getElementById('colorNombreProducto').textContent = reloj.nombre;
  document.getElementById('colorDescripcion').textContent    = reloj.descripcion;

  const iconEl = document.getElementById('colorModalIcon');
  if (iconEl) iconEl.className = reloj.icono;

  const opcionesEl = document.getElementById('colorOpciones');
  const detalleEl  = document.getElementById('colorDetalle');
  const btnAdd     = document.getElementById('btnColorAdd');
  const cantEl     = document.getElementById('colorCantVal');
  const precioEl   = document.getElementById('colorPrecioDisplay');

  let selectedColor  = null;
  let selectedPrecio = null;

  detalleEl.style.display = 'none';
  btnAdd.style.display    = 'none';
  cantEl.textContent      = '1';

  opcionesEl.innerHTML = reloj.colores.map((c, i) => `
    <button class="color-opcion-btn" data-idx="${i}"
            data-nombre="${c.nombre}" data-precio="${c.precio}" data-stock="${c.stock}">
      <span class="cop-dot"
            style="background:${c.hex};${(c.hex === '#f5f5f5' || c.hex === '#ffffff') ? 'border:1.5px solid #ccc;' : ''}">
      </span>
      <span class="cop-nombre">${c.nombre}</span>
      <strong class="cop-precio">${formatCOP(c.precio)}</strong>
      ${c.stock > 0 && c.stock < 5 ? `<span class="cop-stock-low"><i class="fa-solid fa-fire"></i> ¡${c.stock} disp.!</span>` : ''}
    </button>
  `).join('');

  opcionesEl.querySelectorAll('.color-opcion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      opcionesEl.querySelectorAll('.color-opcion-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor  = btn.dataset.nombre;
      selectedPrecio = parseFloat(btn.dataset.precio);
      precioEl.textContent    = formatCOP(selectedPrecio);
      cantEl.textContent      = '1';
      detalleEl.style.display = 'flex';
      btnAdd.style.display    = 'flex';
    });
  });

  document.getElementById('colorMenos').onclick = () => {
    const v = parseInt(cantEl.textContent);
    if (v > 1) cantEl.textContent = v - 1;
  };
  document.getElementById('colorMas').onclick = () => {
    cantEl.textContent = parseInt(cantEl.textContent) + 1;
  };

  btnAdd.onclick = () => {
    if (!selectedColor) return;
    const cant = parseInt(cantEl.textContent);
    Carrito.agregar({
      id_producto:      reloj.id_producto,
      nombre:           reloj.nombre,
      talla:            selectedColor,
      cantidad:         cant,
      precio:           selectedPrecio,
      unit_price:       selectedPrecio,
      tipo_pedido:      'normal',
      categoria:        'relojes',
      stock_disponible: cant,
    });
    cerrarColorModal();
    mostrarToast(`${reloj.nombre} — ${selectedColor} ×${cant} agregado al carrito ✓`);
  };

  document.getElementById('colorModal').style.display   = 'flex';
  document.getElementById('colorOverlay').style.display = 'block';
}

export function cerrarColorModal() {
  document.getElementById('colorModal').style.display   = 'none';
  document.getElementById('colorOverlay').style.display = 'none';
}
