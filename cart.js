(() => {
  const { $, $$, esc, money, Cart, toast, thumb, itemMeta, qtyCtl, card, observe, COUPONS, SHIP, FREE_SHIP_AT } = App;
  const root = $('#cartRoot');
  let couponMsg = null, pinMsg = '';

  function render() {
    const items = Cart.items, t = Cart.totals();
    if (!items.length) {
      root.innerHTML = `<div class="empty container" style="padding:50px 5vw 70px"><div class="empty-ico">${DATA.icon('cup', 90)}</div><h4>Your cart is empty</h4><p>Looks like you haven't picked your coffee yet.</p><a class="btn magnetic" href="shop.html"><span>Browse the shop</span></a></div>`;
      renderReco(); return;
    }
    const cdef = Cart.coupon ? COUPONS[Cart.coupon] : null;
    const pct = Math.min(100, t.subtotal / FREE_SHIP_AT * 100);
    root.innerHTML = `
    <div class="container cart-layout">
      <div>
        <div class="c-list">
          ${items.map(i => `
          <div class="c-item" data-key="${esc(i.key)}">
            <a class="c-thumb" href="${i.pid === 'custom' ? 'blend.html' : 'product.html?id=' + esc(i.pid)}">${thumb(i)}</a>
            <div><h3><a href="${i.pid === 'custom' ? 'blend.html' : 'product.html?id=' + esc(i.pid)}">${esc(i.name)}</a></h3>
              <p class="muted">${itemMeta(i)}<br>${money(i.unit)} each</p>${qtyCtl(i.key, i.qty)}</div>
            <div class="c-right"><b>${money(i.unit * i.qty)}</b><button class="c-remove" data-remove="${esc(i.key)}">Remove</button></div>
          </div>`).join('')}
        </div>
        <div class="panel note-box" style="margin-top:20px"><label for="note">Add an order note (optional)</label><textarea id="note" rows="2" maxlength="300" placeholder="Gift message, delivery instructions…">${esc(Cart.note)}</textarea></div>
        <p style="margin-top:16px"><a class="link-arrow" href="shop.html">← Continue shopping</a> &nbsp;·&nbsp; <button class="c-remove" id="clearCart">Clear cart</button></p>
      </div>
      <aside class="summary">
        <h2>Order summary</h2>
        <div class="ship-bar" style="background:rgba(255,255,255,.1);border-radius:12px;margin-bottom:14px"><p>${t.toFree > 0 ? `Add <b>${money(t.toFree)}</b> more for <b>free shipping</b>` : '🎉 Free shipping unlocked'}</p><div class="bar"><i style="width:${pct}%"></i></div></div>
        <div class="s-row"><span>Subtotal (${Cart.count()} items)</span><b>${money(t.subtotal)}</b></div>
        ${t.discount ? `<div class="s-row s-disc"><span>Discount (${esc(t.coupon)})</span><b>− ${money(t.discount)}</b></div>` : ''}
        <div class="s-row"><span>Shipping</span><b>${t.shipping ? money(t.shipping) : 'FREE'}</b></div>
        ${cdef ? `<div class="applied"><span>🏷️ ${esc(Cart.coupon)}: ${esc(cdef.label)}${t.couponOk ? '' : ' (conditions not met)'}</span><button id="rmCoupon">Remove</button></div>` :
          `<form class="coupon" id="couponForm"><input type="text" id="code" placeholder="Coupon code" aria-label="Coupon code" autocomplete="off"><button class="btn" type="submit" style="width:auto;margin:0"><span>Apply</span></button></form>`}
        <p class="coupon-msg ${couponMsg ? (couponMsg.ok ? 'ok' : 'bad') : ''}" id="couponMsg">${couponMsg ? esc(couponMsg.msg) : ''}</p>
        <p class="s-note">Try <b>CHAT10</b> (10% off), <b>WELCOME50</b> (₹50 off ₹399+) or <b>FREESHIP</b>.</p>
        <div class="s-row total"><span>Total</span><span>${money(t.total)}</span></div>
        <p class="s-note">Inclusive of all taxes. Express delivery &amp; COD options at checkout.</p>
        <form class="pin" id="pinForm"><input type="text" id="pin" inputmode="numeric" maxlength="6" placeholder="Delivery pincode" aria-label="Pincode"><button class="btn" type="submit" style="width:auto;margin:0;padding:10px 16px"><span>Check</span></button></form>
        <p class="s-note" id="pinMsg">${esc(pinMsg)}</p>
        <a class="btn magnetic" href="checkout.html"><span>Proceed to checkout →</span></a>
        <div class="trust"><span>🔒 Secure checkout</span><span>↩️ 7-day returns</span><span>🚚 Fast dispatch</span></div>
      </aside>
    </div>`;
    renderReco();
  }

  function renderReco() {
    const inCart = new Set(Cart.items.map(i => i.pid));
    const list = DATA.products.filter(p => !inCart.has(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 4);
    $('#reco').innerHTML = list.map((p, i) => card(p, i)).join('');
    $$('#reco .pcard').forEach(c => c.classList.add('reveal')); observe($('#reco'));
  }

  root.addEventListener('submit', e => {
    if (e.target.id === 'couponForm') { e.preventDefault(); couponMsg = Cart.applyCoupon($('#code').value); render(); if (!couponMsg.ok) $('#code') && $('#code').focus(); }
    if (e.target.id === 'pinForm') {
      e.preventDefault(); const v = $('#pin').value.trim();
      pinMsg = /^[1-9]\d{5}$/.test(v) ? `✓ We deliver to ${v}: standard in 3–5 days, express in 1–2 days.` : 'Please enter a valid 6-digit pincode.';
      $('#pinMsg').textContent = pinMsg;
    }
  });
  root.addEventListener('click', e => {
    if (e.target.id === 'rmCoupon') { couponMsg = null; Cart.removeCoupon(); }
    if (e.target.id === 'clearCart') { const snap = [...Cart.items]; Cart.clear(); toast('Cart cleared', { action: { label: 'Undo', fn: () => snap.forEach(i => Cart.add(i)) } }); }
  });
  root.addEventListener('input', e => { if (e.target.id === 'note') Cart.setNote(e.target.value); });
  document.addEventListener('cart:change', () => { const a = document.activeElement; if (a && a.id === 'note') return; render(); });
  render();
})();
