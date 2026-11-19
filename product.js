(() => {
  const { $, $$, esc, money, card, stars, store, toast, observe } = App;
  const id = new URLSearchParams(location.search).get('id');
  const p = DATA.byId(id), root = $('#pdpRoot');

  if (!p) {
    document.title = 'Product not found | ChitChat Coffee';
    root.innerHTML = `<div class="empty container" style="padding-top:120px"><div class="empty-ico">${DATA.icon('cup', 80)}</div><h4>We couldn't find that coffee</h4><p>It may have been renamed or is no longer available.</p><a class="btn" href="shop.html"><span>Back to shop</span></a></div>`;
    return;
  }
  document.title = `${p.short} | ChitChat Coffee`;
  $('meta[name=description]').content = p.blurb || p.name;

  /* structured data for search engines */
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.blurb, brand: 'ChitChat Coffee', offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: 'https://schema.org/InStock' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews } });
  document.head.appendChild(ld);

  const life = DATA.LIFESTYLE[p.cat], gallery = [{ kind: 'pack' }, { kind: 'img', src: life }, { kind: 'img', src: 'images/beans-bg.jpg' }];
  const KEY = 'chitchat.reviews.' + p.id;
  const seed = [
    { n: 'Ananya R.', r: 5, t: 'Opened the pack and the whole kitchen smelled amazing. Smooth, no bitterness at all.', d: '2 weeks ago' },
    { n: 'Karthik S.', r: 4, t: 'Great flavour and very fresh. Delivery was quick and the packaging is lovely.', d: '1 month ago' },
    { n: 'Meera P.', r: 5, t: 'Reordered three times already. This is now our default morning coffee.', d: '2 months ago' }
  ];
  const userReviews = () => store.get(KEY, []);
  const allReviews = () => [...userReviews(), ...seed];

  const brew = {
    filter: [['Ratio', '2 tbsp per 100 ml hot water'], ['Water', '90–95°C, freshly boiled'], ['Time', 'Let the decoction drip 10–12 min'], ['Serve', 'Mix 1:3 with hot milk, sweeten to taste']],
    default: [['Ratio', '1:16: 15 g coffee to 240 ml water'], ['Water', '92–96°C, filtered'], ['Time', '2:30–3:30 min brew time'], ['Grind', 'Match the grind to your brewer']]
  };
  const bg = p.cat === 'filter' ? brew.filter : brew.default;
  const roastPos = p.roast ? (p.roast - 1) / 4 * 100 : null;

  root.innerHTML = `
  <div class="container crumbs"><a href="index.html">Home</a><span>›</span><a href="shop.html">Shop</a><span>›</span><a href="shop.html?cat=${p.cat}">${esc(DATA.catLabel(p.cat))}</a><span>›</span>${esc(p.short)}</div>
  <section class="container pdp">
    <div class="gal">
      <div class="gal-main" id="galMain"></div>
      <div class="thumbs" id="thumbs"></div>
    </div>
    <div class="pdp-info">
      <p class="eyebrow">${esc(DATA.catLabel(p.cat))}</p>
      <h1>${esc(p.name)}</h1>
      <p class="rating">${stars(p.rating)} <b>${p.rating}</b> <a href="#reviews" data-tab="reviews">${p.reviews + userReviews().length} reviews</a></p>
      <p class="blurb">${esc(p.blurb || '')}</p>
      ${p.notes.length ? `<p class="chips">${p.notes.map(n => `<span>${esc(n)}</span>`).join('')}</p>` : ''}
      <div id="buy"></div>
      <div class="meta-grid">
        <div><small>Origin</small><b>${esc(p.origin || 'n/a')}</b></div>
        <div><small>Type</small><b>${esc(p.type)}</b></div>
        <div><small>Roast</small><b>${p.roast ? DATA.ROAST[p.roast] : 'n/a'}</b></div>
      </div>
      ${roastPos !== null ? `<div class="roast-meter"><p><span>Light</span><span>Roast level</span><span>Dark</span></p><div><i id="roastDot" style="left:0%"></i></div></div>` : ''}
      <div class="perks"><div>🚚 Free shipping over ₹599</div><div>🔥 Roasted to order</div><div>↩️ 7-day easy returns</div><div>🔒 Secure checkout</div></div>
    </div>
  </section>

  <section class="tabs">
    <div class="tab-list" role="tablist"><button class="on" data-tab="desc">Description</button><button data-tab="brew">Brewing guide</button><button data-tab="ship">Shipping &amp; returns</button><button data-tab="reviews" id="revTab">Reviews</button></div>
    <div class="tab-panel on" id="t-desc"><p>${esc(p.blurb || '')}</p><p>Grown, processed and roasted by us in small batches, ${esc(p.name)} is packed fresh on the day it is roasted and sealed with a one-way valve to keep it tasting its best.</p><ul>${p.notes.map(n => `<li>Tasting note: ${esc(n)}</li>`).join('')}</ul></div>
    <div class="tab-panel" id="t-brew"><div class="brew-grid">${bg.map(b => `<div><h5>${b[0]}</h5><p>${b[1]}</p></div>`).join('')}</div></div>
    <div class="tab-panel" id="t-ship"><ul><li>Orders ship within 24 hours. Standard delivery takes 3–5 business days, express 1–2 days.</li><li>Free standard shipping on orders over ₹599.</li><li>Unopened items can be returned within 7 days of delivery. Damaged items are replaced free of charge.</li></ul><p><a class="link-arrow" href="policies.html#shipping">Read the full policy →</a></p></div>
    <div class="tab-panel" id="t-reviews"><div class="reviews" id="reviews"></div></div>
  </section>

  <section class="container related"><h2>You may also like</h2><div class="pgrid" id="related"></div></section>`;

  /* ---- gallery ---- */
  const main = $('#galMain'), thumbs = $('#thumbs');
  const showG = i => {
    const g = gallery[i];
    main.innerHTML = (p.badge ? `<span class="pc-badge ${/SALE/.test(p.badge) ? 'sale' : /BEST/.test(p.badge) ? 'best' : 'new'}">${esc(p.badge)}</span>` : '') + (g.kind === 'pack' ? DATA.visual(p) : `<img src="${g.src}" alt="${esc(p.short)} lifestyle photo">`);
    $$('button', thumbs).forEach((b, k) => b.classList.toggle('on', k === i));
  };
  thumbs.innerHTML = gallery.map((g, i) => `<button aria-label="View image ${i + 1}">${g.kind === 'pack' ? DATA.visual(p) : `<img src="${g.src}" alt="">`}</button>`).join('');
  thumbs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showG($$('button', thumbs).indexOf(b)); });
  main.addEventListener('mousemove', e => {
    const img = $('img', main); if (!img) return; const r = main.getBoundingClientRect();
    img.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`; img.style.transform = 'scale(1.6)';
  });
  main.addEventListener('mouseleave', () => { const img = $('img', main); if (img) img.style.transform = ''; });
  showG(0);

  App.mountBuyBox($('#buy'), p, { buyNow: true });
  const dot = $('#roastDot'); if (dot) setTimeout(() => (dot.style.left = roastPos + '%'), 400);

  /* ---- tabs ---- */
  const tab = name => {
    $$('.tab-list button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
    $$('.tab-panel').forEach(t => t.classList.toggle('on', t.id === 't-' + name));
  };
  $('.tab-list').addEventListener('click', e => { const b = e.target.closest('button'); if (b) tab(b.dataset.tab); });
  document.addEventListener('click', e => { const a = e.target.closest('a[data-tab]'); if (a) { e.preventDefault(); tab(a.dataset.tab); $('.tabs').scrollIntoView({ behavior: 'smooth' }); } });

  /* ---- reviews ---- */
  function renderReviews() {
    const rs = allReviews(), avg = rs.reduce((a, r) => a + r.r, 0) / rs.length;
    const dist = [5, 4, 3, 2, 1].map(s => rs.filter(r => r.r === s).length);
    $('#revTab').textContent = `Reviews (${rs.length})`;
    $('#reviews').innerHTML = `
      <div class="rev-sum"><big>${avg.toFixed(1)}</big>${stars(avg)}<p class="muted small">${rs.length} reviews</p>
        <div class="rev-bars">${[5, 4, 3, 2, 1].map((s, i) => `<div><span>${s}★</span><i><b style="width:${rs.length ? dist[i] / rs.length * 100 : 0}%"></b></i><span>${dist[i]}</span></div>`).join('')}</div></div>
      <div>${rs.map(r => `<div class="rev"><header><b>${esc(r.n)}</b><span class="muted small">${esc(r.d)}</span></header>${stars(r.r)}<p>${esc(r.t)}</p></div>`).join('')}
        <form class="rev-form" id="revForm" novalidate><h3>Write a review</h3>
          <div class="field"><label for="rn">Your name</label><input id="rn" type="text" maxlength="40" placeholder="e.g. Priya"><p class="err">Please enter your name.</p></div>
          <div class="field"><label>Rating</label><div class="star-input" role="radiogroup" aria-label="Rating">${[5, 4, 3, 2, 1].map(n => `<input type="radio" name="rate" id="s${n}" value="${n}"><label for="s${n}" title="${n} stars">★</label>`).join('')}</div><p class="err">Please choose a rating.</p></div>
          <div class="field"><label for="rt">Your review</label><textarea id="rt" rows="3" maxlength="400" placeholder="What did you think of the coffee?"></textarea><p class="err">Please write at least 10 characters.</p></div>
          <button class="btn btn-dark" type="submit"><span>Submit review</span></button></form></div>`;
    $('#revForm').addEventListener('submit', e => {
      e.preventDefault();
      const n = $('#rn').value.trim(), t = $('#rt').value.trim(), r = +(($('input[name=rate]:checked') || {}).value || 0);
      const set = (el, bad) => el.closest('.field').classList.toggle('bad', bad);
      set($('#rn'), n.length < 2); set($('#rt'), t.length < 10); $('.star-input').closest('.field').classList.toggle('bad', !r);
      if (n.length < 2 || t.length < 10 || !r) return;
      store.set(KEY, [{ n, r, t, d: 'Just now' }, ...userReviews()]);
      toast('Thanks! Your review was posted.'); renderReviews();
    });
  }
  renderReviews();

  /* ---- related ---- */
  const rel = DATA.products.filter(x => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat) || b.rating - a.rating).slice(0, 4);
  $('#related').innerHTML = rel.map((x, i) => card(x, i)).join('');
  $$('#related .pcard').forEach(c => c.classList.add('reveal')); observe($('#related'));
})();
