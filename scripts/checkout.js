// checkout.js - Checkout summary + stepper + payment integration
const CART_KEYS = ['PS_CART_V2', 'PS_CART'];
const STRIPE_PK = 'pk_test_TYooMQauvdEDq54NiTphI7jx'; // Stripe Test Public Key

// Helpers
function parsePrice(v) {
  if (typeof v === 'number') return v;
  if (v == null) return 0;
  const s = String(v).replace(/[^\d,.-]/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function euro(n) {
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
  } catch {
    return (Number(n) || 0).toFixed(2).replace('.', ',') + ' EUR';
  }
}

// Cart Logic
function readByKey(k) { try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function getCart() {
  const v2 = readByKey('PS_CART_V2');
  const v1 = readByKey('PS_CART');
  if (Array.isArray(v2) && v2.length) return v2;
  return Array.isArray(v1) && v1.length ? v1 : [];
}

function renderSummary() {
  const list = document.getElementById('ck-list');
  const subEl = document.getElementById('ck-sub');
  const totEl = document.getElementById('ck-total');
  if (!list || !subEl || !totEl) return;

  const items = getCart();
  list.innerHTML = '';
  let subtotal = 0;
  let totalQty = 0;

  items.forEach(it => {
    const qty = Math.max(1, Number(it && it.qty) || 1);
    const price = parsePrice(it && it.price);
    subtotal += price * qty;
    totalQty += qty;

    const li = document.createElement('li');
    li.className = 'ck-item';
    li.innerHTML = `
      <img src="${(it && it.image) || ''}" alt="">
      <div class="ck-item-info">
        <strong>${(it && it.name) || 'Produit'}</strong>
        <span class="muted">x${qty}</span>
      </div>
      <div class="ck-item-price"><strong>${euro(price * qty)}</strong></div>
    `;
    list.appendChild(li);
  });

  subEl.textContent = euro(subtotal);
  totEl.textContent = euro(subtotal);

  const title = document.querySelector('.ck-summary h3');
  if (title) title.textContent = totalQty > 0 ? `Recapitulatif (${totalQty} article${totalQty > 1 ? 's' : ''})` : 'Recapitulatif';

  return subtotal;
}

window.addEventListener('cart:update', renderSummary);
window.addEventListener('storage', e => { if (CART_KEYS.includes(e.key)) renderSummary(); });
document.addEventListener('DOMContentLoaded', renderSummary);

// Payment & Stepper Logic
document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.ck-flow .step'));
  const tabs = Array.from(document.querySelectorAll('.ck-steps [data-step]'));
  const currentIndex = () => steps.findIndex(s => s.classList.contains('active'));

  // Stripe Init
  let stripe = null;
  let cardElement = null;
  try {
    if (window.Stripe) {
      stripe = Stripe(STRIPE_PK);
      const elements = stripe.elements();
      cardElement = elements.create('card', {
        style: {
          base: {
            color: "#ffffff",
            fontFamily: '"Inter", sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": { color: "#aab7c4" }
          },
          invalid: { color: "#fa755a", iconColor: "#fa755a" }
        }
      });
    }
  } catch (e) { console.error("Stripe init failed", e); }

  // Inject UI into Step 3
  const step3 = document.getElementById('step-3');
  let paymentMethod = 'stripe';

  if (step3) {
    // Clear existing mock fields
    const formGrid = step3.querySelector('.form-grid');
    if (formGrid) formGrid.innerHTML = '';
    const terms = step3.querySelector('.ck-terms');

    // Create Mode Switcher
    const choice = document.createElement('div');
    choice.className = 'ck-choice';
    choice.style.marginBottom = '20px';
    choice.innerHTML = `
      <label><input type="radio" name="paymethod" value="stripe" checked> Carte Bancaire</label>
      <label><input type="radio" name="paymethod" value="paypal"> PayPal</label>
    `;
    step3.insertBefore(choice, formGrid || terms);

    // Create Stripe Container
    const stripeBox = document.createElement('div');
    stripeBox.id = 'stripe-box';
    stripeBox.className = 'form-grid'; // reuse grid styling for margin
    stripeBox.style.display = 'block';
    stripeBox.innerHTML = `
      <div style="grid-column:1/-1; background: #131419; padding: 12px; border: 1px solid #2a2c33; border-radius: 12px;">
        <div id="card-element"><!--Stripe.js injects here--></div>
      </div>
      <div id="card-errors" role="alert" style="color: #ff4fb3; font-size: 14px; margin-top: 8px;"></div>
    `;
    step3.insertBefore(stripeBox, terms);

    if (cardElement) cardElement.mount('#card-element');

    // Create PayPal Container
    const paypalBox = document.createElement('div');
    paypalBox.id = 'paypal-box';
    paypalBox.style.display = 'none';
    paypalBox.style.marginBottom = '20px';
    paypalBox.innerHTML = `<div id="paypal-button-container"></div>`;
    step3.insertBefore(paypalBox, terms);

    // Mode Toggle Logic
    const togglePayment = (mode) => {
      paymentMethod = mode;
      stripeBox.style.display = mode === 'stripe' ? 'block' : 'none';
      paypalBox.style.display = mode === 'paypal' ? 'block' : 'none';

      // Update Next Button logic: Hide "Valider" if PayPal (since PayPal has its own buttons)
      const submitBtn = step3.querySelector('[data-next]');
      if (submitBtn) {
        if (mode === 'paypal') submitBtn.style.display = 'none';
        else {
          submitBtn.style.display = 'inline-flex';
          submitBtn.textContent = 'Payer ' + (document.getElementById('ck-total')?.textContent || '');
        }
      }
    };

    step3.addEventListener('change', (e) => {
      if (e.target.name === 'paymethod') togglePayment(e.target.value);
    });

    // Render PayPal Buttons
    if (window.paypal) {
      paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
        createOrder: (data, actions) => {
          const totalVal = parseFloat((document.getElementById('ck-total')?.textContent || '0').replace(/[^\d.]/g, '')) || 10.00;
          return actions.order.create({
            purchase_units: [{ amount: { value: totalVal.toFixed(2) } }]
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(details => {
            console.log('PayPal Success:', details);
            goToConfirmation();
          });
        }
      }).render('#paypal-button-container');
    }
  }

  function setStep(idx) {
    steps.forEach((s, k) => s.classList.toggle('active', k === idx));
    tabs.forEach((t, k) => {
      t.classList.toggle('active', k === idx);
      t.classList.toggle('done', k < idx);
    });
  }

  function goToConfirmation() {
    // Clear cart
    localStorage.removeItem('PS_CART_V2');
    localStorage.removeItem('PS_CART');
    window.dispatchEvent(new Event('cart:update'));
    setStep(3); // Step 4 (index 3)
  }

  async function handleStripePayment() {
    if (!stripe || !cardElement) return;

    const submitBtn = document.querySelector('#step-3 [data-next]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Traitement...';

    // In a real app, you would fetch a client_secret from your backend here
    // const {clientSecret} = await fetch('/create-payment-intent').then(r => r.json());

    // For DEMO purpose with Client-Side only, we create a Token or simulate success
    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      const errorElement = document.getElementById('card-errors');
      errorElement.textContent = error.message;
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    } else {
      // Send the token to your server
      console.log('Stripe Token:', token);
      // Simulate server success
      setTimeout(() => {
        goToConfirmation();
      }, 1000);
    }
  }

  // Navigation Click Handler
  document.addEventListener('click', (e) => {
    const nextBtn = e.target.closest && e.target.closest('[data-next]');
    if (nextBtn) {
      e.preventDefault();
      const idx = currentIndex();
      const currentStepEl = steps[idx];

      // Validation
      const form = currentStepEl.tagName === 'FORM' ? currentStepEl : currentStepEl.querySelector('form');
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Special handling for Payment Step (Index 2)
      if (idx === 2) {
        if (paymentMethod === 'stripe') {
          handleStripePayment();
        }
        // PayPal handles its own transition
        return;
      }

      // Normal transition
      setStep(idx + 1);
      return;
    }

    const prevBtn = e.target.closest && e.target.closest('[data-prev]');
    if (prevBtn) {
      e.preventDefault();
      setStep(currentIndex() - 1);
    }
  });

  // Handle Enter key in forms
  document.addEventListener('submit', e => {
    if (e.target.tagName === 'FORM') e.preventDefault(); // controlled by click handler
  });
});
