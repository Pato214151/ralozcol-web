// ===================================================================
// CORE — Utilidades compartidas
// ===================================================================

import { PRECIOS } from '../data/precios.js';
import { PRODUCTOS, PRODUCTOS_POR_ESCUELA } from '../data/productos.js';

/** Formatea número como precio en COP */
export function formatCOP(value) {
  return '$' + Math.round(value).toLocaleString('es-CO');
}

/** Obtiene el precio mínimo de un producto en una escuela */
export function obtenerPrecioMinimo(escuelaId, productoId) {
  if (!PRECIOS[escuelaId] || !PRECIOS[escuelaId][productoId]) return 0;
  return Math.min(...Object.values(PRECIOS[escuelaId][productoId]));
}

/** Obtiene tallas disponibles para un producto en una escuela */
export function obtenerTallas(escuelaId, productoId) {
  if (!PRECIOS[escuelaId] || !PRECIOS[escuelaId][productoId]) return [];
  return Object.keys(PRECIOS[escuelaId][productoId]);
}

/** Obtiene el precio de una talla específica */
export function obtenerPrecio(escuelaId, productoId, talla) {
  if (!PRECIOS[escuelaId] || !PRECIOS[escuelaId][productoId]) return 0;
  return PRECIOS[escuelaId][productoId][talla] || 0;
}

/** Obtiene los productos disponibles para una escuela */
export function obtenerProductosEscuela(idEscuela) {
  const idsProductos = PRODUCTOS_POR_ESCUELA[idEscuela] || [];
  return idsProductos.map(id => PRODUCTOS[id]).filter(p => p);
}

/** Hace scroll suave a una sección descontando la altura del nav */
export function scrollToSection(target) {
  if (!target) return;
  const nav = document.querySelector('nav');
  const navHeight = nav ? nav.offsetHeight : 0;
  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + window.scrollY;
  window.scrollTo({ top: absoluteTop - navHeight - 8, behavior: 'smooth' });
}

/** Muestra una notificación flotante */
export function showNotification(message, type = 'info') {
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

/** Muestra un toast de confirmación */
export function mostrarToast(msg) {
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
