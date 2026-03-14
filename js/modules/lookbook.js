// ===================================================================
// MÓDULO — Galería / Lookbook con lightbox
// ===================================================================

const galeriaImagenes = [
  { src: 'estudiantes-marillac.png', alt: 'Estudiantes del Colegio Marillac con uniformes RALOZ COL S.A.S', tag: 'Colegio Marillac' },
  { src: 'fundadora.png',            alt: 'Proceso de confección de uniformes en el taller de RALOZ COL S.A.S', tag: 'Confección Propia' },
  { src: 'uniforme-nina.png',        alt: 'Uniforme diario niña RALOZ COL S.A.S – jardinera y blusa', tag: 'Colección Especial' },
  { src: 'fundadora2.png',           alt: 'Equipo de RALOZ COL S.A.S en el taller de confección de uniformes escolares', tag: 'Nuestro Equipo' },
];

let galeriaIdx = 0;

window.galeriaAbrir = function(idx) {
  galeriaIdx = idx;
  const lb  = document.getElementById('galeriaLightbox');
  const img = document.getElementById('galeriaLbImg');
  if (!lb || !img) return;
  img.src = galeriaImagenes[idx].src;
  img.alt = galeriaImagenes[idx].alt;
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.galeriaCerrar = function() {
  const lb = document.getElementById('galeriaLightbox');
  if (!lb) return;
  lb.classList.remove('active');
  document.body.style.overflow = '';
};

window.galeriaNav = function(dir) {
  galeriaIdx = (galeriaIdx + dir + galeriaImagenes.length) % galeriaImagenes.length;
  const img = document.getElementById('galeriaLbImg');
  if (img) {
    img.src = galeriaImagenes[galeriaIdx].src;
    img.alt = galeriaImagenes[galeriaIdx].alt;
  }
};

// Teclas: ESC cierra, flechas navegan
document.addEventListener('keydown', e => {
  const lb = document.getElementById('galeriaLightbox');
  if (!lb?.classList.contains('active')) return;
  if (e.key === 'Escape')     window.galeriaCerrar();
  if (e.key === 'ArrowRight') window.galeriaNav(1);
  if (e.key === 'ArrowLeft')  window.galeriaNav(-1);
});
