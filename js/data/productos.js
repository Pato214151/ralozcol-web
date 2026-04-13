// ===================================================================
// DATOS — Productos y mapeo por escuela
// ===================================================================

export const PRODUCTOS = {
  1:  { id: 1,  codigo: 'PD-NINO',         nombre: 'Pantalón Diario Niño',                    tipo: 'Diario Niño',  icon: 'fa-solid fa-person' },
  2:  { id: 2,  codigo: 'CC-NINO',         nombre: 'Camisa Cuello Niño',                      tipo: 'Diario Niño',  icon: 'fa-solid fa-shirt' },
  3:  { id: 3,  codigo: 'BLAZER',          nombre: 'Blazer',                                  tipo: 'Diario',       icon: 'fa-solid fa-vest' },
  4:  { id: 4,  codigo: 'CHALECO',         nombre: 'Chaleco',                                 tipo: 'Diario',       icon: 'fa-solid fa-vest-patches' },
  5:  { id: 5,  codigo: 'CHQ-DIARIO',      nombre: 'Chaqueta Diario',                         tipo: 'Diario',       icon: 'fa-solid fa-jacket' },
  6:  { id: 6,  codigo: 'JARDINERA',       nombre: 'Jardinera Niña',                          tipo: 'Diario Niña',  icon: 'fa-solid fa-person-dress' },
  7:  { id: 7,  codigo: 'BLUSA',           nombre: 'Blusa Niña',                              tipo: 'Diario Niña',  icon: 'fa-solid fa-shirt' },
  8:  { id: 8,  codigo: 'PANT-EDU',        nombre: 'Pantalón Educación Física',               tipo: 'Ed. Física',   icon: 'fa-solid fa-person-running' },
  9:  { id: 9,  codigo: 'CAMISETA',        nombre: 'Camiseta Ed. Física',                     tipo: 'Ed. Física',   icon: 'fa-solid fa-shirt' },
  10: { id: 10, codigo: 'CHQ-EDU',         nombre: 'Chaqueta Ed. Física',                     tipo: 'Ed. Física',   icon: 'fa-solid fa-person-running' },
  11: { id: 11, codigo: 'PANTALONETA',     nombre: 'Pantaloneta',                             tipo: 'Ed. Física',   icon: 'fa-solid fa-person-running' },
  12: { id: 12, codigo: 'MEDIAS',          nombre: 'Medias Ed. Física',                       tipo: 'Medias',       icon: 'fa-solid fa-socks' },
  13: { id: 13, codigo: 'UNI-DIARIO-NINO', nombre: '🎒 Uniforme Diario Niño COMPLETO',         tipo: 'Completo',     icon: 'fa-solid fa-box-open' },
  14: { id: 14, codigo: 'UNI-DIARIO-NINA', nombre: '🎒 Uniforme Diario Niña COMPLETO',        tipo: 'Completo',     icon: 'fa-solid fa-box-open' },
  15: { id: 15, codigo: 'UNI-EDU',         nombre: '🏃 Uniforme Ed. Física COMPLETO',         tipo: 'Completo',     icon: 'fa-solid fa-box-open' },
  16: { id: 16, codigo: 'UNI-DIARIO-NINO-M', nombre: '🎒 Uniforme Diario Niño COMPLETO (Manyanet)', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  17: { id: 17, codigo: 'UNI-DIARIO-NINA-M', nombre: '🎒 Uniforme Diario Niña COMPLETO (Manyanet)', tipo: 'Completo', icon: 'fa-solid fa-box-open' },
  18: { id: 18, codigo: 'DELANTAL',        nombre: 'Delantal',                                tipo: 'accesorio',    icon: 'fa-solid fa-star' },
  19: { id: 19, codigo: 'CAMISETA-NINO',   nombre: 'Camiseta Ed. Física Niño',                 tipo: 'Ed. Física Niño', icon: 'fa-solid fa-shirt' },
  20: { id: 20, codigo: 'CAMISETA-NINA',   nombre: 'Camiseta Ed. Física Niña',                 tipo: 'Ed. Física Niña', icon: 'fa-solid fa-shirt' },
  21: { id: 21, codigo: 'CHQ-EDU-NINO',    nombre: 'Chaqueta Ed. Física Niño',                 tipo: 'Ed. Física Niño', icon: 'fa-solid fa-person-running' },
  22: { id: 22, codigo: 'CHQ-EDU-NINA',    nombre: 'Chaqueta Ed. Física Niña',                 tipo: 'Ed. Física Niña', icon: 'fa-solid fa-person-running' },
};

export const PRODUCTOS_POR_ESCUELA = {
  1: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18],
  2: [1, 2, 3, 4, 6, 7, 8, 9, 10, 12, 13, 14, 15],
  3: [1, 2, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17],
};
