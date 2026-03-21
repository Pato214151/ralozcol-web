// ===================================================================
// MÓDULO — Inicializaciones de UI y comportamiento general
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
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('nav ul');
  if (!toggle || !menu) return;

  const toggleMenu = (forceClose = false) => {
    menu.classList.toggle('active', !forceClose);
    const isOpen = menu.classList.contains('active');
    toggle.textContent = isOpen ? '✕' : '☰';
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    toggle.setAttribute('aria-expanded', isOpen);
  };

  toggle.addEventListener('click', () => toggleMenu());
  toggle.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
  });
  document.querySelectorAll('nav a').forEach(l => {
    l.addEventListener('click', () => { if (window.innerWidth <= 768) toggleMenu(true); });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && menu.classList.contains('active')) toggleMenu(true);
  }, { passive: true });
  document.addEventListener('click', e => {
    if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) toggleMenu(true);
  }, { passive: true });
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#' || href === '#!') return;
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); scrollToSection(target); }
    });
  });
}

export function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        requestAnimationFrame(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '60px 0px 60px 0px' });

  document.querySelectorAll('section, .uniforme-card, .producto-card').forEach(el => {
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (!alreadyVisible) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    }
    observer.observe(el);
  });

  // Fallback: garantizar visibilidad de todas las secciones después de 3s
  setTimeout(() => {
    document.querySelectorAll('section, .uniforme-card, .producto-card').forEach(el => {
      if (el.style.opacity === '0') {
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  }, 3000);
}

export function initActiveNavIndicator() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  let ticking = false;
  const nav   = document.querySelector('nav');

  const update = () => {
    const navH      = nav ? nav.offsetHeight : 64;
    const scrollMid = window.scrollY + navH + 60;
    let current = '';
    sections.forEach(s => {
      const absTop = s.getBoundingClientRect().top + window.scrollY;
      if (scrollMid >= absTop) current = s.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
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

export function initImagePreload() {
  ['banner.webp', 'whatsapp.webp'].forEach(src => {
    const l = document.createElement('link');
    l.rel  = 'preload';
    l.as   = 'image';
    l.href = src;
    document.head.appendChild(l);
  });
}
