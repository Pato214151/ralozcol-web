// ===================================================================
// CORE — Estado global del carrito de la tienda online
// ===================================================================

import { formatCOP } from './utils.js';

export const Carrito = {
  items: [],           // [{id_producto, nombre, talla, cantidad, precio}]
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
