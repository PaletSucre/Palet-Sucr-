document.addEventListener('DOMContentLoaded', () => {
  // Normalize brand text/accents across pages (in case markup was corrupted)
  document.querySelectorAll('.brand-name').forEach(n => { n.textContent = 'Palet Sucr\u00e9'; });
  document.querySelectorAll('.brand-mark').forEach(img => { img.alt = 'Palet Sucr\u00e9'; });
  document.querySelectorAll('.site-footer p').forEach(p => {
    if (p.textContent && p.textContent.toLowerCase().includes('palet sucr')) {
      p.innerHTML = '&copy; <span id=\"year\"></span> Palet Sucr&eacute; &mdash; Tous droits r&eacute;serv&eacute;s.';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Ensure mobile.css is loaded on small screens for all pages (shop, etc.)
  const wantsMobile = window.matchMedia('(max-width: 768px)').matches;
  if (wantsMobile) {
    const hasMobileCSS = Array.from(document.styleSheets).some(s => (s.ownerNode && s.ownerNode.href || '').includes('mobile.css'))
      || !!document.querySelector('link[href$="mobile.css"]');
    if (!hasMobileCSS) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'mobile.css';
      link.media = '(max-width: 768px)';
      document.head.appendChild(link);
    }
  }
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Bulle entiÃ¨re (nav-pill): disparaÃ®t en scroll down, rÃ©apparaÃ®t en scroll up
  const pill = document.querySelector('.nav-pill');
  if (pill) {
    let lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let ticking = false;
    const onScroll = () => {
      const yNow = window.pageYOffset || document.documentElement.scrollTop || 0;
      const dy = yNow - lastY;
      // Seuil anti-bruit
      if (Math.abs(dy) > 4) {
        if (dy > 0) pill.classList.add('hide'); else pill.classList.remove('hide');
        lastY = yNow;
      }
      // Toujours visible tout en haut
      if (yNow < 8) pill.classList.remove('hide');
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
  }
});

// Disparition en scroll pour le header "bubbled" (pages internes)
document.addEventListener('DOMContentLoaded', () => {
  const headerBubble = document.querySelector('.site-header.bubbled');
  if (!headerBubble) return;
  let lastY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let ticking = false;
  const onScroll = () => {
    const yNow = window.pageYOffset || document.documentElement.scrollTop || 0;
    const dy = yNow - lastY;
    if (Math.abs(dy) > 4) {
      if (dy > 0) headerBubble.classList.add('hide'); else headerBubble.classList.remove('hide');
      lastY = yNow;
    }
    if (yNow < 8) headerBubble.classList.remove('hide');
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
});

// Harmonise la pastille active selon la page, et Ã©vite que Accueil reste actif partout
document.addEventListener('DOMContentLoaded', () => {
  const path = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
  const links = Array.from(document.querySelectorAll('.nav a'));
  // Retirer les actives posÃ©es en dur dans le HTML
  links.forEach(a => a.classList.remove('active'));

  // Ne pas viser la pastille Contact (elle reste rose, Ã  droite)
  const candidates = links.filter(a => !a.classList.contains('contact-pill'));

  const target = candidates.find(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const isHome = (path === '' || path === 'home.html' || path === 'index.html');
    const homeMatch = href.endsWith('home.html') || href.endsWith('index.html');
    return (isHome && homeMatch) || href.endsWith(path);
  });

  if (target) target.classList.add('active');
});

// Retire la recherche sur la page Commander un gÃ¢teau (shop.html)
document.addEventListener('DOMContentLoaded', () => {
  const path = (location.pathname.split('/').pop() || '').toLowerCase();
  if (path === 'shop.html') {
    const filters = document.querySelector('.section-head .filters');
    if (filters) filters.remove();
  }
  // Lazy-load PayPal/checkout helpers only on checkout page
  if (path === 'checkout.html') {
    const s = document.createElement('script');
    s.src = 'scripts/paypal.js';
    document.head.appendChild(s);
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const path = (location.pathname.split('/').pop() || 'home.html').toLowerCase();

  document.querySelectorAll('.nav a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();

    // Ã©quivalences index/home pour l'accueil
    const isHome = (path === '' || path === 'home.html' || path === 'index.html');
    const homeMatch = href.endsWith('home.html') || href.endsWith('index.html');

    if ((isHome && homeMatch) || href.endsWith(path)) {
      a.classList.add('active');
    }
  });
});
// Forcer le bouton de checkout du panneau panier vers checkout.html sur TOUTES les pages
document.addEventListener('DOMContentLoaded', () => {
  const link = document.querySelector('.cart-footer a.btn-primary');
  if (link) {
    link.textContent = 'Finaliser ma commande';
    link.setAttribute('href', 'checkout.html');
  }
});
// --- Menu mobile (3 points) : ouverture/fermeture par classe .menu-open ---
document.addEventListener('DOMContentLoaded', () => {
  // Cible uniquement l'entÃªte en version mobile
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const header = document.querySelector('.site-header.bubbled');
  if (!isMobile || !header) return;

  // Sur mobile, supprime la classe 'bubble' du premier lien (Accueil) s'il l'a
  try { trigger.classList.remove('bubble'); } catch (e) { }

  const open = () => { header.classList.add('menu-open'); document.body.classList.add('menu-drawer-open'); trigger.setAttribute('aria-expanded', 'true'); };
  const close = () => { header.classList.remove('menu-open'); document.body.classList.remove('menu-drawer-open'); trigger.setAttribute('aria-expanded', 'false'); };
  const toggle = () => header.classList.contains('menu-open') ? close() : open();

  trigger.setAttribute('aria-haspopup', 'menu');
  trigger.setAttribute('aria-expanded', 'false');

  // Clic sur les 3 points
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });

  // Fermer si clic Ã  l'extÃ©rieur
  document.addEventListener('click', (e) => {
    if (!header.classList.contains('menu-open')) return;
    if (!header.contains(e.target)) close();
  });

  // Fermer sur Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Fermer aprÃ¨s clic sur un lien du menu (hors dÃ©clencheur)
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (a === trigger) return;
    close();
  });

  // Fermer si on sort du mode mobile
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 768px)').matches) close();
  });
});

// --- Drawer mobile dÃ©diÃ©: construit dynamiquement Ã  partir des liens existants ---
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const header = document.querySelector('.site-header.bubbled');
  if (!isMobile || !header) return;
  const sourceNav = header.querySelector('.nav');
  if (!sourceNav) return;

  // CrÃ©e le container du drawer s'il n'existe pas
  let drawer = document.querySelector('#mobile-drawer');
  if (!drawer) {
    drawer = document.createElement('aside');
    drawer.id = 'mobile-drawer';
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="drawer-header">
        <div class="drawer-title">Menu</div>
        <button class="drawer-close" aria-label="Fermer">Ã—</button>
      </div>
      <nav class="drawer-nav"></nav>
    `;
    document.body.appendChild(drawer);
  }

  const list = drawer.querySelector('.drawer-nav');
  list.innerHTML = '';
  // Ordre souhaitÃ© pour le menu mobile: Accueil, Shop, Commander, In The Box, Atelier
  const order = ['home.html', 'shop-materiel.html', 'shop.html', 'inthebox.html', 'atelier.html'];
  const links = Array.from(sourceNav.querySelectorAll('a'));
  // Ajoute dans l'ordre souhaitÃ© si disponibles
  order.forEach(key => {
    const a = links.find(l => (l.getAttribute('href') || '').toLowerCase().endsWith(key));
    if (a) {
      const clone = a.cloneNode(true);
      clone.classList.remove('active');
      clone.removeAttribute('style');
      list.appendChild(clone);
    }
  });

  // Branche les Ã©vÃ©nements d'ouverture/fermeture
  const trigger = sourceNav.querySelector('a:first-child');
  const closeBtn = drawer.querySelector('.drawer-close');
  const open = () => { document.body.classList.add('menu-drawer-open'); drawer.setAttribute('aria-hidden', 'false'); };
  const close = () => { document.body.classList.remove('menu-drawer-open'); drawer.setAttribute('aria-hidden', 'true'); };

  if (trigger) {
    trigger.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); open(); });
  }
  closeBtn.addEventListener('click', () => close());
  drawer.addEventListener('click', (e) => { const a = e.target.closest('a'); if (a) close(); });
  document.addEventListener('click', (e) => { if (!document.body.classList.contains('menu-drawer-open')) return; if (!drawer.contains(e.target)) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
});
// --- DÃ©tection des clics sur les boutons "Ajouter au panier" ---
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  // Ã‰vite le double-ajout: la fiche produit gÃ¨re son propre clic
  if (btn.closest('.product-panel')) return;
  addToCart({
    id: btn.dataset.id,
    name: btn.dataset.name,
    price: parseFloat(String(btn.dataset.price).replace(',', '.')), // <â€“ robuste
    image: btn.dataset.image,
    qty: 1
  });
});



/* =========================================
   SCROLL REVEAL & 3D TILT ANIMATIONS
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto-add .reveal class to key elements
  // Skip if we are on home page (has intro-overlay), as it handles its own reveal logic
  if (document.getElementById('intro-overlay')) return;

  const revealSelectors = [
    '.site-header .brand',
    '.site-header .nav',
    '.site-header .cart-btn',
    '.hero-inner > *',
    '.section-head',
    '.card',
    '.itb-info',
    '.itb-showcase',
    '.shop-hero > *',
    '.site-footer'
  ];

  document.querySelectorAll(revealSelectors.join(',')).forEach((el, index) => {
    el.classList.add('reveal');

    // Add staggered delays for header elements
    if (el.classList.contains('nav')) el.classList.add('reveal-delay-1');
    if (el.classList.contains('cart-btn')) el.classList.add('reveal-delay-2');

    // Add staggered delay for cards in the same container
    if (el.classList.contains('card')) {
      const siblingIndex = Array.from(el.parentNode.children).indexOf(el);
      if (siblingIndex % 3 === 1) el.classList.add('reveal-delay-1');
      if (siblingIndex % 3 === 2) el.classList.add('reveal-delay-2');
    }
  });

  // 2. Intersection Observer for Scroll Reveal
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Animate only once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

/* =========================================
   SMOOTH SCROLL (LENIS)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Dynamically load Lenis from CDN
  if (!window.Lenis) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js';
    script.onload = initLenis;
    document.head.appendChild(script);
  } else {
    initLenis();
  }

  function initLenis() {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }
});

/* =========================================
   PAGE TRANSITION LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  /* =================================
     CUSTOM CURSOR & MAGNETIC BUTTONS
     ================================= */

  // Only for desktop (fine pointer)
  if (window.matchMedia("(pointer: fine)").matches) {

    // 1. Inject Cursor DOM
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    // 2. Track Mouse
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    // 3. Hover Effects
    const hoverables = document.querySelectorAll('a, button, input, select, .card');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });

    // 4. Magnetic Buttons
    const magnets = document.querySelectorAll('.btn, .nav a, .intro-button');
    magnets.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Strength of magnetism
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // 1. Inject Overlay if not present
  let overlay = document.getElementById('page-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }

  // 2. Fade In (reveal page)
  // Small delay to ensure DOM is ready and transition triggers
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 50);

  // 3. Handle Link Clicks (Fade Out)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    const target = link.getAttribute('target');

    // Ignore if:
    // - No href
    // - External link (starts with http/https and not same origin) - simplified check
    // - Anchor link (starts with #)
    // - Opens in new tab
    if (!href || href.startsWith('#') || target === '_blank') return;

    // Check if it's a local navigation
    // (For simplicity, we assume relative paths or same domain)

    e.preventDefault();

    // Fade Out
    overlay.classList.remove('hidden');

    // Wait for transition then navigate
    setTimeout(() => {
      window.location.href = href;
    }, 300); // Match CSS transition duration
  });
});

