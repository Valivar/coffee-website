(() => {
  const { $, $$, esc, money, Cart, Orders, store, toast, thumb, itemMeta, COUPONS, SHIP, COD_FEE } = App;
  const root = $('#coRoot'), PROFILE = 'chitchat.profile.v1';
  const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
  const prof = store.get(PROFILE, {});
  let ship = 'standard', pay = 'upi';

  if (!Cart.items.length) {
    root.innerHTML = `<div class="empty container" style="padding:50px 5vw 90px"><div class="empty-ico">${DATA.icon('cup', 90)}</div><h4>Nothing to check out yet</h4><p>Add some coffee to your cart first.</p><a class="btn" href="shop.html"><span>Browse the shop</span></a></div>`;
    return;
  }

  const field = (id, label, o = {}) => `<div class="field${o.full ? ' full' : ''}"><label for="${id}">${label}</label>${o.select
    ? `<select id="${id}"><option value="">Select state</option>${STATES.map(s => `<option${prof[id] === s ? ' selected' : ''}>${s}</option>`).join('')}</select>`
    : `<input id="${id}" type="${o.type || 'text'}" ${o.mode ? `inputmode="${o.mode}"` : ''} ${o.max ? `maxlength="${o.max}"` : ''} autocomplete="${o.ac || 'off'}" placeholder="${o.ph || ''}" value="${esc(prof[id] || '')}">`}<p class="err">${o.err || 'This field is required.'}</p></div>`;

  root.innerHTML = `
  <form class="container co-layout" id="coForm" novalidate>
    <div>
      <div class="panel"><h2><i>1</i> Contact details</h2><div class="fgrid">
        ${field('name', 'Full name', { ac: 'name', err: 'Please enter your full name.', full: true })}
        ${field('email', 'Email', { type: 'email', ac: 'email', ph: 'you@example.com', err: 'Enter a valid email address.' })}
        ${field('phone', 'Mobile number', { type: 'tel', mode: 'numeric', max: 13, ac: 'tel', ph: '10-digit mobile', err: 'Enter a valid 10-digit Indian mobile number.' })}
      </div></div>
      <div class="panel"><h2><i>2</i> Delivery address</h2><div class="fgrid">
        ${field('addr', 'Address', { full: true, ac: 'street-address', ph: 'House no., street, area', err: 'Please enter your full address.' })}
        ${field('city', 'City', { ac: 'address-level2', err: 'Please enter your city.' })}
        ${field('state', 'State', { select: true, err: 'Please select your state.' })}
        ${field('pin', 'Pincode', { mode: 'numeric', max: 6, ac: 'postal-code', ph: '6 digits', err: 'Enter a valid 6-digit pincode.' })}
      </div></div>
      <div class="panel"><h2><i>3</i> Delivery method</h2>
        ${Object.entries(SHIP).map(([k, s]) => `<label class="choice${k === ship ? ' on' : ''}"><input type="radio" name="ship" value="${k}"${k === ship ? ' checked' : ''}><div><b>${s.label}</b><small>${s.eta}</small></div><em data-ship="${k}"></em></label>`).join('')}
      </div>
      <div class="panel"><h2><i>4</i> Payment</h2>
        <label class="choice on"><input type="radio" name="pay" value="upi" checked><div><b>UPI</b><small>Pay with any UPI app</small></div></label>
        <div class="pay-fields on" data-pay="upi"><div class="field"><label for="upi">UPI ID</label><input id="upi" type="text" placeholder="name@bank" autocomplete="off"><p class="err">Enter a valid UPI ID, e.g. name@okbank.</p></div></div>
        <label class="choice"><input type="radio" name="pay" value="card"><div><b>Credit / Debit card</b><small>Visa, Mastercard, RuPay</small></div></label>
        <div class="pay-fields" data-pay="card"><div class="fgrid">
          <div class="field full"><label for="cnum">Card number</label><input id="cnum" type="text" inputmode="numeric" maxlength="23" placeholder="1234 5678 9012 3456" autocomplete="cc-number"><p class="err">Enter a valid card number.</p></div>
          <div class="field full"><label for="cname">Name on card</label><input id="cname" type="text" autocomplete="cc-name"><p class="err">Enter the name on the card.</p></div>
          <div class="field"><label for="cexp">Expiry (MM/YY)</label><input id="cexp" type="text" inputmode="numeric" maxlength="5" placeholder="MM/YY" autocomplete="cc-exp"><p class="err">Enter a valid future expiry.</p></div>
          <div class="field"><label for="ccvv">CVV</label><input id="ccvv" type="password" inputmode="numeric" maxlength="4" placeholder="•••" autocomplete="cc-csc"><p class="err">Enter a 3–4 digit CVV.</p></div>
        </div></div>
        <label class="choice"><input type="radio" name="pay" value="cod"><div><b>Cash on delivery</b><small>Pay when your coffee arrives</small></div><em>+ ${money(COD_FEE)}</em></label>
        <p class="muted small" style="margin-top:12px">🔒 This is a demo store: no real payment is taken and card details are never stored or sent anywhere.</p>
      </div>
    </div>
    <aside class="summary" id="summary"></aside>
  </form>`;

  /* ---- summary ---- */
  function renderSummary() {
    const t = Cart.totals({ ship, cod: pay === 'cod' });
    $$('[data-ship]').forEach(e => { const f = SHIP[e.dataset.ship].fee(Cart.subtotal()); e.textContent = f ? money(f) : 'FREE'; });
    $('#summary').innerHTML = `
      <h2>Your order</h2>
      ${Cart.items.map(i => `<div class="mini"><span class="mini-badge"><b>${i.qty}</b><span class="d-thumb" style="display:block;border-radius:10px;overflow:hidden;aspect-ratio:1;background:#fff">${thumb(i)}</span></span><span>${esc(i.name)}<small>${itemMeta(i)}</small></span><b>${money(i.unit * i.qty)}</b></div>`).join('')}
      <div class="s-row" style="margin-top:12px"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
      ${t.discount ? `<div class="s-row s-disc"><span>Discount (${esc(t.coupon)})</span><b>− ${money(t.discount)}</b></div>` : ''}
      <div class="s-row"><span>Shipping</span><b>${t.shipping ? money(t.shipping) : 'FREE'}</b></div>
      ${t.codFee ? `<div class="s-row"><span>COD fee</span><b>${money(t.codFee)}</b></div>` : ''}
      <div class="s-row total"><span>Total</span><span>${money(t.total)}</span></div>
      ${Cart.coupon ? `<p class="s-note">Coupon <b>${esc(Cart.coupon)}</b> applied.</p>` : ''}
      <button class="btn magnetic" type="submit"><span>Place order · ${money(t.total)}</span></button>
      <p class="s-note" style="text-align:center"><a href="cart.html" style="text-decoration:underline">← Edit cart</a></p>
      <div class="trust"><span>🔒 Secure</span><span>↩️ Easy returns</span></div>`;
  }
  renderSummary();
  let placing = false;
  document.addEventListener('cart:change', () => { if (placing) return; if (!Cart.items.length) location.reload(); else renderSummary(); });

  /* ---- choices ---- */
  root.addEventListener('change', e => {
    if (e.target.name === 'ship') { ship = e.target.value; $$('input[name=ship]').forEach(i => i.closest('.choice').classList.toggle('on', i.checked)); }
    if (e.target.name === 'pay') {
      pay = e.target.value; $$('input[name=pay]').forEach(i => i.closest('.choice').classList.toggle('on', i.checked));
      $$('.pay-fields').forEach(f => f.classList.toggle('on', f.dataset.pay === pay));
      $('#st3').className = 'now';
    }
    renderSummary();
  });
  $('#coForm').addEventListener('focusin', e => { if (e.target.closest('.panel') && $$('.panel').indexOf(e.target.closest('.panel')) >= 3) $('#st3').className = 'now'; });

  /* input formatting */
  $('#cnum').addEventListener('input', e => (e.target.value = e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()));
  $('#cexp').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });
  ['phone', 'pin', 'ccvv'].forEach(id => $('#' + id).addEventListener('input', e => (e.target.value = e.target.value.replace(/[^\d+]/g, ''))));

  /* ---- validation ---- */
  const luhn = n => { let s = 0, d = false; for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; } return s % 10 === 0; };
  const val = id => ($('#' + id).value || '').trim();
  const rules = {
    name: v => v.length >= 2 && /[a-zA-Z]/.test(v),
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    phone: v => /^[6-9]\d{9}$/.test(v.replace(/^\+?91(?=\d{10}$)/, '')),
    addr: v => v.length >= 6, city: v => v.length >= 2, state: v => !!v, pin: v => /^[1-9]\d{5}$/.test(v)
  };
  const payRules = {
    upi: { upi: v => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v) },
    card: {
      cnum: v => { const n = v.replace(/\s/g, ''); return n.length >= 13 && n.length <= 19 && luhn(n); },
      cname: v => v.length >= 2,
      cexp: v => { const m = /^(\d{2})\/(\d{2})$/.exec(v); if (!m) return false; const mm = +m[1], yy = 2000 + +m[2]; if (mm < 1 || mm > 12) return false; return new Date(yy, mm, 0, 23, 59) >= new Date(); },
      ccvv: v => /^\d{3,4}$/.test(v)
    },
    cod: {}
  };
  const mark = (id, ok) => $('#' + id).closest('.field').classList.toggle('bad', !ok);
  root.addEventListener('blur', e => { const id = e.target.id; const r = rules[id] || payRules[pay][id]; if (r && e.target.value) mark(id, r(val(id))); }, true);
  root.addEventListener('input', e => { const f = e.target.closest('.field'); if (f && f.classList.contains('bad')) { const id = e.target.id, r = rules[id] || (payRules[pay] || {})[id]; if (r && r(val(id))) f.classList.remove('bad'); } });

  $('#coForm').addEventListener('submit', e => {
    e.preventDefault();
    let first = null;
    const all = { ...rules, ...payRules[pay] };
    Object.entries(all).forEach(([id, r]) => { const ok = r(val(id)); mark(id, ok); if (!ok && !first) first = $('#' + id); });
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); first.focus({ preventScroll: true }); toast('Please fix the highlighted fields.', { type: 'error' }); return; }

    const t = Cart.totals({ ship, cod: pay === 'cod' });
    const customer = { name: val('name'), email: val('email'), phone: val('phone').replace(/^\+?91(?=\d{10}$)/, '') };
    const address = { line: val('addr'), city: val('city'), state: val('state'), pin: val('pin') };
    store.set(PROFILE, { name: customer.name, email: customer.email, phone: customer.phone, addr: address.line, city: address.city, state: address.state, pin: address.pin });
    const cardLast4 = pay === 'card' ? val('cnum').replace(/\s/g, '').slice(-4) : '';

    $('#processing').classList.add('on');
    setTimeout(() => {
      const order = Orders.create({
        items: Cart.items.map(i => ({ ...i })), totals: t, customer, address, ship, note: Cart.note,
        pay: { method: pay, last4: cardLast4 }
      });
      placing = true; Cart.clear();
      location.href = 'order-success.html?id=' + order.id;
    }, 1700);
  });
})();
