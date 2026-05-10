// ===================================================================
// MÓDULO — Talla modal + Panel carrito + Checkout
// ===================================================================

import { RalozAPI } from '../core/api.js';
import { Carrito } from '../core/carrito.js';
import { formatCOP, mostrarToast, escapeHTML, esPagoUrlSegura } from '../core/utils.js';

// ─── Modal de selección de talla ─────────────────────────────────

export function abrirTallaModal(producto, opts = {}) {
  const esFabricacion = opts.esFabricacion === true;
  const tipoCls       = opts.tipoCls  || 'tpc-tipo-default';
  const iconCls       = opts.iconCls  || 'fa-solid fa-shirt';

  // — Ícono grande con gradiente del tipo de producto —
  const iconArea = document.getElementById('tallaIconArea');
  if (iconArea) {
    iconArea.className = `talla-bs-icon-area ${tipoCls}`;
    iconArea.innerHTML = `<i class="${iconCls}"></i>`;
  }

  // — Nombre y tipo —
  document.getElementById('tallaNombreProducto').textContent = producto.nombre;
  const tipoTag = document.getElementById('tallaTipoTag');
  if (tipoTag) tipoTag.textContent = producto.tipo || '';

  const opciones = document.getElementById('tallaOpciones');
  const footer   = document.getElementById('tallaFooter');

  let selectedTalla  = null;
  let selectedPrecio = null;
  let selectedStock  = 0;

  const tallasUnicas = [...new Map(producto.tallas.map(t => [t.talla, t])).values()];

  const avisoFab = esFabricacion ? `
    <div class="talla-fab-aviso">
      <i class="fa-solid fa-scissors"></i>
      <div>
        <strong>Pedido con anticipación</strong>
        <p>Se fabrica en <strong>1–2 meses</strong>. Abono del <strong>50%</strong> al confirmar.</p>
      </div>
    </div>
  ` : '';

  // — Chips de talla —
  opciones.innerHTML = `
    ${avisoFab}
    <p class="talla-instruccion">Elige tu talla</p>
    <div class="talla-pills" id="tallaPills">
      ${tallasUnicas.map(t => {
        const tallaEsFab = esFabricacion || t.stock === 0;
        const subLabel = tallaEsFab
          ? '<small class="talla-pill-fab">Pedido</small>'
          : t.stock > 0 && t.stock < 5
            ? `<small class="talla-pill-ok">¡${t.stock}!</small>`
            : '';
        return `
          <button class="talla-pill${tallaEsFab ? ' talla-pill-anticipo' : ''}"
            data-talla="${t.talla}" data-precio="${t.precio}"
            data-stock="${t.stock}" data-fab="${tallaEsFab}">
            <span class="talla-pill-val">${t.talla}</span>
            ${subLabel}
          </button>
        `;
      }).join('')}
    </div>
    <div class="talla-seleccion-detalle" id="tallaDetalle" style="display:none;">
      <div class="tsd-top">
        <div class="tsd-precio-wrap">
          <span class="tsd-label">Precio</span>
          <span class="tsd-precio" id="tallaPrecioDisplay"></span>
        </div>
        <div id="tallaStockInfo" class="tsd-stock-info"></div>
      </div>
      <div class="tsd-cantidad-wrap">
        <span class="tsd-label">Cantidad</span>
        <div class="tsd-cantidad">
          <button class="talla-qty-btn" id="tallaMenos" aria-label="Menos">−</button>
          <span class="talla-cant-val" id="tallaCantVal">1</span>
          <button class="talla-qty-btn" id="tallaMas" aria-label="Más">+</button>
        </div>
      </div>
    </div>
  `;

  // — Botón sticky en el footer (fuera del área scrollable) —
  footer.innerHTML = `
    <button class="btn-talla-add" id="btnTallaAdd" disabled>
      <i class="fa-solid fa-cart-plus"></i>
      <span>Elige una talla</span>
    </button>
  `;

  // — Lógica de selección de talla —
  opciones.querySelectorAll('.talla-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      opciones.querySelectorAll('.talla-pill').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedTalla  = btn.dataset.talla;
      selectedPrecio = parseFloat(btn.dataset.precio);
      selectedStock  = parseInt(btn.dataset.stock) || 0;
      const tallaEsFab = btn.dataset.fab === 'true';

      // Mostrar detalle con animación
      const detalle = document.getElementById('tallaDetalle');
      document.getElementById('tallaPrecioDisplay').textContent = formatCOP(selectedPrecio);
      document.getElementById('tallaCantVal').textContent = '1';
      detalle.style.display = 'flex';

      // Info de disponibilidad
      const info = document.getElementById('tallaStockInfo');
      if (tallaEsFab) {
        info.innerHTML = `<span class="tsd-stock-fab"><i class="fa-solid fa-scissors"></i> Bajo pedido · 1–2 meses</span>`;
      } else if (selectedStock > 0) {
        info.innerHTML = `<span class="tsd-stock-ok"><i class="fa-solid fa-check-circle"></i> ${selectedStock} disponibles · Entrega inmediata</span>`;
      } else {
        info.innerHTML = '';
      }

      // Actualizar botón sticky
      const btnAdd = document.getElementById('btnTallaAdd');
      btnAdd.disabled = false;
      if (tallaEsFab) {
        btnAdd.className = 'btn-talla-add btn-talla-fab';
        btnAdd.innerHTML = '<i class="fa-solid fa-scissors"></i><span>Agregar pedido anticipado</span>';
      } else {
        btnAdd.className = 'btn-talla-add';
        btnAdd.innerHTML = '<i class="fa-solid fa-cart-plus"></i><span>Agregar al carrito</span>';
      }
    });
  });

  // — Cantidad —
  document.getElementById('tallaMenos').addEventListener('click', () => {
    const el = document.getElementById('tallaCantVal');
    const v = parseInt(el.textContent);
    if (v > 1) el.textContent = v - 1;
  });
  document.getElementById('tallaMas').addEventListener('click', () => {
    const el  = document.getElementById('tallaCantVal');
    const cur = parseInt(el.textContent);
    const max = selectedStock > 0 ? Math.min(selectedStock, 20) : 20;
    if (cur < max) el.textContent = cur + 1;
  });

  // — Agregar al carrito —
  document.getElementById('btnTallaAdd').addEventListener('click', async () => {
    if (!selectedTalla) return;
    const cant       = parseInt(document.getElementById('tallaCantVal').textContent);
    const btnAdd     = document.getElementById('btnTallaAdd');
    const tallaEsFab = opciones.querySelector('.talla-pill.selected')?.dataset.fab === 'true';
    opciones.querySelector('#tallaReservaError')?.remove();

    if (tallaEsFab) {
      Carrito.agregar({
        id_producto: producto.id_producto, nombre: producto.nombre,
        talla: selectedTalla, cantidad: cant, precio: selectedPrecio,
        tipo_pedido: 'fabricacion', stock_disponible: 0,
      });
      cerrarTallaModal();
      mostrarToast(`🪡 ${producto.nombre} — T.${selectedTalla} añadido`);
      return;
    }

    if (cant > selectedStock) {
      Carrito.agregar({
        id_producto: producto.id_producto, nombre: producto.nombre,
        talla: selectedTalla, cantidad: cant, precio: selectedPrecio,
        tipo_pedido: 'mixto', stock_disponible: selectedStock,
      });
      cerrarTallaModal();
      mostrarToast(`${producto.nombre} T.${selectedTalla} ×${cant} (${selectedStock} inmediato + ${cant - selectedStock} 🪡)`);
      return;
    }

    // Reserva normal con stock
    btnAdd.disabled = true;
    btnAdd.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Reservando...</span>';

    try {
      const resp = await RalozAPI.reservar({
        session_id: Carrito.sessionId, id_colegio: Carrito.colegio_id,
        id_producto: producto.id_producto, talla: selectedTalla, cantidad: cant,
      });
      Carrito.agregar({
        id_producto: producto.id_producto, nombre: producto.nombre,
        talla: selectedTalla, cantidad: cant, precio: selectedPrecio,
        id_reserva: resp.id_reserva, tipo_pedido: 'normal', stock_disponible: selectedStock,
      });
      cerrarTallaModal();
      mostrarToast(`${producto.nombre} — T.${selectedTalla} agregado ✓`);
    } catch (err) {
      btnAdd.disabled = false;
      btnAdd.className = 'btn-talla-add';
      btnAdd.innerHTML = '<i class="fa-solid fa-cart-plus"></i><span>Agregar al carrito</span>';
      const msg = err.message?.toLowerCase().includes('stock')
        ? '⚠️ Sin stock para esta talla'
        : `⚠️ ${err.message || 'Error al reservar, intenta de nuevo'}`;
      const errEl = document.createElement('p');
      errEl.id = 'tallaReservaError';
      errEl.className = 'talla-reserva-error';
      errEl.textContent = msg;
      opciones.appendChild(errEl);
    }
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
      <div class="ci-img"><i class="fa-solid ${i.categoria === 'relojes' ? 'fa-clock' : 'fa-shirt'}"></i></div>
      <div class="ci-info">
        <span class="ci-nombre">${i.nombre}</span>
        <span class="ci-detalle">${i.categoria === 'relojes' ? 'Color' : 'Talla'} ${i.talla} · ${formatCOP(i.precio)} c/u · ×${i.cantidad}</span>
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

  const items = Carrito.items;

  // Calcular montos por tipo
  const totalNormal   = items.filter(i => i.tipo_pedido === 'normal')
    .reduce((s, i) => s + i.precio * i.cantidad, 0);
  const totalFab      = items.filter(i => i.tipo_pedido === 'fabricacion')
    .reduce((s, i) => s + i.precio * i.cantidad, 0);
  const itemsMixtos   = items.filter(i => i.tipo_pedido === 'mixto');
  const totalMixtoInm = itemsMixtos.reduce((s, i) => s + i.precio * (i.stock_disponible || 0), 0);
  const totalMixtoFab = itemsMixtos.reduce((s, i) => s + i.precio * (i.cantidad - (i.stock_disponible || 0)), 0);
  const totalGeneral  = totalNormal + totalFab + totalMixtoInm + totalMixtoFab;
  const montoFab      = totalFab + totalMixtoFab;   // porción que puede llevar abono
  const tieneFab      = montoFab > 0;
  const tieneMixto    = itemsMixtos.length > 0;

  // Resumen de items
  const resumen = document.getElementById('checkoutResumenItems');
  resumen.innerHTML = items.map(i => {
    let tag = '';
    if (i.tipo_pedido === 'fabricacion') tag = ' 🪡';
    else if (i.tipo_pedido === 'mixto') {
      const inm = i.stock_disponible || 0;
      tag = ` (${inm} inmediato + ${i.cantidad - inm} 🪡)`;
    }
    return `
      <div class="checkout-item">
        <span>${i.nombre} ${i.categoria === 'relojes' ? 'Color' : 'T.'} ${i.talla} ×${i.cantidad}${tag}</span>
        <span>${formatCOP(i.precio * i.cantidad)}</span>
      </div>
    `;
  }).join('');

  // Selectores dinámicos de pago
  const abonoWrap = document.getElementById('checkoutAbonoWrap');
  if (abonoWrap) {
    let html = '';

    // Aviso fijo para ítems mixtos: siempre se envía todo junto
    if (tieneMixto) {
      const unidInm = itemsMixtos.reduce((s, i) => s + (i.stock_disponible || 0), 0);
      const unidFab = itemsMixtos.reduce((s, i) => s + (i.cantidad - (i.stock_disponible || 0)), 0);
      html += `
        <div class="ck-abono-wrap" style="margin-bottom:12px;">
          <p>
            <i class="fa-solid fa-box-open"></i>
            Tienes <strong>${unidInm}</strong> unidad${unidInm !== 1 ? 'es' : ''} disponible${unidInm !== 1 ? 's' : ''}
            y <strong>${unidFab}</strong> por fabricar.
            <strong>Todo se enviará junto cuando esté completo el pedido.</strong>
          </p>
        </div>
      `;
    }

    // Selector abono 50% / 100% (solo si hay porción de fabricación)
    if (tieneFab) {
      const abono50        = Math.round(montoFab * 0.5);
      const totalConAbono  = totalNormal + totalMixtoInm + abono50;
      const totalCompleto  = totalGeneral;
      html += `
        <div class="ck-abono-wrap">
          <p>🪡 Tu pedido incluye <strong>${formatCOP(montoFab)}</strong> en prendas por fabricación.
             Elige cómo pagar esa parte:</p>
          <div class="ck-abono-opciones">
            <button class="ck-abono-btn selected" data-pct="50">
              <span class="abono-pct">Abono 50%</span>
              <span class="abono-monto">${formatCOP(totalConAbono)} ahora · ${formatCOP(montoFab - abono50)} al recoger</span>
            </button>
            <button class="ck-abono-btn" data-pct="100">
              <span class="abono-pct">Pago total</span>
              <span class="abono-monto">${formatCOP(totalCompleto)} ahora · sin saldo pendiente</span>
            </button>
          </div>
          <p class="ck-politica-nota">
            <i class="fa-solid fa-circle-info"></i>
            El saldo restante se paga <strong>antes del envío o al recoger en tienda</strong>.
            Recibirás confirmación por WhatsApp con tu número de pedido.
          </p>
        </div>
      `;
    }

    if (html) {
      abonoWrap.style.display = 'block';
      abonoWrap.innerHTML = html;
      // Solo el selector de abono actualiza el total
      abonoWrap.querySelectorAll('.ck-abono-btn[data-pct]').forEach(btn => {
        btn.addEventListener('click', () => {
          btn.closest('.ck-abono-opciones').querySelectorAll('.ck-abono-btn')
            .forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          const pct      = parseInt(btn.dataset.pct);
          const abono50  = Math.round(montoFab * 0.5);
          const nuevo    = pct === 50 ? totalNormal + totalMixtoInm + abono50 : totalGeneral;
          document.getElementById('checkoutTotalDisplay').textContent = formatCOP(nuevo);
        });
      });
    } else {
      abonoWrap.style.display = 'none';
    }
  }

  // Inicializar total: si hay fabricación y el abono 50% está pre-seleccionado, mostrar el monto de ahora
  const totalInicial = tieneFab
    ? totalNormal + totalMixtoInm + Math.round(montoFab * 0.5)
    : totalGeneral;
  document.getElementById('checkoutTotalDisplay').textContent = formatCOP(totalInicial);
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

  const terminos = document.getElementById('ck-terminos');
  if (!terminos?.checked) {
    _checkoutError(errorEl, 'Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.');
    return;
  }

  if (!nombre || !email || !telefono) {
    _checkoutError(errorEl, 'Por favor completa todos los campos requeridos.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    _checkoutError(errorEl, 'El correo electrónico no parece válido.');
    return;
  }

  const telRegex = /^[\d\s\+\-\(\)]{7,15}$/;
  if (!telRegex.test(telefono)) {
    _checkoutError(errorEl, 'El teléfono debe tener entre 7 y 15 dígitos.');
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

  const abonoBtn = document.querySelector('.ck-abono-btn[data-pct].selected');
  const abonoPct = abonoBtn ? parseInt(abonoBtn.dataset.pct) : 100;
  const direccion = document.getElementById('ck-direccion')?.value?.trim() || '';

  const payload = {
    nombre_cliente:    nombre,
    email_cliente:     email,
    telefono_cliente:  telefono,
    documento_cliente: documento,
    direccion_envio:   direccion,
    id_colegio:        Carrito.colegio_id,
    abono_porcentaje:  abonoPct,
    items: Carrito.items.map(i => ({
      id_producto:      i.id_producto,
      nombre:           i.nombre,
      talla:            i.talla,
      cantidad:         i.cantidad,
      precio:           i.precio,
      unit_price:       i.precio,
      id_reserva:       i.id_reserva       || null,
      tipo_pedido:      i.tipo_pedido      || 'normal',
      stock_disponible: i.stock_disponible || 0,
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
    if (!esPagoUrlSegura(resp.pago_url)) {
      console.error('[SECURITY] pago_url inválida rechazada:', resp.pago_url);
      _checkoutError(errorEl, 'Error de seguridad: URL de pago inválida. Por favor contáctanos.', true);
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-lock"></i> Ir a pagar con MercadoPago';
      return;
    }
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
  el.textContent = msg;
  if (withWA) {
    el.textContent += ' ';
    const a = document.createElement('a');
    a.href = 'https://wa.me/573213412903';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.cssText = 'color:inherit;font-weight:700;';
    a.textContent = 'Escribir por WhatsApp →';
    el.appendChild(a);
  }
  el.style.display = 'block';
}

function _checkoutOk(el, msg) {
  el.style.background = '#e8f5e9';
  el.style.color = '#2e7d32';
  el.style.border = '1px solid #a5d6a7';
  el.textContent = msg;
  el.style.display = 'block';
}
