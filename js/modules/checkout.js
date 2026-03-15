// ===================================================================
// MÓDULO — Talla modal + Panel carrito + Checkout
// ===================================================================

import { RalozAPI } from '../core/api.js';
import { Carrito } from '../core/carrito.js';
import { formatCOP, mostrarToast } from '../core/utils.js';

// ─── Modal de selección de talla ─────────────────────────────────

export function abrirTallaModal(producto) {
  document.getElementById('tallaNombreProducto').textContent = producto.nombre;
  const opciones = document.getElementById('tallaOpciones');

  let selectedTalla  = null;
  let selectedPrecio = null;
  let selectedMax    = 0;

  // Deduplicar tallas por clave (primera aparición de cada talla)
  const tallasUnicas = [...new Map(producto.tallas.map(t => [t.talla, t])).values()];

  opciones.innerHTML = `
    <p class="talla-instruccion">Elige la talla:</p>
    <div class="talla-pills" id="tallaPills">
      ${tallasUnicas.map(t => `
        <button class="talla-pill${t.stock === 0 ? ' agotado' : ''}"
          data-talla="${t.talla}" data-precio="${t.precio}" data-max="${t.stock}"
          ${t.stock === 0 ? 'disabled' : ''}>
          ${t.talla}${t.stock === 0 ? '<br><small>Agotado</small>' : ''}
        </button>
      `).join('')}
    </div>

    <div class="talla-seleccion-detalle" id="tallaDetalle" style="display:none;">
      <div class="tsd-precio-wrap">
        <span class="tsd-label">Precio:</span>
        <span class="tsd-precio" id="tallaPrecioDisplay"></span>
      </div>
      <div class="tsd-cantidad-wrap">
        <span class="tsd-label">Cantidad:</span>
        <div class="tsd-cantidad">
          <button class="talla-menos" id="tallaMenos">−</button>
          <span class="talla-cant-val" id="tallaCantVal">1</span>
          <button class="talla-mas" id="tallaMas">+</button>
        </div>
      </div>
    </div>

    <button class="btn-talla-add" id="btnTallaAdd" style="display:none;">
      <i class="fa-solid fa-cart-plus"></i> Agregar al carrito
    </button>
  `;

  // Selección de talla
  opciones.querySelectorAll('.talla-pill:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      opciones.querySelectorAll('.talla-pill').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTalla  = btn.dataset.talla;
      selectedPrecio = parseFloat(btn.dataset.precio);
      selectedMax    = parseInt(btn.dataset.max);

      document.getElementById('tallaPrecioDisplay').textContent = formatCOP(selectedPrecio);
      document.getElementById('tallaCantVal').textContent = '1';
      document.getElementById('tallaDetalle').style.display = 'flex';
      document.getElementById('btnTallaAdd').style.display  = 'flex';
    });
  });

  // Cantidad
  document.getElementById('tallaMenos').addEventListener('click', () => {
    const el = document.getElementById('tallaCantVal');
    const v = parseInt(el.textContent);
    if (v > 1) el.textContent = v - 1;
  });
  document.getElementById('tallaMas').addEventListener('click', () => {
    const el = document.getElementById('tallaCantVal');
    const v = parseInt(el.textContent);
    if (v < selectedMax) el.textContent = v + 1;
  });

  // Agregar al carrito
  document.getElementById('btnTallaAdd').addEventListener('click', () => {
    if (!selectedTalla) return;
    const cant = parseInt(document.getElementById('tallaCantVal').textContent);
    Carrito.agregar({
      id_producto: producto.id_producto,
      nombre:      producto.nombre,
      talla:       selectedTalla,
      cantidad:    cant,
      precio:      selectedPrecio,
    });
    cerrarTallaModal();
    mostrarToast(`${producto.nombre} — Talla ${selectedTalla} agregado ✓`);
  });

  document.getElementById('tallaModal').style.display   = 'flex';
  document.getElementById('tallaOverlay').style.display = 'block';
}

export function cerrarTallaModal() {
  document.getElementById('tallaModal').style.display   = 'none';
  document.getElementById('tallaOverlay').style.display = 'none';
}

// ─── Panel del carrito ────────────────────────────────────────────

export function abrirCarritoPanel() {
  renderCarritoPanel();
  document.getElementById('carritoPanel').style.display = 'flex';
}

export function cerrarCarritoPanel() {
  document.getElementById('carritoPanel').style.display = 'none';
}

function renderCarritoPanel() {
  const items  = document.getElementById('carritoItems');
  const footer = document.getElementById('carritoPanelFooter');
  const total  = document.getElementById('carritoTotal');

  if (!Carrito.items.length) {
    items.innerHTML = '<p class="carrito-empty"><i class="fa-solid fa-cart-shopping"></i><br>Tu carrito está vacío</p>';
    footer.style.display = 'none';
    return;
  }

  items.innerHTML = Carrito.items.map(i => `
    <div class="carrito-item">
      <div class="ci-img"><i class="fa-solid fa-shirt"></i></div>
      <div class="ci-info">
        <span class="ci-nombre">${i.nombre}</span>
        <span class="ci-detalle">Talla ${i.talla} · ${formatCOP(i.precio)} c/u · ×${i.cantidad}</span>
      </div>
      <div class="ci-acciones">
        <span class="ci-subtotal">${formatCOP(i.precio * i.cantidad)}</span>
        <button class="ci-quitar" data-id="${i.id_producto}" data-talla="${i.talla}" aria-label="Quitar">Eliminar</button>
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

// ─── Checkout ────────────────────────────────────────────────────

export function abrirCheckout() {
  cerrarCarritoPanel();

  const resumen = document.getElementById('checkoutResumenItems');
  resumen.innerHTML = Carrito.items.map(i => `
    <div class="checkout-item">
      <span>${i.nombre} T.${i.talla} ×${i.cantidad}</span>
      <span>${formatCOP(i.precio * i.cantidad)}</span>
    </div>
  `).join('');
  document.getElementById('checkoutTotalDisplay').textContent = formatCOP(Carrito.total());

  document.getElementById('checkoutModal').style.display   = 'flex';
  document.getElementById('checkoutOverlay').style.display = 'block';
  document.getElementById('checkoutError').style.display   = 'none';
}

export function cerrarCheckout() {
  document.getElementById('checkoutModal').style.display   = 'none';
  document.getElementById('checkoutOverlay').style.display = 'none';
}

export async function procesarCheckout(e) {
  e.preventDefault();
  const btn     = document.getElementById('checkoutPagarBtn');
  const errorEl = document.getElementById('checkoutError');

  const nombre    = document.getElementById('ck-nombre').value.trim();
  const email     = document.getElementById('ck-email').value.trim();
  const telefono  = document.getElementById('ck-telefono').value.trim();
  const documento = document.getElementById('ck-documento').value.trim();

  if (!nombre || !email || !telefono) {
    _checkoutError(errorEl, 'Por favor completa todos los campos requeridos.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creando tu pedido...';
  errorEl.style.display = 'none';

  // Mensaje de espera si el servidor tarda (Render cold start)
  const msgTimer = setTimeout(() => {
    if (btn.disabled) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> El servidor está respondiendo, espera un momento...';
    }
  }, 8000);

  const payload = {
    nombre_cliente:    nombre,
    email_cliente:     email,
    telefono_cliente:  telefono,
    documento_cliente: documento,
    id_colegio:        Carrito.colegio_id,
    items: Carrito.items.map(i => ({
      id_producto: i.id_producto,
      nombre:      i.nombre,
      talla:       i.talla,
      cantidad:    i.cantidad,
      precio:      i.precio,
      unit_price:  i.precio,
    })),
  };

  let resp = null;
  let lastErr = null;

  // Hasta 2 intentos (por si el primer timeout coincide con cold start)
  for (let intento = 1; intento <= 2; intento++) {
    try {
      resp = await RalozAPI.crearPedido(payload);
      break;
    } catch (err) {
      lastErr = err;
      if (intento === 1) {
        // Pequeña pausa antes del reintento
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reintentando conexión...';
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  clearTimeout(msgTimer);

  if (!resp) {
    _checkoutError(
      errorEl,
      `No se pudo conectar con el servidor${lastErr?.message ? ': ' + lastErr.message : ''}. Intenta de nuevo o contáctanos por WhatsApp.`,
      true
    );
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> Ir a pagar con MercadoPago';
    return;
  }

  Carrito.vaciar();

  if (resp.pago_url) {
    btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Redirigiendo a MercadoPago...';
    window.location.href = resp.pago_url;
  } else {
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Pedido registrado';
    _checkoutOk(
      errorEl,
      `Pedido #${resp.pedido?.referencia ?? '—'} registrado. Te contactaremos para coordinar el pago.`
    );
  }
}

function _checkoutError(el, msg, withWA = false) {
  el.style.cssText = '';
  el.innerHTML = msg + (withWA
    ? ' <a href="https://wa.me/573213412903" target="_blank" rel="noopener" style="color:inherit;font-weight:700;">Escribir por WhatsApp →</a>'
    : '');
  el.style.display = 'block';
}

function _checkoutOk(el, msg) {
  el.style.background = '#e8f5e9';
  el.style.color = '#2e7d32';
  el.style.border = '1px solid #a5d6a7';
  el.textContent = msg;
  el.style.display = 'block';
}
