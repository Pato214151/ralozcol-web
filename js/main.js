// ===================================================================
// RALOZ COL S.A.S — Entry point principal v6.0
// ===================================================================

// Registro del Service Worker (caché offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
  // Cuando el SW se actualiza avisa con SW_UPDATED → recarga para
  // que el usuario vea inmediatamente el CSS/JS nuevo sin Ctrl+Shift+R
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'SW_UPDATED') window.location.reload();
  });
}

import { initRalozIntegration } from './core/api.js';
import { Carrito } from './core/carrito.js';
import { initTiendaOnline } from './modules/tienda.js';
import { actualizarContadoresEscuelas, initCatalogo } from './modules/catalogo.js';
import {
  initNavDropdown,
  initMobileMenu,
  initSPARouter,
  initNavScroll,
  initBackToTop,
  initCounters,
  initFormMonitoring,
  initFAQ,
  initOfflineDetection,
  initWhatsAppThrottle,
  initImagePreload,
  initContactForm,
  initStickyCTA,
} from './modules/ui.js';
import {
  abrirCarritoPanel,
  cerrarCarritoPanel,
  abrirCheckout,
  cerrarCheckout,
  procesarCheckout,
  cerrarTallaModal,
} from './modules/checkout.js';

import { initRelojes } from './modules/relojes.js';

// Los siguientes módulos registran funciones en window.* al importarse
import './modules/cotizador.js';
import './modules/lookbook.js';

// ===================================================================
// INICIALIZACIÓN
// ===================================================================

// ===================================================================
// RETORNO DE MERCADOPAGO — muestra mensaje al cliente tras el pago
// ===================================================================
function _crearModalPago() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:20px;padding:36px 28px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  return { overlay, box };
}

function _renderModalPago(box, overlay, { icon, titulo, msg, color, withWA = false }) {
  const waLink = withWA
    ? `<a href="https://wa.me/573213412903" target="_blank" rel="noopener noreferrer"
         style="display:block;margin-top:10px;color:#25d366;font-weight:700;font-size:0.9rem;">
         Escribir por WhatsApp →
       </a>`
    : '';
  box.innerHTML = `
    <div style="font-size:3rem;margin-bottom:12px">${icon}</div>
    <h2 style="margin:0 0 10px;font-size:1.4rem;color:#1a1a2e">${titulo}</h2>
    <p style="margin:0 0 6px;color:#555;font-size:0.95rem;line-height:1.5">${msg}</p>
    ${waLink}
    <button id="btnCerrarPago"
      style="margin-top:20px;background:${color};color:#fff;border:none;border-radius:12px;padding:12px 32px;font-size:1rem;font-weight:700;cursor:pointer;width:100%">
      Entendido
    </button>
  `;
  box.querySelector('#btnCerrarPago')?.addEventListener('click', () => overlay.remove());
}

async function initPagoRetorno() {
  const params = new URLSearchParams(window.location.search);
  const estado = params.get('estado');
  const ref    = params.get('ref') || params.get('external_reference');
  if (!estado) return;

  history.replaceState({}, '', window.location.pathname);

  const { overlay, box } = _crearModalPago();

  // Estados que no son aprobado: mostrar directo sin polling
  if (estado === 'fallido') {
    _renderModalPago(box, overlay, {
      icon: '❌', titulo: 'Pago no completado', color: '#e74c3c',
      msg: 'Hubo un problema con el pago. Puedes intentarlo de nuevo o contactarnos.',
      withWA: true,
    });
    return;
  }

  if (estado === 'pendiente') {
    _renderModalPago(box, overlay, {
      icon: '⏳', titulo: 'Pago pendiente', color: '#f39c12',
      msg: ref
        ? `Tu pago para el pedido <strong>${ref}</strong> está en proceso. Te avisaremos cuando se confirme.`
        : 'Tu pago está en proceso. Te avisaremos cuando se confirme.',
    });
    return;
  }

  // estado === 'aprobado': hacer polling hasta que el backend confirme
  // (el webhook puede llegar unos segundos después del redirect de MP)
  box.innerHTML = `
    <div style="font-size:3rem;margin-bottom:12px">⏳</div>
    <h2 style="margin:0 0 10px;font-size:1.4rem;color:#1a1a2e">Verificando tu pago…</h2>
    <p style="color:#555;font-size:0.95rem">Estamos confirmando tu pedido con MercadoPago.</p>
  `;

  const MAX_INTENTOS = 15;   // 15 × 2s = 30 s máximo
  const INTERVALO_MS = 2000;
  let confirmado = false;

  for (let i = 0; i < MAX_INTENTOS; i++) {
    await new Promise(r => setTimeout(r, INTERVALO_MS));
    try {
      if (ref) {
        const data = await RalozAPI.consultarPedido(ref);
        const estadoPedido = data?.pedido?.estado;
        if (estadoPedido === 'pagado') { confirmado = true; break; }
        if (estadoPedido === 'fallido') {
          _renderModalPago(box, overlay, {
            icon: '❌', titulo: 'Pago rechazado', color: '#e74c3c',
            msg: 'El pago no fue aprobado. Puedes intentarlo de nuevo o contactarnos.',
            withWA: true,
          });
          return;
        }
      }
    } catch { /* red inestable, seguir esperando */ }
  }

  Carrito.vaciar();

  if (confirmado) {
    _renderModalPago(box, overlay, {
      icon: '✅', titulo: '¡Pedido confirmado!', color: '#00b09b',
      msg: ref
        ? `Tu pedido <strong>${ref}</strong> está confirmado.
           Recibirás la factura en tu correo durante el transcurso del día.`
        : 'Tu pedido está confirmado. Recibirás la factura en tu correo durante el transcurso del día.',
    });
  } else {
    // Webhook tardó más de 30s (Render cold start extremo o red lenta)
    _renderModalPago(box, overlay, {
      icon: '⏳', titulo: 'Pago en proceso', color: '#f39c12',
      msg: ref
        ? `Tu pago para el pedido <strong>${ref}</strong> está siendo verificado.
           Recibirás la factura por correo una vez confirmado (puede tardar unos minutos).`
        : 'Tu pago está siendo verificado. Recibirás la factura por correo cuando se confirme.',
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Contadores de escuelas en el selector
  actualizarContadoresEscuelas();

  // Módulos de UI (síncrono)
  [
    initNavDropdown,
    initMobileMenu,
    initSPARouter,
    initNavScroll,
    initBackToTop,
    initCounters,
    initFormMonitoring,
    initCatalogo,
    initFAQ,
    initOfflineDetection,
    initWhatsAppThrottle,
    initImagePreload,
    initContactForm,
    initStickyCTA,
  ].forEach(fn => {
    try { fn(); } catch (e) { console.warn('[RALOZ]', fn.name, e); }
  });

  // Retorno de MercadoPago — mostrar mensaje y limpiar carrito si fue exitoso
  initPagoRetorno();

  // API y tienda (async, no bloquean el render)
  initRalozIntegration().catch(() => {});
  initTiendaOnline().catch(() => {});
  initRelojes();

  // Event listeners del carrito y checkout
  document.getElementById('carritoBtn')?.addEventListener('click', abrirCarritoPanel);
  document.getElementById('navCarritoBtn')?.addEventListener('click', abrirCarritoPanel);
  document.getElementById('carritoCerrar')?.addEventListener('click', cerrarCarritoPanel);
  document.getElementById('checkoutCerrar')?.addEventListener('click', cerrarCheckout);
  document.getElementById('checkoutOverlay')?.addEventListener('click', cerrarCheckout);
  document.getElementById('carritoCheckout')?.addEventListener('click', abrirCheckout);
  document.getElementById('checkoutForm')?.addEventListener('submit', procesarCheckout);
  document.getElementById('tallaCerrar')?.addEventListener('click', cerrarTallaModal);
  document.getElementById('tallaOverlay')?.addEventListener('click', cerrarTallaModal);
  document.getElementById('tallaModal')?.addEventListener('click', e => {
    if (!e.target.closest('.talla-modal-inner')) cerrarTallaModal();
  });
});
