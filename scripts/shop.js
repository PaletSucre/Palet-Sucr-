const shopGrid = document.getElementById('shop-grid');
const q = document.getElementById('q');
const productOverlay = document.getElementById('product-overlay');
// Fallback local formatter in case cart.js isn't loaded yet
function fmtLocal(n) {
  const v = Number(n) || 0;
  try { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v); }
  catch { return v.toFixed(2).replace('.', ',') + ' €'; }
}
const priceFmt = (n) => {
  try { if (typeof fmt === 'function') return fmt(n); } catch { }
  return fmtLocal(n);
};
const $p = sel => document.querySelector(sel);

function getProducts() {
  const fallback = [
    // Entremets (Existing)
    { id: 'ps-raffaello', name: 'Raffaello Framboise', price: 29.90, image: 'assets/raffaello.jpg', tags: ['coco', 'framboise', 'blanc'], category: 'entremets' },
    { id: 'ps-pistache', name: 'Pistache Rubis', price: 32.00, image: 'assets/pistache.jpg', tags: ['pistache', 'rubis'], category: 'entremets' },
    { id: 'ps-obscura', name: 'Chocolat Obscura', price: 34.00, image: 'assets/choco.jpg', tags: ['chocolat', 'noir'], category: 'entremets' },
    { id: 'ps-citron', name: 'Citron Silk', price: 27.50, image: 'assets/citron.jpg', tags: ['citron', 'soyeux'], category: 'entremets' },

    // Pièces Montées (New)
    { id: 'ps-pm-1', name: 'Pyramide de Choux', price: 120.00, image: 'assets/in-the-box-new.jpg', tags: ['choux', 'caramel'], category: 'pieces-montees' },

    // Layer Cake (New)
    { id: 'ps-lc-1', name: 'Red Velvet Royal', price: 65.00, image: 'assets/atelier-hero.png', tags: ['red velvet', 'cream cheese'], category: 'layer-cake' },

    // Édition Limitée (New)
    { id: 'ps-el-1', name: 'Signature Truffe', price: 45.00, image: 'assets/choco.jpg', tags: ['truffe', 'chocolat', 'or'], category: 'edition-limitee' }
  ];
  const el = document.getElementById('products-data');
  if (!el) return fallback;
  const raw = (el.textContent || '').trim();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch (err) {
    console.warn('products-data JSON parse failed, using fallback', err);
    return fallback;
  }
}
function card(p) {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.id = p.id;
  el.innerHTML = `
    <img src="${p.image}" alt="${p.name}" loading="lazy">
    <div class="card-body">
      <h3>${p.name}</h3>
      <div class="price-row">
        <span class="price">${priceFmt(p.price)}</span>
      </div>
    </div>`;
  return el;
}
function render(list) {
  shopGrid.innerHTML = ''; list.forEach(p => shopGrid.appendChild(card(p)));
}

document.addEventListener('DOMContentLoaded', () => {
  const products = getProducts();

  // --- NEW LOGIC: CATEGORIES FIRST ---

  // 1. Data: Categories
  const categories = [
    { id: 'entremets', name: 'Entremets', image: 'assets/raffaello.jpg', desc: 'Nos créations signatures' },
    { id: 'pieces-montees', name: 'Pièces Montées', image: 'assets/in-the-box-new.jpg', desc: 'Pour vos grands événements' },
    { id: 'layer-cake', name: 'Layer Cakes', image: 'assets/atelier-hero.png', desc: 'Gourmandise à l\'américaine' },
    { id: 'edition-limitee', name: 'Édition Limitée', image: 'assets/choco.jpg', desc: 'Collections éphémères' }
  ];

  // 2. Elements
  const catView = document.getElementById('category-view');
  const prodView = document.getElementById('product-view');
  const catGrid = document.getElementById('category-grid');
  const backBtn = document.getElementById('back-to-cats');
  const catTitle = document.getElementById('selected-cat-title');
  const catSubtitle = document.getElementById('selected-cat-subtitle');

  let currentCategory = null;

  // 3. Render Categories Grid
  function renderCategories() {
    if (!catGrid) return;
    catGrid.innerHTML = '';
    categories.forEach(cat => {
      // Create big card
      const el = document.createElement('article');
      el.className = 'card category-card';
      el.style.cursor = 'pointer';
      // Inline styles for glass effect matching site (or reuse .card)

      el.innerHTML = `
        <div style="width:100%; height:320px; overflow:hidden;">
          <img src="${cat.image}" alt="${cat.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease;">
        </div>
        <div class="card-body" style="text-align:center;">
          <h3 style="font-size:1.5rem; margin-bottom:8px;">${cat.name}</h3>
          <p class="sub" style="opacity:0.7;">${cat.desc}</p>
          <div style="margin-top:16px; font-weight:600; font-size:0.9rem; text-transform:uppercase; letter-spacing:1px; color:rgba(255,255,255,0.8);">Découvrir</div>
        </div>
      `;

      // Hover effect logic handled by CSS usually, but simple JS redirect here
      el.onclick = () => showProducts(cat);
      catGrid.appendChild(el);
    });
  }

  // 4. View Switching
  function showCategories() {
    if (!prodView || !catView) return;
    prodView.style.display = 'none';
    catView.style.display = 'block';

    // Animate
    requestAnimationFrame(() => {
      catView.classList.remove('hidden'); // if you use opacity transitions
      catView.style.opacity = '1';
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    currentCategory = null;
  }

  function showProducts(cat) {
    if (!prodView || !catView) return;
    currentCategory = cat.id;

    // Update Header
    if (catTitle) catTitle.innerHTML = cat.name; // innerHTML allows &amp;
    if (catSubtitle) catSubtitle.innerHTML = cat.desc;

    // Filter Products
    const filtered = products.filter(p => p.category === cat.id);
    render(filtered); // standard render function

    // Switch Views
    catView.style.display = 'none';
    prodView.style.display = 'block';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 5. Init
  renderCategories();
  // Ensure default state
  if (catView) catView.style.display = 'block';
  if (prodView) prodView.style.display = 'none';

  // Back Button Logic
  if (backBtn) {
    backBtn.addEventListener('click', showCategories);
  }

  // Search Logic (Specific to current category)
  if (shopGrid && q) {
    q.addEventListener('input', () => {
      const s = q.value.toLowerCase().trim();
      // Must filter from ALL products but restricted to current Category
      const base = currentCategory ? products.filter(p => p.category === currentCategory) : products;

      const results = base.filter(p =>
        p.name.toLowerCase().includes(s) || (p.tags || []).some(t => t.toLowerCase().includes(s))
      );
      render(results);
    });
  }

  // Year
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  // Ouvrir fiche produit en cliquant sur une carte
  shopGrid?.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const cardEl = t.closest('article.card');
    if (!cardEl) return;
    if (t.classList.contains('add-to-cart')) return;
    const id = cardEl.dataset.id;
    const p = products.find(x => x.id === id);
    if (p) openProduct(p);
  });

  // Support Shop Matériel (Gear) stays same...
  const gearGrid = document.getElementById('gear-grid');
  // ... (existing gear logic if needed, but this block is usually separate. 
  // Wait, in previous file gear logic was INSIDE DOMContentLoaded. I should keep it.)
  if (gearGrid) {
    gearGrid.addEventListener('click', (e) => {
      const t = e.target; if (!(t instanceof HTMLElement)) return;
      const cardEl = t.closest('article.card'); if (!cardEl) return;
      if (t.classList.contains('add-to-cart')) return;
      const img = cardEl.querySelector('img');
      const title = cardEl.querySelector('h3');
      const btn = cardEl.querySelector('button.add-to-cart');
      const priceText = btn?.dataset.price || cardEl.querySelector('.price')?.textContent || '0';
      const price = Number(String(priceText).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      const p = {
        id: btn?.dataset.id || title?.textContent || 'gear-item',
        name: title?.textContent || 'Article',
        price,
        image: img?.getAttribute('src') || ''
      };
      openProduct(p, { mode: 'gear' });
    });
  }
});

// ---------- FICHE PRODUIT ----------
const DEFAULT_SERVINGS = 8;
const SERVING_OPTIONS = [4, 6, 8, 10, 12];

function computePrice(base, servings) {
  // base considéré pour 8 parts par défaut
  const per = base / DEFAULT_SERVINGS;
  const price = per * servings;
  return Math.round(price * 100) / 100; // arrondi aux centimes
}

function openProduct(p, opts = {}) {
  if (!productOverlay) return;
  productOverlay.classList.add('open');
  document.body.classList.add('overlay-open');
  $p('#product-image').src = p.image;
  $p('#product-image').alt = p.name;
  $p('#product-title').textContent = p.name;
  const isGear = opts.mode === 'gear';
  const lowerName = (p.name || '').toLowerCase();
  const isIaTraining = isGear && lowerName.includes('ia x palet');
  const isKitDebutant = isGear && (lowerName.includes('kit d') || lowerName.includes('kit débutant'));
  const desc = isGear
    ? (isIaTraining
      ? "Formation en ligne bientot disponible : comment l'IA optimise precision, creativite et temps de production en patisserie."
      : isKitDebutant
        ? "Kit debutant patisserie : outils essentiels (poches, douilles, spatule, corne) pour demarrer, bientot disponible."
        : "Bientot disponible.")
    : `Un ${p.name} prepare a la commande. Ingredients: ${(p.tags || []).join(', ')}.`;
  $p('#product-desc').textContent = desc;
  const sel = $p('#servings-select');
  if (opts.mode === 'gear') {
    // Utiliser le même select pour quantité
    const QTY = [1, 2, 3, 4, 5, 6, 8, 10];
    sel.previousElementSibling.textContent = 'Quantité';
    sel.innerHTML = QTY.map(n => `<option value="${n}">${n}</option>`).join('');
  } else {
    sel.previousElementSibling.textContent = 'Nombre de parts';
    sel.innerHTML = SERVING_OPTIONS.map(n => `<option value="${n}" ${n === DEFAULT_SERVINGS ? 'selected' : ''}>${n} parts</option>`).join('');
  }
  const priceEl = $p('#product-price');
  const addBtn = $p('#product-add');
  function sync() {
    if (opts.mode === 'gear') {
      const qty = Number(sel.value) || 1;
      const price = Math.round(p.price * qty * 100) / 100;
      priceEl.textContent = fmt(price);
      addBtn.dataset.id = p.id;
      addBtn.dataset.name = p.name;
      addBtn.dataset.price = String(p.price); // prix unitaire
      addBtn.dataset.qty = String(qty);
      addBtn.dataset.image = p.image;
    } else {
      const parts = Number(sel.value);
      const price = computePrice(p.price, parts);
      priceEl.textContent = fmt(price);
      addBtn.dataset.id = `${p.id}-${parts}`;
      addBtn.dataset.name = `${p.name} (${parts} parts)`;
      addBtn.dataset.price = String(price);
      addBtn.dataset.image = p.image;
    }
  }
  sel.onchange = sync; sync();

  // Sécurise l'ajout au panier sans dépendre du listener global
  addBtn.onclick = (e) => {
    e.preventDefault();
    const payload = {
      id: addBtn.dataset.id,
      name: addBtn.dataset.name,
      price: parseFloat(String(addBtn.dataset.price).replace(',', '.')) || 0,
      image: addBtn.dataset.image,
      qty: opts.mode === 'gear' ? (Number(addBtn.dataset.qty) || 1) : 1,
    };
    try { addToCart(payload); } catch { /* fallback direct */ try { addItem(payload); } catch { } }
  };
}

document.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.matches('.product-close') || t.id === 'product-overlay') {
    productOverlay?.classList.remove('open');
    document.body.classList.remove('overlay-open');
  }
});



