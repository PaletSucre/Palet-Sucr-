// cart.js - clean UTF-8 version
const overlay = document.getElementById('cart-overlay');
const openBtn = document.getElementById('open-cart');
const closeBtn = document.getElementById('cart-close');

if (openBtn) { openBtn.addEventListener('click', () => { try { openCart(); } catch (e) { } }); }
if (closeBtn) { closeBtn.addEventListener('click', () => { try { closeCart(); } catch (e) { } }); }

overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) {
    closeCart();
  }
});
const CART_KEY = 'PS_CART_V2';
const $ = (sel, root = document) => root.querySelector(sel);

function readCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateBadge(items);
  try { window.dispatchEvent(new CustomEvent('cart:update', { detail: items })); } catch { }
}
function fmt(n) {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
  } catch {
    return (Number(n) || 0).toFixed(2).replace('.', ',') + ' EUR';
  }
}
function total(items) { return (items || []).reduce((s, x) => s + Number(x.price || 0) * Number(x.qty || 1), 0); }

function addItem(item) {
  const cart = readCart();
  const i = cart.findIndex(x => String(x.id) === String(item.id));
  if (i >= 0) cart[i].qty = Number(cart[i].qty || 1) + (Number(item.qty || 1));
  else cart.push({ id: item.id, name: item.name, price: Number(item.price || 0), image: item.image || '', qty: Number(item.qty || 1) });
  writeCart(cart); renderCart();
  try { showAddModal(item, cart); } catch { }
}
// compatibility wrapper used by main.js
function addToCart(item) { addItem(item); }

function removeItem(id) { writeCart(readCart().filter(x => String(x.id) !== String(id))); renderCart(); }
function removeAt(index) { const items = readCart(); const i = Number(index); if (!Number.isNaN(i) && i >= 0 && i < items.length) { items.splice(i, 1); writeCart(items); renderCart(); } }

function changeQty(id, d) { const cart = readCart(); const it = cart.find(x => String(x.id) === String(id)); if (!it) return; it.qty = Math.max(1, Number(it.qty || 1) + Number(d || 0)); writeCart(cart); renderCart(); }
function changeQtyAt(index, d) { const cart = readCart(); const i = Number(index); if (!Number.isNaN(i) && cart[i]) { cart[i].qty = Math.max(1, Number(cart[i].qty || 1) + Number(d || 0)); writeCart(cart); renderCart(); } }

function updateBadge(items = readCart()) { const el = $('#cart-count'); if (el) el.textContent = (items || []).reduce((s, x) => s + Number(x.qty || 1), 0); }

function renderCart() {
  const list = $('#cart-list'); const totalEl = $('#cart-total');
  if (!list || !totalEl) return;
  const items = readCart();
  list.innerHTML = '';
  items.forEach((it, idx) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${it.image || ''}" alt="">
      <div>
        <h4>${it.name || 'Produit'}</h4>
        <div class="sub">${fmt(it.price)} / u.</div>
        <div class="qty">
          <button class="icon-btn" data-action="dec" data-id="${it.id}" data-index="${idx}">-</button>
          <span>${it.qty || 1}</span>
          <button class="icon-btn" data-action="inc" data-id="${it.id}" data-index="${idx}">+</button>
        </div>
      </div>
      <strong>${fmt(Number(it.price || 0) * Number(it.qty || 1))}</strong>
      <button class="icon-btn" data-action="del" data-id="${it.id}" data-index="${idx}"></button>
    `;
    list.appendChild(li);
  });
  totalEl.textContent = fmt(total(items) || 0);
}

function openCart() {
  const ov = document.getElementById("cart-overlay");
  if (!ov) return;
  ov.setAttribute("aria-hidden", "false");
  ov.classList.add("open");
  ov.style.display = "block";
  document.body.classList.add("overlay-open");
  renderCart();
}

function closeCart() {
  const ov = document.getElementById("cart-overlay");
  if (!ov) return;
  ov.setAttribute("aria-hidden", "true");
  ov.classList.remove("open");
  ov.style.display = "none";
  document.body.classList.remove("overlay-open");
}


document.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.matches('#open-cart')) openCart();
  if (t.matches('#cart-close') || t.id === 'cart-overlay') closeCart();

  // Add-to-cart is handled centrally in main.js to avoid double additions
  if (t.matches('[data-action="inc"]')) { const id = t.dataset.id; if (id) changeQty(id, +1); else changeQtyAt(t.dataset.index, +1); }
  if (t.matches('[data-action="dec"]')) { const id = t.dataset.id; if (id) changeQty(id, -1); else changeQtyAt(t.dataset.index, -1); }
  if (t.matches('[data-action="del"]')) { const id = t.dataset.id; if (id) removeItem(id); else removeAt(t.dataset.index); }
  if (t.matches('#clear-cart')) { writeCart([]); renderCart(); }
});

document.addEventListener('DOMContentLoaded', () => updateBadge());

// ===== Add-to-cart modal =====
function ensureAddModal() {
  let ov = document.querySelector('.add-modal-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'add-modal-overlay';
    ov.innerHTML = `
      <div class="add-modal premium-dark" role="dialog" aria-labelledby="addmod-title">
        <button type="button" class="icon-btn add-close" aria-label="Fermer" style="position:absolute; top:16px; right:16px; z-index:10; color:rgba(255,255,255,0.4);">&times;</button>
        
        <div class="premium-header">
           <div class="check-circle-anim">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17L4 12"/>
            </svg>
          </div>
          <h3 id="addmod-title">Ajouté au panier</h3>
        </div>

        <div class="premium-body">
          <div class="premium-product">
            <img class="add-image" alt="">
            <div class="premium-info">
              <h4 class="add-name"></h4>
              <div class="add-price"></div>
            </div>
          </div>

          <div class="premium-total-block">
             <span>Total panier</span>
             <strong class="add-total-val"></strong>
          </div>

          <div class="premium-actions">
            <button type="button" class="btn-premium-outline add-continue">Continuer</button>
            <button type="button" class="btn-premium-fill add-open-cart">Voir le panier</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(ov);
  }
  return ov;
}

function showAddModal(item, itemsNow) {
  // Fermer la fiche produit (si ouverte) pour Ã©viter la superposition derriÃ¨re le popup
  try {
    const prodOv = document.getElementById('product-overlay');
    if (prodOv) {
      prodOv.classList.remove('open');
      document.body.classList.remove('overlay-open');
    }
  } catch { }

  const ov = ensureAddModal();
  ov.classList.add('open');
  const qtyAdded = Number(item.qty || 1);
  const items = itemsNow || readCart();
  const count = items.reduce((s, x) => s + Number(x.qty || 1), 0);
  const sub = total(items);

  ov.querySelector('.add-image').src = item.image || '';
  ov.querySelector('.add-name').textContent = item.name || 'Produit';
  ov.querySelector('.add-price').textContent = fmt(Number(item.price || 0));
  const totalVal = ov.querySelector('.add-total-val');
  if (totalVal) totalVal.textContent = fmt(sub);

  const close = () => ov.classList.remove('open');
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  ov.querySelector('.add-close').onclick = close;
  ov.querySelector('.add-continue').onclick = close;
  const viewBtn = ov.querySelector('.add-open-cart');
  if (viewBtn) viewBtn.onclick = () => {
    close();
    // Délais minimal pour laisser le DOM se mettre à jour
    setTimeout(() => { try { openCart(); } catch { } }, 0);
  };
}
