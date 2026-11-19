/* Shared layer: layout, cart store, cart drawer, quick view, toasts, orders, global effects */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const D = window.DATA;
  const page = document.body.dataset.page || '';

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };

  /* =====================================================  CART STORE  */
  const CART_KEY = 'chitchat.cart.v1';
  const MAX_QTY = 20, FREE_SHIP_AT = 599;
  const COUPONS = {
    CHAT10: { type: 'pct', value: 10, label: '10% off your order' },
    WELCOME50: { type: 'flat', value: 50, min: 399, label: '₹50 off orders above ₹399' },
    FREESHIP: { type: 'ship', label: 'Free shipping' }
  };
  const SHIP = {
    standard: { label: 'Standard delivery', eta: '3–5 business days', fee: sub => (sub >= FREE_SHIP_AT ? 0 : 60) },
    express: { label: 'Express delivery', eta: '1–2 business days', fee: () => 120 }
  };
  const COD_FEE = 30;

  let state = store.get(CART_KEY, null);
  if (!state || !Array.isArray(state.items)) state = { items: [], coupon: null, note: '' };
  state.items = state.items.filter(i => i && i.key && i.qty > 0 && i.unit >= 0);

  const emit = () => document.dispatchEvent(new CustomEvent('cart:change'));
  const save = () => { store.set(CART_KEY, state); emit(); };

  const Cart = {
    get items() { return state.items; },
    get coupon() { return state.coupon; },
    get note() { return state.note || ''; },
    setNote(n) { state.note = String(n).slice(0, 300); store.set(CART_KEY, state); },
    count: () => state.items.reduce((a, i) => a + i.qty, 0),
    subtotal: () => state.items.reduce((a, i) => a + i.unit * i.qty, 0),
    add(item) {
      const key = [item.pid, item.size, item.grind || '', item.mix || '', item.pid === 'custom' ? item.name : ''].join('|');
      const ex = state.items.find(i => i.key === key);
      if (ex) ex.qty = Math.min(MAX_QTY, ex.qty + item.qty);
      else state.items.push({ ...item, key, qty: Math.min(MAX_QTY, item.qty) });
      save();
    },
    setQty(key, q) {
      const it = state.items.find(i => i.key === key); if (!it) return;
      if (q <= 0) return Cart.remove(key);
      it.qty = Math.min(MAX_QTY, q); save();
    },
    remove(key) { state.items = state.items.filter(i => i.key !== key); save(); },
    clear() { state.items = []; state.coupon = null; state.note = ''; save(); },
    applyCoupon(code) {
      const c = String(code || '').trim().toUpperCase();
      const def = COUPONS[c];
      if (!c) return { ok: false, msg: 'Enter a coupon code.' };
      if (!def) return { ok: false, msg: 'That code is not valid.' };
      if (def.min && Cart.subtotal() < def.min) return { ok: false, msg: `Add ${money(def.min - Cart.subtotal())} more to use ${c}.` };
      state.coupon = c; save();
      return { ok: true, msg: `${c} applied: ${def.label}.` };
    },
    removeCoupon() { state.coupon = null; save(); },
    totals({ ship = 'standard', cod = false } = {}) {
      const subtotal = Cart.subtotal();
      const def = state.coupon ? COUPONS[state.coupon] : null;
      let discount = 0, couponOk = !!def;
      if (def) {
        if (def.min && subtotal < def.min) couponOk = false;
        else if (def.type === 'pct') discount = Math.round(subtotal * def.value / 100);
        else if (def.type === 'flat') discount = Math.min(def.value, subtotal);
      }
      let shipping = subtotal ? SHIP[ship].fee(subtotal) : 0;
      if (def && def.type === 'ship' && couponOk) shipping = 0;
      const codFee = cod && subtotal ? COD_FEE : 0;
      const total = Math.max(0, subtotal - discount) + shipping + codFee;
      return { subtotal, discount, shipping, codFee, total, couponOk, coupon: state.coupon, toFree: Math.max(0, FREE_SHIP_AT - subtotal) };
    }
  };
  addEventListener('storage', e => { if (e.key === CART_KEY) { state = store.get(CART_KEY, { items: [], coupon: null, note: '' }); emit(); } });

  /* =====================================================  ORDERS (browser-stored demo)  */
  const ORD_KEY = 'chitchat.orders.v1';
  const TRACK = [
    ['Order placed', 0], ['Confirmed', 1], ['Roasting your beans', 5], ['Packed fresh', 30],
    ['Shipped', 180], ['Out for delivery', 2880], ['Delivered', 4320]
  ];
  const DEMO_SPEED = 60; // 1 real minute = 1 simulated hour
  const Orders = {
    all: () => store.get(ORD_KEY, []),
    find(id) { return Orders.all().find(o => o.id === String(id || '').trim().toUpperCase()); },
    create(o) {
      const id = 'CC' + Math.floor(100000 + Math.random() * 900000);
      const order = { ...o, id, createdAt: Date.now() };
      store.set(ORD_KEY, [order, ...Orders.all()].slice(0, 25));
      return order;
    },
    stage(o) {
      const mins = (Date.now() - o.createdAt) / 60000 * DEMO_SPEED;
      let idx = 0; TRACK.forEach((t, i) => { if (mins >= t[1]) idx = i; });
      return idx;
    }
  };

  /* =====================================================  LAYOUT  */
  const LINKS = [
    ['home', 'index.html', 'home'], ['shop', 'shop.html', 'shop'], ['blend', 'blend.html', 'blend your own coffee'],
    ['about', 'about.html', 'about'], ['distributor', 'contact.html#distributor', 'become a distributor'], ['contact', 'contact.html', 'contact']
  ];
  const headerHTML = `
<header class="site-header" id="top">
  <a class="logo" href="index.html">CHITCHAT<span>.</span></a>
  <nav class="nav" id="nav" aria-label="Main">
    ${LINKS.map(l => `<a href="${l[1]}"${page === l[0] ? ' class="active" aria-current="page"' : ''}>${l[2]}</a>`).join('')}
  </nav>
  <div class="header-actions">
    <button class="cart" id="cartIcon" aria-label="Open cart">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6h15l-1.500 9h-12z"/><path d="M6 6 5 3H2"/><circle cx="9" cy="20" r="1.500"/><circle cx="18" cy="20" r="1.500"/></svg>
      <b id="cartCount">0</b>
    </button>
    <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><i></i><i></i><i></i></button>
  </div>
</header>`;
  const footerHTML = `
<footer class="footer" id="contact-footer">
  <div class="foot-grid">
    <div>
      <a class="logo" href="index.html">CHITCHAT<span>.</span></a>
      <p class="tag">SPECIALTY COFFEE ROASTERS</p>
      <p>123 Estate Road, Coffee Town,<br>Karnataka 000000</p>
      <p>+91 00000 00000<br>hello@example.com</p>
    </div>
    <div><h4>QUICK LINKS</h4>
      <a href="shop.html">Shop</a><a href="blend.html">Custom Blend</a><a href="about.html">About</a><a href="contact.html#distributor">Become a Distributor</a><a href="contact.html">Contact Us</a></div>
    <div><h4>CUSTOMER CARE</h4>
      <a href="track-order.html">Track Order</a><a href="policies.html#shipping">Shipping &amp; Delivery</a><a href="policies.html#returns">Returns &amp; Refunds</a></div>
  </div>
  <div class="foot-bottom">
    <p>© 2026 ChitChat Specialty Coffee Roasters. All rights reserved.</p>
    <p><a href="policies.html#privacy">Privacy Policy</a> · <a href="policies.html#terms">Terms &amp; Conditions</a></p>
  </div>
  <p class="photo-credit">Photos via Unsplash.</p>
</footer>
<a class="whatsapp" href="https://wa.me/910000000000" aria-label="WhatsApp"><svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.600 15L2 22l5.200-1.400A10 10 0 1 0 12 2zm5.200 14.100c-.2.600-1.300 1.200-1.800 1.200-.5.100-1 .2-3.300-.7-2.800-1.100-4.600-4-4.700-4.200-.1-.2-1.100-1.500-1.100-2.800 0-1.400.7-2 1-2.300.2-.3.500-.3.700-.3h.5c.2 0 .4 0 .6.500l.8 2c.1.200.1.400 0 .5l-.4.600c-.1.200-.3.300-.1.600.2.300.8 1.300 1.700 2.100 1.100 1 2 1.300 2.300 1.400.3.100.5.100.6-.1l.9-1.100c.2-.3.400-.2.600-.1l1.900.9c.3.100.5.200.5.300.1.200.1.700-.1 1.200z"/></svg></a>`;
  const drawerHTML = `
<div class="overlay" id="overlay"></div>
<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden="true">
  <div class="drawer-head"><h3>Your cart <span id="drawerCount"></span></h3><button class="icon-btn" id="drawerClose" aria-label="Close cart">✕</button></div>
  <div class="ship-bar" id="shipBar"></div>
  <div class="drawer-items" id="drawerItems"></div>
  <div class="drawer-foot" id="drawerFoot"></div>
</aside>
<div class="modal" id="modal" role="dialog" aria-modal="true" aria-hidden="true"><div class="modal-box" id="modalBox"></div></div>
<div class="toasts" id="toasts" aria-live="polite"></div>
<div class="progress" id="progress"></div>
<div class="curtain" id="curtain"></div>
<div class="cursor-dot" id="cursorDot"></div><div class="cursor-ring" id="cursorRing"><span></span></div>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);
  document.body.insertAdjacentHTML('beforeend', footerHTML + drawerHTML);

  /* =====================================================  TOASTS  */
  function toast(msg, opts = {}) {
    const t = document.createElement('div');
    t.className = 'toast' + (opts.type ? ' ' + opts.type : '');
    t.innerHTML = `<span>${esc(msg)}</span>`;
    if (opts.action) {
      const b = document.createElement('button'); b.textContent = opts.action.label;
      b.onclick = () => { opts.action.fn(); t.remove(); }; t.appendChild(b);
    }
    $('#toasts').appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, opts.ms || 3200);
  }

  /* =====================================================  VISUAL HELPERS  */
  function thumb(item) {
    const p = D.byId(item.pid);
    if (p) return D.visual(p);
    const sc = (item.custom && item.custom.scheme) || 'dark';
    return `<div class="pvis" style="--tint:${D.SCHEMES[sc].tint}">${D.pouch({ name: (item.custom && item.custom.label) || 'Custom Blend', scheme: sc, sub: item.size })}</div>`;
  }
  const itemMeta = i => [i.size, i.grind, i.mix].filter(Boolean).map(esc).join(' · ');
  const stars = r => `<span class="stars" style="--r:${(r / 5 * 100).toFixed(0)}%" aria-label="${r} out of 5">★★★★★</span>`;

  /* =====================================================  CART DRAWER  */
  const overlay = $('#overlay'), drawer = $('#drawer');
  let lastFocus = null;
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add('open'); overlay.classList.add('show'); drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lock'); setTimeout(() => $('#drawerClose').focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove('open'); overlay.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true');
    if (!$('#modal.open')) document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#cartIcon').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', () => { closeDrawer(); closeModal(); });

  function qtyCtl(key, q) {
    return `<div class="qty" data-key="${esc(key)}"><button data-qty="-1" aria-label="Decrease">−</button><span>${q}</span><button data-qty="1" aria-label="Increase">+</button></div>`;
  }
  function renderDrawer() {
    const items = Cart.items, t = Cart.totals();
    $('#cartCount').textContent = Cart.count();
    $('#drawerCount').textContent = items.length ? `(${Cart.count()})` : '';
    const pct = Math.min(100, t.subtotal / FREE_SHIP_AT * 100);
    $('#shipBar').innerHTML = items.length
      ? `<p>${t.toFree > 0 ? `Add <b>${money(t.toFree)}</b> more for <b>free shipping</b>` : '🎉 You\'ve unlocked <b>free shipping</b>'}</p><div class="bar"><i style="width:${pct}%"></i></div>` : '';
    $('#drawerItems').innerHTML = items.length ? items.map(i => `
      <div class="d-item">
        <a class="d-thumb" href="${i.pid === 'custom' ? 'blend.html' : 'product.html?id=' + esc(i.pid)}">${thumb(i)}</a>
        <div class="d-info"><h4>${esc(i.name)}</h4><p class="muted">${itemMeta(i)}</p>
          <div class="d-row">${qtyCtl(i.key, i.qty)}<b>${money(i.unit * i.qty)}</b></div></div>
        <button class="d-remove" data-remove="${esc(i.key)}" aria-label="Remove ${esc(i.name)}">✕</button>
      </div>`).join('') : `<div class="empty"><div class="empty-ico">${D.icon('cup', 64)}</div><h4>Your cart is empty</h4><p>Fresh roasted coffee is just a click away.</p><a class="btn" href="shop.html"><span>Start shopping</span></a></div>`;
    $('#drawerFoot').innerHTML = items.length ? `
      <div class="sum-row"><span>Subtotal</span><b>${money(t.subtotal)}</b></div>
      <p class="muted small">Shipping, taxes and coupons are applied at checkout.</p>
      <div class="d-btns"><a class="btn btn-ghost" href="cart.html"><span>View cart</span></a><a class="btn" href="checkout.html"><span>Checkout</span></a></div>` : '';
  }
  document.addEventListener('cart:change', renderDrawer);
  let lastCount = Cart.count();
  document.addEventListener('cart:change', () => {
    if (Cart.count() > lastCount) { const c = $('#cartIcon'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    lastCount = Cart.count();
  });
  renderDrawer();

  // qty +/- and remove (delegated, works in drawer, cart page, checkout)
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-qty]');
    if (q) {
      const key = q.closest('[data-key]').dataset.key, it = Cart.items.find(i => i.key === key);
      if (it) Cart.setQty(key, it.qty + (+q.dataset.qty));
      return;
    }
    const r = e.target.closest('[data-remove]');
    if (r) {
      const key = r.dataset.remove, it = Cart.items.find(i => i.key === key);
      const row = r.closest('.d-item, .c-item');
      const doRemove = () => { Cart.remove(key); if (it) toast(`Removed ${it.name}`, { action: { label: 'Undo', fn: () => Cart.add(it) } }); };
      if (row && !reduce) { row.classList.add('removing'); setTimeout(doRemove, 300); } else doRemove();
    }
  });

  /* =====================================================  BUY BOX + QUICK VIEW  */
  function needsOptions(p) { return p.sizes.length > 1 || p.grind; }

  function addToCart(p, o = {}, srcEl) {
    const size = o.size || p.sizes[0];
    Cart.add({ pid: p.id, name: p.short, size, grind: o.grind || '', unit: D.priceFor(p, size), qty: o.qty || 1 });
    if (srcEl) fly(srcEl);
    toast(`${p.short} added to cart`, { action: { label: 'View cart', fn: openDrawer } });
  }

  /** Renders size/grind/qty/add controls into `el` */
  function mountBuyBox(el, p, opts = {}) {
    const st = { size: p.sizes[0], grind: p.grind ? 'Whole Bean' : '', qty: 1 };
    el.innerHTML = `
      <div class="bb-price"><b id="bbPrice"></b><s id="bbMrp"></s><small id="bbSave"></small></div>
      ${p.sizes.length > 1 ? `<div class="bb-field"><label>Pack size</label><div class="pills" id="bbSizes">${p.sizes.map((s, i) => `<button type="button" class="pill${i ? '' : ' on'}" data-size="${s}">${s}</button>`).join('')}</div></div>` : (p.sizes[0] !== 'Standard' ? `<p class="muted">Pack: <b>${esc(p.sizes[0])}</b></p>` : '')}
      ${p.grind ? `<div class="bb-field"><label for="bbGrind">Grind type</label><select id="bbGrind">${D.GRINDS.map(g => `<option>${g}</option>`).join('')}</select></div>` : ''}
      <div class="bb-actions">
        <div class="qty big" id="bbQty"><button type="button" data-d="-1" aria-label="Decrease">−</button><span>1</span><button type="button" data-d="1" aria-label="Increase">+</button></div>
        <button type="button" class="btn grow" id="bbAdd"><span>Add to cart</span></button>
        ${opts.buyNow ? '<button type="button" class="btn btn-dark" id="bbBuy"><span>Buy now</span></button>' : ''}
      </div>`;
    const price = () => {
      const u = D.priceFor(p, st.size);
      $('#bbPrice', el).textContent = money(u * st.qty);
      const mrp = p.mrp && p.sizes.length === 1 ? p.mrp * st.qty : 0;
      $('#bbMrp', el).textContent = mrp ? money(mrp) : '';
      $('#bbSave', el).textContent = mrp ? `Save ${money(mrp - u * st.qty)}` : '';
    };
    price();
    el.addEventListener('click', e => {
      const sz = e.target.closest('[data-size]');
      if (sz) { st.size = sz.dataset.size; $$('.pill', el).forEach(b => b.classList.toggle('on', b === sz)); price(); }
      const d = e.target.closest('#bbQty [data-d]');
      if (d) { st.qty = Math.min(MAX_QTY, Math.max(1, st.qty + (+d.dataset.d))); $('#bbQty span', el).textContent = st.qty; price(); }
    });
    const gsel = $('#bbGrind', el); if (gsel) gsel.addEventListener('change', () => (st.grind = gsel.value));
    const doAdd = btn => { addToCart(p, { size: st.size, grind: st.grind, qty: st.qty }, btn); };
    $('#bbAdd', el).addEventListener('click', e => { doAdd(e.currentTarget); if (opts.onAdd) opts.onAdd(); });
    const buy = $('#bbBuy', el);
    if (buy) buy.addEventListener('click', () => { Cart.add({ pid: p.id, name: p.short, size: st.size, grind: st.grind, unit: D.priceFor(p, st.size), qty: st.qty }); location.href = 'checkout.html'; });
  }

  const modal = $('#modal');
  function closeModal() {
    modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true');
    if (!drawer.classList.contains('open')) { document.body.classList.remove('lock'); overlay.classList.remove('show'); }
  }
  function quickView(id) {
    const p = D.byId(id); if (!p) return;
    $('#modalBox').innerHTML = `
      <button class="icon-btn modal-x" id="modalClose" aria-label="Close">✕</button>
      <div class="qv"><div class="qv-media">${D.visual(p)}</div>
        <div class="qv-info"><p class="eyebrow">${esc(D.catLabel(p.cat))}</p><h3>${esc(p.name)}</h3>
          <p class="rating">${stars(p.rating)} <span>${p.rating} · ${p.reviews} reviews</span></p>
          <p class="muted">${esc(p.blurb || '')}</p>
          ${p.notes.length ? `<p class="chips">${p.notes.map(n => `<span>${esc(n)}</span>`).join('')}</p>` : ''}
          <div id="qvBuy"></div>
          <a class="link-arrow" href="product.html?id=${esc(p.id)}">View full details →</a></div></div>`;
    mountBuyBox($('#qvBuy'), p, { onAdd: closeModal });
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); overlay.classList.add('show'); document.body.classList.add('lock');
    $('#modalClose').addEventListener('click', closeModal);
  }
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeModal(); } });

  /* =====================================================  PRODUCT CARD  */
  function card(p, i = 0) {
    const sale = p.mrp > p.price, opts = needsOptions(p);
    const from = p.sizes.length > 1;
    const bcls = /SALE/.test(p.badge) ? 'sale' : /BEST/.test(p.badge) ? 'best' : 'new';
    return `<article class="pcard" style="--i:${i}" data-id="${esc(p.id)}">
      ${p.badge ? `<span class="pc-badge ${bcls}">${esc(p.badge)}</span>` : ''}
      <a class="pc-media" href="product.html?id=${esc(p.id)}" aria-label="${esc(p.name)}">${D.visual(p)}</a>
      <div class="pc-body">
        <p class="pc-cat">${esc(D.catLabel(p.cat))}</p>
        <h3><a href="product.html?id=${esc(p.id)}">${esc(p.name)}</a></h3>
        <p class="pc-rate">${stars(p.rating)} <span>(${p.reviews})</span></p>
        <p class="pc-tags">${p.origin ? `<span>${esc(p.origin)}</span>` : ''}${p.roast ? `<span>${D.ROAST[p.roast]} Roast</span>` : ''}${p.type === 'Gear' ? '<span>Brew gear</span>' : ''}</p>
        <div class="pc-foot">
          <p class="pc-price">${from ? '<small>from</small> ' : ''}${money(p.price)}${sale ? ` <s>${money(p.mrp)}</s>` : ''}</p>
          <button class="pc-btn" ${opts ? `data-quick="${esc(p.id)}"` : `data-add="${esc(p.id)}"`}>${opts ? 'View Options' : 'Add to Cart'}</button>
        </div>
      </div></article>`;
  }
  document.addEventListener('click', e => {
    const q = e.target.closest('[data-quick]'); if (q) return quickView(q.dataset.quick);
    const a = e.target.closest('[data-add]'); if (a) { const p = D.byId(a.dataset.add); if (p) addToCart(p, {}, a); }
  });

  /* =====================================================  EFFECTS  */
  function fly(from) {
    const to = $('#cartIcon').getBoundingClientRect(); if (reduce) return;
    const f = from.getBoundingClientRect(), bean = document.createElement('i'); bean.className = 'fly'; document.body.appendChild(bean);
    const sx = f.left + f.width / 2, sy = f.top + f.height / 2, dx = to.left + to.width / 2 - sx, dy = to.top + to.height / 2 - sy;
    bean.animate([
      { transform: `translate(${sx}px,${sy}px) scale(1.4) rotate(0)`, opacity: 1 },
      { transform: `translate(${sx + dx * .5}px,${sy - 120}px) scale(1) rotate(180deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${sx + dx}px,${sy + dy}px) scale(.3) rotate(360deg)`, opacity: .6 }
    ], { duration: 800, easing: 'cubic-bezier(.5,0,.7,.4)' }).onfinish = () => bean.remove();
  }

  // headline word-split
  let wi = 0;
  $$('[data-split]').forEach(el => {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w"><span style="--wi:${wi++}">${esc(w)}</span></span>`).join('');
  });

  // loaded state (home has its own preloader and fires this itself)
  function markLoaded() {
    if (document.body.classList.contains('loaded')) return;
    document.body.classList.add('loaded'); document.dispatchEvent(new Event('app:loaded'));
  }
  if (!$('#loader')) requestAnimationFrame(markLoaded);
  const whenLoaded = fn => (document.body.classList.contains('loaded') ? fn() : document.addEventListener('app:loaded', fn, { once: true }));

  // reveal-on-scroll (callable again after rendering dynamic content)
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  const imgIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { $$('.img-reveal', e.target).forEach(i => i.classList.add('in')); imgIO.unobserve(e.target); } }), { threshold: .25 });
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, target = +el.dataset.count, s = performance.now();
    whenLoaded(() => setTimeout(() => {
      const tick = now => { const p = Math.min(1, (now - s - 600) / 1800); el.textContent = Math.round(target * (1 - Math.pow(1 - Math.max(0, p), 3))).toLocaleString('en-IN'); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, 300));
  }), { threshold: .4 });
  function observe(root = document) {
    $$('.reveal:not(.in)', root).forEach(el => io.observe(el));
    $$('.img-reveal:not(.in)', root).forEach(el => imgIO.observe(el.parentElement));
    $$('[data-count]', root).forEach(el => cio.observe(el));
  }
  observe();

  // nav + header + progress + parallax
  const nav = $('#nav'), burger = $('#burger'), header = $('.site-header'), bar = $('#progress');
  burger.addEventListener('click', () => { const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
  $$('a', nav).forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  let lastY = scrollY, ticking = false;
  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('hide', y > lastY && y > 200 && !nav.classList.contains('open'));
    header.classList.toggle('compact', y > 80);
    if (!reduce) $$('[data-speed]').forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
      el.style.transform = `translate3d(0,${((r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed)).toFixed(1)}px,0)`;
    });
    lastY = y; ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // magnetic buttons + custom cursor
  if (fine && !reduce) {
    document.addEventListener('mousemove', e => {
      const b = e.target.closest && e.target.closest('.magnetic');
      if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; }
    });
    document.addEventListener('mouseout', e => { const b = e.target.closest && e.target.closest('.magnetic'); if (b) b.style.transform = ''; });
  }
  if (fine) {
    const dot = $('#cursorDot'), ring = $('#cursorRing'), label = $('span', ring);
    let mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener('mousemove', e => {
      if (!document.documentElement.classList.contains('has-cursor')) { rx = e.clientX; ry = e.clientY; document.documentElement.classList.add('has-cursor'); }
      mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`;
    });
    (function follow() { rx += (mx - rx) * .16; ry += (my - ry) * .16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(follow); })();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, summary, select, .pcard, .post, input[type=range], label.opt');
      ring.classList.toggle('hover', !!t);
      label.textContent = t && t.matches('.pcard') ? 'VIEW' : t && t.matches('.post') ? 'OPEN' : '';
    });
  }

  // FAQ accordions
  $$('details').forEach(d => {
    if (d.open) d.classList.add('open');
    const sum = $('summary', d); if (!sum) return;
    sum.addEventListener('click', e => {
      e.preventDefault();
      const willOpen = !d.classList.contains('open');
      $$('details', d.parentElement).forEach(o => { if (o !== d) { o.classList.remove('open'); setTimeout(() => !o.classList.contains('open') && (o.open = false), 500); } });
      if (willOpen) { d.open = true; requestAnimationFrame(() => d.classList.add('open')); }
      else { d.classList.remove('open'); setTimeout(() => !d.classList.contains('open') && (d.open = false), 500); }
    });
  });

  // page transitions
  addEventListener('pageshow', () => document.body.classList.remove('leaving'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || !/\.html?$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) return;
    if (reduce) return;
    e.preventDefault(); document.body.classList.add('leaving');
    setTimeout(() => { location.href = a.href; }, 420);
  });

  window.App = { $, $$, esc, money, store, Cart, Orders, COUPONS, SHIP, COD_FEE, FREE_SHIP_AT, TRACK, DEMO_SPEED, toast, card, thumb, itemMeta, stars, qtyCtl, openDrawer, closeDrawer, quickView, mountBuyBox, addToCart, observe, whenLoaded, markLoaded, fly, needsOptions, reduce, fine };
})();
