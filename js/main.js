// ===================================================================
// RALOZ COL S.A.S — Entry point principal v6.0
// ===================================================================

// Registro del Service Worker (caché offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

import { initRalozIntegration } from './core/api.js';
import { initTiendaOnline } from './modules/tienda.js';
import { actualizarContadoresEscuelas, initCatalogo } from './modules/catalogo.js';
import {
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

document.addEventListener('DOMContentLoaded', () => {
  // Contadores de escuelas en el selector
  actualizarContadoresEscuelas();

  // Módulos de UI (síncrono)
  [
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
  ].forEach(fn => {
    try { fn(); } catch (e) { console.warn('[RALOZ]', fn.name, e); }
  });

  // API y tienda (async, no bloquean el render)
  initRalozIntegration().catch(() => {});
  initTiendaOnline().catch(() => {});
  initRelojes();

  // Event listeners del carrito y checkout
  document.getElementById('carritoBtn')?.addEventListener('click', abrirCarritoPanel);
  document.getElementById('carritoCerrar')?.addEventListener('click', cerrarCarritoPanel);
  document.getElementById('checkoutCerrar')?.addEventListener('click', cerrarCheckout);
  document.getElementById('checkoutOverlay')?.addEventListener('click', cerrarCheckout);
  document.getElementById('carritoCheckout')?.addEventListener('click', abrirCheckout);
  document.getElementById('checkoutForm')?.addEventListener('submit', procesarCheckout);
  document.getElementById('tallaCerrar')?.addEventListener('click', cerrarTallaModal);
  document.getElementById('tallaOverlay')?.addEventListener('click', cerrarTallaModal);
});
