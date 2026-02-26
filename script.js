/**
 * RALOZ COL S.A.S - JavaScript Principal
 * Versión: 3.0 Modernizada
 */
document.addEventListener('DOMContentLoaded', () => {

    // Menú hamburguesa
    const initMobileMenu = () => {
        const toggle = document.querySelector('.nav-toggle');
        const menu = document.querySelector('nav ul');
        if (!toggle || !menu) return;

        const toggleMenu = (forceClose = false) => {
            menu.classList.toggle('active', !forceClose);
            const isOpen = menu.classList.contains('active');
            toggle.textContent = isOpen ? '✕' : '☰';
            toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
            toggle.setAttribute('aria-expanded', isOpen);
        };

        toggle.addEventListener('click', () => toggleMenu());
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });

        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) toggleMenu(true);
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && menu.classList.contains('active')) toggleMenu(true);
        }, { passive: true });

        document.addEventListener('click', (e) => {
            if (menu.classList.contains('active') && !menu.contains(e.target) && !toggle.contains(e.target)) {
                toggleMenu(true);
            }
        }, { passive: true });
    };

    // Scroll suave
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#!') return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navHeight = document.querySelector('nav')?.offsetHeight || 0;
                    window.scrollTo({ top: target.offsetTop - navHeight - 20, behavior: 'smooth' });
                }
            });
        });
    };

    // Monitoreo de formulario (sin notificación de éxito)
    const initFormMonitoring = () => {
        const formIframe = document.querySelector('.form-container iframe');
        const fallback = document.querySelector('.form-fallback');
        if (!formIframe || !fallback) return;

        let loadTimeout;
        let isLoaded = false;

        formIframe.addEventListener('load', () => {
            clearTimeout(loadTimeout);
            isLoaded = true;
            formIframe.style.display = 'block';
            fallback.hidden = true;
        });

        formIframe.addEventListener('error', () => {
            clearTimeout(loadTimeout);
            formIframe.style.display = 'none';
            fallback.hidden = false;
            showNotification('⚠️ No se pudo cargar el formulario. Usa el enlace directo o contáctanos por email.', 'error');
        });

        loadTimeout = setTimeout(() => {
            if (!isLoaded) {
                formIframe.style.display = 'none';
                fallback.hidden = false;
                showNotification('⏱️ El formulario tardó en cargar. Intenta con el enlace directo.', 'info');
            }
        }, 10000);
    };

    // Notificaciones
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    };

    // Animaciones al hacer scroll
    const initScrollAnimations = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    requestAnimationFrame(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    };

    // Indicador de sección activa
    const initActiveNavIndicator = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        if (!sections.length || !navLinks.length) return;

        let ticking = false;

        const updateActiveLink = () => {
            let current = '';
            sections.forEach(section => {
                if (window.pageYOffset >= section.offsetTop - 200) current = section.getAttribute('id');
            });
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateActiveLink);
                ticking = true;
            }
        }, { passive: true });

        updateActiveLink();
    };

    // Nav con efecto glassmorphism al hacer scroll
    const initNavScroll = () => {
        const nav = document.querySelector('nav');
        if (!nav) return;

        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.pageYOffset > 80);
        }, { passive: true });
    };

    // Botón "Volver arriba"
    const initBackToTop = () => {
        const backToTop = document.createElement('button');
        backToTop.innerHTML = '↑';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Volver arriba');
        document.body.appendChild(backToTop);

        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    backToTop.style.opacity = window.pageYOffset > 300 ? '1' : '0';
                    backToTop.style.visibility = window.pageYOffset > 300 ? 'visible' : 'hidden';
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        backToTop.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    // Contadores animados para la sección de estadísticas
    const initCounters = () => {
        const counters = document.querySelectorAll('.stat-number');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                const duration = 1800;
                const step = target / (duration / 16);
                let current = 0;

                const update = () => {
                    current = Math.min(current + step, target);
                    el.textContent = Math.floor(current).toLocaleString();
                    if (current < target) requestAnimationFrame(update);
                };

                requestAnimationFrame(update);
                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    };

    // Lazy loading para navegadores antiguos
    const initLazyLoading = () => {
        if ('loading' in HTMLImageElement.prototype) return;
        const images = document.querySelectorAll('img[loading="lazy"]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => observer.observe(img));
    };

    // Throttle para WhatsApp
    const initWhatsAppThrottle = () => {
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (!whatsappBtn) return;

        let lastClick = 0;
        whatsappBtn.addEventListener('click', (e) => {
            if (Date.now() - lastClick < 2000) {
                e.preventDefault();
                showNotification('⏳ Espera un momento antes de volver a hacer clic', 'info');
                return;
            }
            lastClick = Date.now();
        });
    };

    // Detección de conexión offline
    const initOfflineDetection = () => {
        window.addEventListener('online',  () => showNotification('✅ Conexión restaurada', 'success'));
        window.addEventListener('offline', () => showNotification('⚠️ Sin conexión a internet', 'error'));
    };

    // Preload de imágenes críticas
    const initImagePreload = () => {
        const criticalImages = ['banner.png', 'whatsapp.webp'];
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    };

    // Manejo de errores global
    const initErrorHandling = () => {
        window.addEventListener('error', (e) => {
            console.error('❌ Error detectado:', e.message);
            if (e.message.includes('iframe') || e.message.includes('form')) {
                showNotification('⚠️ Problema al cargar el formulario. Intenta refrescar la página.', 'error');
            }
        });
        window.addEventListener('unhandledrejection', (e) => {
            console.error('❌ Promesa rechazada:', e.reason);
        });
    };

    // Inicialización
    const initialize = () => {
        const modules = [
            { name: 'Menu Mobile',      fn: initMobileMenu },
            { name: 'Scroll Suave',     fn: initSmoothScroll },
            { name: 'Formulario',       fn: initFormMonitoring },
            { name: 'Animaciones',      fn: initScrollAnimations },
            { name: 'Nav Activo',       fn: initActiveNavIndicator },
            { name: 'Nav Scroll',       fn: initNavScroll },
            { name: 'Botón Arriba',     fn: initBackToTop },
            { name: 'Contadores',       fn: initCounters },
            { name: 'Lazy Loading',     fn: initLazyLoading },
            { name: 'WhatsApp',         fn: initWhatsAppThrottle },
            { name: 'Detec. Offline',   fn: initOfflineDetection },
            { name: 'Preload Imágenes', fn: initImagePreload },
            { name: 'Manejo Errores',   fn: initErrorHandling },
        ];

        modules.forEach(({ name, fn }) => {
            try {
                fn();
                console.log(`✅ ${name} inicializado`);
            } catch (error) {
                console.error(`❌ Error en ${name}:`, error);
            }
        });

        console.log('🚀 RALOZ COL S.A.S - Sistema iniciado correctamente');
    };

    initialize();
});
