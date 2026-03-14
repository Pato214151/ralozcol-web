// ===================================================================
// MÓDULO — Catálogo dinámico por escuela
// ===================================================================

import { ESCUELAS } from '../data/colegios.js';
import { PRODUCTOS_POR_ESCUELA } from '../data/productos.js';
import {
  formatCOP,
  obtenerPrecioMinimo,
  obtenerTallas,
  obtenerPrecio,
  obtenerProductosEscuela,
  scrollToSection,
  showNotification,
} from '../core/utils.js';
import { setEscuelaCotizador } from './cotizador.js';

let escuelaSeleccionada = null;
let tipoFiltroActual = null;

// ─── Selección de escuela ─────────────────────────────────────────

window.selectSchool = function(nombreEscuela) {
  const escuela = ESCUELAS[nombreEscuela];
  if (!escuela) {
    showNotification('Escuela no válida', 'error');
    return;
  }

  escuelaSeleccionada = escuela;
  setEscuelaCotizador(escuela.id);
  tipoFiltroActual = null;

  const selectorEscuelas = document.getElementById('selectorEscuelas');
  const productosSection = document.getElementById('productosSection');
  const escuelaTag = document.getElementById('escuelaTag');

  if (selectorEscuelas) selectorEscuelas.style.display = 'none';
  if (productosSection) productosSection.style.display = 'block';
  if (escuelaTag) escuelaTag.textContent = escuela.displayName;

  renderizarProductos();

  setTimeout(() => {
    const sec = document.getElementById('productosSection');
    if (sec) scrollToSection(sec);
  }, 100);
};

window.clearSchool = function() {
  escuelaSeleccionada = null;
  tipoFiltroActual = null;

  const selectorEscuelas = document.getElementById('selectorEscuelas');
  const productosSection = document.getElementById('productosSection');

  if (selectorEscuelas) selectorEscuelas.style.display = 'block';
  if (productosSection) productosSection.style.display = 'none';

  setTimeout(() => {
    const sec = document.getElementById('selectorEscuelas');
    if (sec) scrollToSection(sec);
  }, 100);
};

// ─── Grid de productos ────────────────────────────────────────────

function renderizarProductos() {
  if (!escuelaSeleccionada) return;

  const grid = document.getElementById('productosGrid');
  if (!grid) return;

  let productos = obtenerProductosEscuela(escuelaSeleccionada.id);
  if (tipoFiltroActual) {
    productos = productos.filter(p => p.tipo === tipoFiltroActual);
  }

  const contadorProductos = document.getElementById('contadorProductos');
  if (contadorProductos) contadorProductos.textContent = `${productos.length} productos`;

  grid.innerHTML = '';

  productos.forEach(producto => {
    const precioMinimo = obtenerPrecioMinimo(escuelaSeleccionada.id, producto.id);
    const tallas = obtenerTallas(escuelaSeleccionada.id, producto.id);
    const precioRows = tallas.map(t => {
      const p = obtenerPrecio(escuelaSeleccionada.id, producto.id, t);
      return `<tr><td class="cat-talla-cell">${t}</td><td class="cat-precio-cell">${formatCOP(p)}</td></tr>`;
    }).join('');

    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `
      <div class="producto-icon"><i class="${producto.icon}"></i></div>
      <div class="producto-info">
        <h3 class="producto-nombre">${producto.nombre}</h3>
        <span class="producto-tipo">${producto.tipo}</span>
      </div>
      <div class="producto-precio">
        <span class="precio-desde">Desde ${formatCOP(precioMinimo)}</span>
      </div>
      <div class="cat-precios-wrap" id="catPrecios_${producto.id}" style="display:none;">
        <table class="cat-precios-tabla">
          <thead><tr><th>Talla</th><th>Precio</th></tr></thead>
          <tbody>${precioRows}</tbody>
        </table>
      </div>
      <div class="cat-btns">
        <button class="btn-ver-precios" onclick="toggleCatPrecios(${producto.id}, this)">
          <i class="fa-solid fa-tags"></i> Ver precios
        </button>
        <a href="#tienda-online" class="btn-ir-tienda">
          <i class="fa-solid fa-bag-shopping"></i> Comprar
        </a>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.toggleCatPrecios = function(productoId, btn) {
  const wrap = document.getElementById(`catPrecios_${productoId}`);
  if (!wrap) return;
  const isOpen = wrap.style.display !== 'none';
  wrap.style.display = isOpen ? 'none' : 'block';
  btn.innerHTML = isOpen
    ? '<i class="fa-solid fa-tags"></i> Ver precios'
    : '<i class="fa-solid fa-chevron-up"></i> Ocultar';
};

// ─── Filtros ──────────────────────────────────────────────────────

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

window.limpiarFiltros = function() {
  tipoFiltroActual = null;
  document.querySelectorAll('.tipo-btn').forEach(btn => btn.classList.remove('active'));
  renderizarProductos();
};

// ─── Contadores de escuela ────────────────────────────────────────

export function actualizarContadoresEscuelas() {
  const botones = document.querySelectorAll('.school-btn');
  botones.forEach(btn => {
    const nombreEscuela = btn.textContent.split('\n')[0].trim();
    let idEscuela = null;

    if (nombreEscuela.includes('Marillac'))   idEscuela = 1;
    else if (nombreEscuela.includes('Adventista')) idEscuela = 2;
    else if (nombreEscuela.includes('Manyanet'))   idEscuela = 3;

    if (idEscuela) {
      const cantProductos = (PRODUCTOS_POR_ESCUELA[idEscuela] || []).length;
      const lineas = btn.innerHTML.split('\n');
      btn.innerHTML = lineas.map(l => l.includes('productos') ? `${cantProductos} productos\n` : l + '\n').join('');
    }
  });
}

// ─── Tabs del catálogo (compatibilidad) ───────────────────────────

export function initCatalogo() {
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
