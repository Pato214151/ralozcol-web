// ===================================================================
// MÓDULO — Inicializaciones de UI y comportamiento general — v2026.03.21
// ===================================================================

import { scrollToSection, showNotification } from '../core/utils.js';

export function initNavDropdown() {
  const dropdown = document.querySelector('.nav-dropdown');
  if (!dropdown) return;

  const btn  = dropdown.querySelector('.nav-dropdown-btn');
  const menu = dropdown.querySelector('.nav-dropdown-menu');

  const open  = () => { dropdown.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { dropdown.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
  const toggle = () => dropdown.classList.contains('open') ? close() : open();

  btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });

  // Cerrar al hacer clic en un link del menú
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Cerrar al hacer clic fuera
  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target)) close();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

export function initMobileMenu() {
  const nav    = document.querySelector('#main-nav');
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('#main-nav .nav-links');
  if (!nav || !toggle || !menu) return;

  const isOpen = () => nav.classList.contains('nav-open');

  const toggleMenu = (forceClose = false) => {
    const opening = forceClose ? false : !isOpen();
    nav.classList.toggle('nav-open', opening);
    toggle.innerHTML = opening
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
    toggle.setAttribute('aria-label', opening ? 'Cerrar menú' : 'Abrir menú');
    toggle.setAttribute('aria-expanded', opening);
  };

  toggle.addEventListener('click', () => toggleMenu());
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
  });
  document.querySelectorAll('nav a').forEach(l => {
    l.addEventListener('click', () => { if (window.innerWidth <= 980) toggleMenu(true); });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && isOpen()) toggleMenu(true);
  }, { passive: true });
  document.addEventListener('click', e => {
    if (isOpen() && !nav.contains(e.target)) toggleMenu(true);
  }, { passive: true });
}

export function initSPARouter() {
  const views = document.querySelectorAll('.spa-view');
  const navLinks = document.querySelectorAll('nav a[href^="#view-"]');
  const allLinks = document.querySelectorAll('a[href^="#view-"]');

  function showView(hash) {
    if (!hash || !hash.startsWith('#view-')) hash = '#view-inicio';
    
    const targetView = document.querySelector(hash);
    if (!targetView) {
      if (hash !== '#view-inicio') window.location.hash = '#view-inicio';
      return;
    }

    views.forEach(v => {
      if (v !== targetView && v.classList.contains('active')) {
        v.classList.remove('active');
      }
    });
    
    if (!targetView.classList.contains('active')) {
        targetView.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'instant' });

    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === hash);
    });
  }

  window.addEventListener('hashchange', () => showView(window.location.hash));

  allLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetHash = link.getAttribute('href');
      if (window.location.hash !== targetHash) {
        history.pushState(null, null, targetHash);
        showView(targetHash);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Ejecutar al inicio para mostrar la vista correcta
  setTimeout(() => showView(window.location.hash), 50);
}

export function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.pageYOffset > 80), { passive: true });
}

export function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Volver arriba');
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.style.opacity    = window.pageYOffset > 300 ? '1' : '0';
        btn.style.visibility = window.pageYOffset > 300 ? 'visible' : 'hidden';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });
}

export function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const step   = target / (1800 / 16);
      let current  = 0;

      const update = () => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString('es-CO');
        if (current < target) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

export function initFormMonitoring() {
  const iframe   = document.querySelector('.form-container iframe');
  const fallback = document.querySelector('.form-fallback');
  if (!iframe || !fallback) return;

  let loaded = false;
  const timeout = setTimeout(() => {
    if (!loaded) {
      iframe.style.display = 'none';
      fallback.hidden = false;
      showNotification('⏱️ El formulario tardó en cargar. Usa el enlace directo.', 'info');
    }
  }, 10000);

  iframe.addEventListener('load', () => {
    clearTimeout(timeout);
    loaded = true;
    iframe.style.display = 'block';
    fallback.hidden = true;
  });
  iframe.addEventListener('error', () => {
    clearTimeout(timeout);
    iframe.style.display = 'none';
    fallback.hidden = false;
  });
}

export function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      document.querySelectorAll('.faq-question').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling?.classList.remove('open');
      });

      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer?.classList.add('open');
      }
    });
  });
}

export function initOfflineDetection() {
  window.addEventListener('online',  () => showNotification('✅ Conexión restaurada', 'success'));
  window.addEventListener('offline', () => showNotification('⚠️ Sin conexión a internet', 'error'));
}

export function initContactForm() {
  const btn = document.getElementById('btnEnviarWA');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const nombre  = document.getElementById('ncf-nombre')?.value.trim();
    const tel     = document.getElementById('ncf-tel')?.value.trim();
    const colegio = document.getElementById('ncf-colegio')?.value.trim();
    const msg     = document.getElementById('ncf-msg')?.value.trim();
    if (!nombre || !msg) {
      showNotification('Por favor completa tu nombre y mensaje.', 'error');
      return;
    }
    let text = `Hola RALOZ COL 👋\n\nNombre: ${nombre}`;
    if (tel)     text += `\nTeléfono: ${tel}`;
    if (colegio) text += `\nColegio: ${colegio}`;
    text += `\n\nMensaje: ${msg}`;
    window.open(`https://wa.me/573213412903?text=${encodeURIComponent(text)}`, '_blank');
  });
}

export function initWhatsAppThrottle() {
  const btn = document.querySelector('.whatsapp-float');
  if (!btn) return;
  let lastClick = 0;
  btn.addEventListener('click', e => {
    if (Date.now() - lastClick < 2000) {
      e.preventDefault();
      showNotification('⏳ Espera un momento antes de volver a hacer clic', 'info');
      return;
    }
    lastClick = Date.now();
  });
}

export function initStickyCTA() {
  const bar    = document.getElementById('stickyCTA');
  const tienda = document.getElementById('tienda-online');
  if (!bar || !tienda) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        bar.classList.remove('visible');
        bar.setAttribute('aria-hidden', 'true');
      } else {
        bar.classList.add('visible');
        bar.setAttribute('aria-hidden', 'false');
      }
    },
    { threshold: 0.15 }
  );
  observer.observe(tienda);

  // Dots del carrusel de testimonios
  const track = document.querySelector('.testimonios-grid');
  const dots  = document.querySelectorAll('.test-dot');
  if (track && dots.length) {
    track.addEventListener('scroll', () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }, { passive: true });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
      });
    });
  }
}

export function initImagePreload() {
  ['banner.webp', 'whatsapp.webp'].forEach(src => {
    const l = document.createElement('link');
    l.rel  = 'preload';
    l.as   = 'image';
    l.href = src;
    document.head.appendChild(l);
  });
}
