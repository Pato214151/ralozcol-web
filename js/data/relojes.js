// ===================================================================
// DATOS — Catálogo de Relojes RALOZ COL S.A.S
// Actualiza los precios, colores y stock según tu inventario real.
// ===================================================================

export const RELOJES = [
  {
    id_producto: 101,
    codigo: 'REL-EXEC-M',
    nombre: 'Reloj Ejecutivo Caballero',
    descripcion: 'Elegante reloj de cuarzo japonés con correa de acero inoxidable. Resistente al agua 30m. Garantía 1 año.',
    precio_desde: 189000,
    icono: 'fa-solid fa-clock',
    colores: [
      { nombre: 'Negro / Negro',    precio: 189000, stock: 5, hex: '#1a1a1a' },
      { nombre: 'Plateado / Negro', precio: 189000, stock: 3, hex: '#9e9e9e' },
      { nombre: 'Dorado / Café',    precio: 199000, stock: 2, hex: '#d4af37' },
    ],
    destacado: true,
  },
  {
    id_producto: 102,
    codigo: 'REL-DEPORT',
    nombre: 'Reloj Deportivo Multifunción',
    descripcion: 'Cronógrafo, fecha y resistencia al agua 50m. Ideal para uso diario y actividades al aire libre.',
    precio_desde: 145000,
    icono: 'fa-solid fa-stopwatch',
    colores: [
      { nombre: 'Negro / Rojo',   precio: 145000, stock: 8, hex: '#f44336' },
      { nombre: 'Negro / Azul',   precio: 145000, stock: 6, hex: '#1976d2' },
      { nombre: 'Negro / Verde',  precio: 145000, stock: 4, hex: '#388e3c' },
      { nombre: 'Blanco / Negro', precio: 150000, stock: 3, hex: '#f5f5f5' },
    ],
    destacado: true,
  },
  {
    id_producto: 103,
    codigo: 'REL-CLASIC-D',
    nombre: 'Reloj Clásico Dama',
    descripcion: 'Delicado reloj para dama con pulsera de malla metálica. Mecanismo japonés de precisión.',
    precio_desde: 165000,
    icono: 'fa-solid fa-clock',
    colores: [
      { nombre: 'Rosado / Blanco',   precio: 165000, stock: 4, hex: '#e91e8c' },
      { nombre: 'Plateado / Blanco', precio: 165000, stock: 5, hex: '#bdbdbd' },
      { nombre: 'Dorado / Champán',  precio: 175000, stock: 2, hex: '#c8a85a' },
    ],
    destacado: false,
  },
  {
    id_producto: 104,
    codigo: 'REL-SMART',
    nombre: 'Smartwatch Band Pro',
    descripcion: 'Monitor de frecuencia cardíaca, contador de pasos, notificaciones. Batería 7 días. Compatible Android e iOS.',
    precio_desde: 250000,
    icono: 'fa-solid fa-mobile-screen',
    colores: [
      { nombre: 'Negro',      precio: 250000, stock: 6, hex: '#212121' },
      { nombre: 'Azul Marino',precio: 250000, stock: 4, hex: '#1a237e' },
      { nombre: 'Rosa',       precio: 260000, stock: 3, hex: '#e91e63' },
    ],
    destacado: true,
  },
];
