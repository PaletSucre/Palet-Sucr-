// paypal.js - add real PayPal button on checkout step 3 (client-side demo)

(function(){
  function readCart(){
    try{ const v2 = JSON.parse(localStorage.getItem('PS_CART_V2')||'[]'); if(Array.isArray(v2) && v2.length) return v2; }catch{}
    try{ const v1 = JSON.parse(localStorage.getItem('PS_CART')||'[]'); if(Array.isArray(v1)) return v1; }catch{}
    return [];
  }
  function parsePrice(v){
    if(typeof v === 'number') return v; if(v==null) return 0;
    const s = String(v).replace(/[^\d,.-]/g,'').replace(',', '.');
    const n = parseFloat(s); return isNaN(n)?0:n;
  }
  function subtotal(){
    return readCart().reduce((s,it)=> s + parsePrice(it && it.price) * Math.max(1, Number(it && it.qty) || 1), 0);
  }
  function ensureChoiceUI(){
    const step3 = document.getElementById('step-3'); if(!step3) return null;
    let choice = step3.querySelector('.ck-choice');
    let paypalBox = step3.querySelector('#pay-paypal');
    const grid = step3.querySelector('.form-grid');
    if(!grid) return null;
    if(!choice){
      choice = document.createElement('div'); choice.className='ck-choice'; choice.style.marginBottom='10px';
      choice.innerHTML = '\n<label><input type="radio" name="paymethod" value="card" checked> Carte bancaire</label>\n<label><input type="radio" name="paymethod" value="paypal"> PayPal</label>';
      step3.insertBefore(choice, grid);
    }
    if(!paypalBox){
      paypalBox = document.createElement('div'); paypalBox.id='pay-paypal'; paypalBox.style.display='none';
      paypalBox.innerHTML = '<div id="paypal-buttons"></div>';
      const terms = step3.querySelector('.ck-terms');
      step3.insertBefore(paypalBox, terms || grid.nextSibling);
    }
    return { step3, grid, choice, paypalBox };
  }
  function ensurePaypalSDK(){
    return new Promise((resolve,reject)=>{
      if(window.paypal) return resolve();
      const params = new URLSearchParams(location.search);
      const clientId = window.PALET_PAYPAL_CLIENT_ID || params.get('paypal-client-id') || 'sb';
      const s = document.createElement('script');
      s.src = 'https://www.paypal.com/sdk/js?client-id='+encodeURIComponent(clientId)+'&currency=EUR&intent=CAPTURE';
      s.onload = ()=> resolve();
      s.onerror = ()=> reject(new Error('PayPal SDK failed to load'));
      document.head.appendChild(s);
    });
  }
  function renderButtons(containerSelector, onPaid){
    const amt = subtotal();
    window.paypal.Buttons({
      style:{ layout:'horizontal', color:'gold', shape:'pill', label:'paypal' },
      createOrder:(data, actions)=> actions.order.create({ purchase_units:[{ amount:{ currency_code:'EUR', value: amt.toFixed(2) } }] }),
      onApprove: async (data, actions)=>{ try{ await actions.order.capture(); }catch{} onPaid && onPaid(); },
      onError:(err)=> console.error('PayPal error', err)
    }).render(containerSelector);
  }

  document.addEventListener('DOMContentLoaded', function(){
    const ui = ensureChoiceUI(); if(!ui) return;
    const { step3, grid, paypalBox } = ui;

    function setPay(method){
      const isCard = method !== 'paypal';
      grid.style.display = isCard ? '' : 'none';
      paypalBox.style.display = isCard ? 'none' : '';
      grid.querySelectorAll('input').forEach(function(inp){ inp.disabled = !isCard; });
      if(!isCard){
        ensurePaypalSDK().then(function(){
          const container = '#paypal-buttons';
          if(!document.querySelector(container).hasChildNodes()){
            renderButtons(container, function(){
              const nextBtn = step3.querySelector('[data-next]');
              if(nextBtn) nextBtn.click();
            });
          }
        }).catch(console.error);
      }
    }

    step3.addEventListener('change', function(e){
      var r = e.target;
      if(r && r.name === 'paymethod') setPay(r.value);
    });

    setPay('card');
  });
})();

