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
  initSmoothScroll,
  initScrollAnimations,
  initActiveNavIndicator,
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
function initPagoRetorno() {
  const params = new URLSearchParams(window.location.search);
  const estado = params.get('estado');
  const ref    = params.get('ref') || params.get('external_reference');
  if (!estado) return;

  // Limpiar la URL sin recargar la página
  history.replaceState({}, '', window.location.pathname);

  // Configuración del mensaje según estado
  const configs = {
    aprobado: {
      icon: '✅',
      titulo: '¡Pago recibido!',
      msg: ref
        ? `Tu pedido <strong>${ref}</strong> está confirmado. Recibirás un correo con los detalles.`
        : 'Tu pedido está confirmado. Recibirás un correo con los detalles.',
      color: '#00b09b',
      vaciar: true,
    },
    pendiente: {
      icon: '⏳',
      titulo: 'Pago pendiente',
      msg: ref
        ? `Tu pago para el pedido <strong>${ref}</strong> está en proceso. Te notificaremos cuando se confirme.`
        : 'Tu pago está en proceso. Te notificaremos cuando se confirme.',
      color: '#f39c12',
      vaciar: false,
    },
    fallido: {
      icon: '❌',
      titulo: 'Pago no completado',
      msg: 'Hubo un problema con el pago. Puedes intentarlo de nuevo o contactarnos por WhatsApp.',
      color: '#e74c3c',
      vaciar: false,
    },
  };

  const cfg = configs[estado] || configs.fallido;
  if (cfg.vaciar) Carrito.vaciar();

  // Crear modal de confirmación
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';

  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:20px;padding:36px 28px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2)';
  box.innerHTML = `
    <div style="font-size:3rem;margin-bottom:12px">${cfg.icon}</div>
    <h2 style="margin:0 0 10px;font-size:1.4rem;color:#1a1a2e">${cfg.titulo}</h2>
    <p style="margin:0 0 24px;color:#555;font-size:0.95rem;line-height:1.5">${cfg.msg}</p>
    <button id="btnCerrarPago" style="background:${cfg.color};color:#fff;border:none;border-radius:12px;padding:12px 32px;font-size:1rem;font-weight:700;cursor:pointer;width:100%">
      Entendido
    </button>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const cerrar = () => overlay.remove();
  document.getElementById('btnCerrarPago')?.addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
}

document.addEventListener('DOMContentLoaded', () => {
  // Contadores de escuelas en el selector
  actualizarContadoresEscuelas();

  // Módulos de UI (síncrono)
  [
    initNavDropdown,
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
