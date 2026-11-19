/* Order confirmation + order tracking (both read the browser-stored orders) */
(() => {
  const { $, $$, esc, money, Orders, TRACK, DEMO_SPEED, SHIP, thumb, itemMeta, reduce } = App;
  const page = document.body.dataset.page;
  const fmt = ts => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const etaDate = o => new Date(o.createdAt + (o.ship === 'express' ? 2 : 5) * 864e5).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const payLabel = o => ({ upi: 'UPI', card: `Card ending ${o.pay.last4}`, cod: 'Cash on delivery' }[o.pay.method]);

  const summaryCard = o => `
    <div class="o-card">
      ${o.items.map(i => `<div class="mini" style="grid-template-columns:56px 1fr auto;border-color:rgba(59,35,20,.1)"><span class="d-thumb" style="display:block;border-radius:10px;overflow:hidden;aspect-ratio:1;background:#fff">${thumb(i)}</span><span>${esc(i.name)} × ${i.qty}<small class="muted">${itemMeta(i)}</small></span><b>${money(i.unit * i.qty)}</b></div>`).join('')}
      <div class="o-row" style="margin-top:10px"><span>Subtotal</span><span>${money(o.totals.subtotal)}</span></div>
      ${o.totals.discount ? `<div class="o-row"><span>Discount</span><span>− ${money(o.totals.discount)}</span></div>` : ''}
      <div class="o-row"><span>Shipping</span><span>${o.totals.shipping ? money(o.totals.shipping) : 'FREE'}</span></div>
      ${o.totals.codFee ? `<div class="o-row"><span>COD fee</span><span>${money(o.totals.codFee)}</span></div>` : ''}
      <div class="o-row total"><span>Total paid</span><span>${money(o.totals.total)}</span></div>
    </div>`;

  /* ---------- success ---------- */
  if (page === 'success') {
    const o = Orders.find(new URLSearchParams(location.search).get('id'));
    const root = $('#okRoot');
    if (!o) { root.innerHTML = `<div class="empty container" style="padding:70px 5vw"><div class="empty-ico">${DATA.icon('cup', 80)}</div><h4>We couldn't find that order</h4><p>Open the same browser you used to place it, or track it with your order ID.</p><a class="btn" href="track-order.html"><span>Track an order</span></a></div>`; return; }
    document.title = `Order ${o.id} confirmed | ChitChat Coffee`;
    root.innerHTML = `<div class="success">
      <svg class="check" viewBox="0 0 110 110"><circle cx="55" cy="55" r="48"/><path d="M33 57l15 15 30-33"/></svg>
      <h1>Thank you, ${esc(o.customer.name.split(' ')[0])}!</h1>
      <p class="muted">Your order has been placed and the roasters are on it.</p>
      <div class="order-id">${o.id}</div>
      <p>Estimated delivery by <b>${etaDate(o)}</b> · ${esc(SHIP[o.ship].label)}</p>
      ${summaryCard(o)}
      <div class="o-card" style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div><small class="muted">DELIVERING TO</small><p><b>${esc(o.customer.name)}</b><br>${esc(o.address.line)}<br>${esc(o.address.city)}, ${esc(o.address.state)} ${esc(o.address.pin)}<br>${esc(o.customer.phone)}</p></div><div><small class="muted">PAYMENT</small><p><b>${esc(payLabel(o))}</b><br>${o.pay.method === 'cod' ? 'Pay on delivery' : 'Paid (demo)'}</p>${o.note ? `<small class="muted">NOTE</small><p>${esc(o.note)}</p>` : ''}</div></div>
      <a class="btn magnetic" href="track-order.html?id=${o.id}"><span>Track this order</span></a> &nbsp; <a class="btn btn-ghost" href="shop.html"><span>Keep shopping</span></a>
    </div>`;
    if (!reduce) for (let i = 0; i < 36; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.cssText = `left:${Math.random() * 100}vw;animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.2}s;width:${10 + Math.random() * 12}px;height:${15 + Math.random() * 16}px;opacity:${.6 + Math.random() * .4}`;
      document.body.appendChild(c); setTimeout(() => c.remove(), 7000);
    }
  }

  /* ---------- track ---------- */
  if (page === 'track') {
    const root = $('#trackRoot'), qs = new URLSearchParams(location.search);
    const recent = Orders.all();
    root.innerHTML = `
      <form class="track-form" id="tf" novalidate>
        <div class="field"><label for="oid">Order ID</label><input id="oid" type="text" placeholder="e.g. CC123456" value="${esc(qs.get('id') || '')}" autocomplete="off"><p class="err">Enter your order ID.</p></div>
        <div class="field"><label for="ov">Email or phone</label><input id="ov" type="text" placeholder="used at checkout" autocomplete="off"><p class="err">Enter the email or phone used at checkout.</p></div>
        <button class="btn btn-dark" type="submit"><span>Track</span></button>
      </form>
      <div id="result"></div>
      ${recent.length ? `<div class="recent"><h3 style="margin-bottom:12px">Orders on this device</h3>${recent.map(o => `<a href="track-order.html?id=${o.id}" data-id="${o.id}"><span><b>${o.id}</b> · ${fmt(o.createdAt)}</span><span>${money(o.totals.total)} →</span></a>`).join('')}</div>` : ''}`;

    function show(o) {
      const stage = Orders.stage(o), pct = stage / (TRACK.length - 1) * 100;
      $('#result').innerHTML = `
        <div class="o-card" style="margin-top:26px"><div class="o-row"><span>Order <b>${o.id}</b></span><span>${fmt(o.createdAt)}</span></div>
          <div class="o-row"><span class="muted">Deliver to ${esc(o.address.city)} ${esc(o.address.pin)}</span><span class="muted">${money(o.totals.total)}</span></div>
          <ul class="timeline" id="tl">${TRACK.map((t, i) => `<li class="${i < stage ? 'done' : i === stage ? 'now' : ''}"><b>${t[0]}</b><small>${i <= stage ? fmt(o.createdAt + t[1] * 60000 / DEMO_SPEED) : 'Pending'}</small></li>`).join('')}</ul>
          <p class="muted small" style="margin-top:6px">Demo mode: tracking runs at accelerated speed (1 minute = 1 hour) so you can watch it progress.</p></div>
        ${summaryCard(o)}`;
      const tl = $('#tl'); requestAnimationFrame(() => setTimeout(() => tl.style.setProperty('--h', `calc(${pct}% - 6px)`), 80));
    }
    const run = (id, v) => {
      const bad = (el, b) => el.closest('.field').classList.toggle('bad', b);
      const o = Orders.find(id); bad($('#oid'), !id);
      const norm = s => String(s).toLowerCase().replace(/\s/g, '').replace(/^\+?91(?=\d{10}$)/, '');
      const ok = o && v && (norm(o.customer.email) === norm(v) || norm(o.customer.phone) === norm(v));
      bad($('#ov'), !v);
      if (!id || !v) return;
      if (!ok) { $('#result').innerHTML = `<div class="o-card" style="margin-top:26px;text-align:center"><b>No matching order found.</b><p class="muted">Check the order ID and the email or phone you used at checkout. Orders are stored in the browser used to place them.</p></div>`; return; }
      show(o);
    };
    $('#tf').addEventListener('submit', e => { e.preventDefault(); run($('#oid').value, $('#ov').value.trim()); });
    // convenience: opening from "orders on this device" or the confirmation page pre-fills the matching contact
    const pre = Orders.find(qs.get('id'));
    if (pre) { $('#ov').value = pre.customer.email; run(pre.id, pre.customer.email); }
  }
})();
