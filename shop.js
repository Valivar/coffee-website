(() => {
  const { $, $$, esc, money, card, observe } = App;
  const { products: ALL, CATS, ROAST } = DATA;
  const PAGE = 12;
  const maxP = Math.ceil(Math.max(...ALL.map(p => p.price)) / 50) * 50;
  const minP = Math.floor(Math.min(...ALL.map(p => p.price)) / 50) * 50;

  const S = { q: '', cat: '', sort: 'featured', max: maxP, roast: new Set(), origin: new Set(), type: new Set(), sale: false, shown: PAGE };

  /* ---- read state from URL ---- */
  const up = new URLSearchParams(location.search);
  S.q = up.get('q') || ''; if (CATS.some(c => c.id === up.get('cat'))) S.cat = up.get('cat');
  if (['price-asc', 'price-desc', 'rating', 'name'].includes(up.get('sort'))) S.sort = up.get('sort');
  const syncURL = () => {
    const p = new URLSearchParams();
    if (S.q) p.set('q', S.q); if (S.cat) p.set('cat', S.cat); if (S.sort !== 'featured') p.set('sort', S.sort);
    try { history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '')); } catch { /* file:// */ }
  };

  /* ---- hero pouches ---- */
  $('#heroPouches').innerHTML = ['honey-processed', 'elite-blend', 'directors-blend', 'estate-premium']
    .map(id => `<div>${DATA.pouch({ name: DATA.byId(id).short, scheme: DATA.byId(id).scheme, sub: '250g' })}</div>`).join('');

  /* ---- category circles ---- */
  $('#catRow').innerHTML = CATS.map(c => `<button class="cat-btn" data-cat="${c.id}" aria-pressed="false"><span class="cat-ico">${DATA.icon(c.icon, 56)}</span>${c.label}</button>`).join('');
  $('#catRow').addEventListener('click', e => {
    const b = e.target.closest('.cat-btn'); if (!b) return;
    S.cat = S.cat === b.dataset.cat ? '' : b.dataset.cat; S.shown = PAGE; render();
    if (S.cat) $('.shop-layout').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---- filter panel ---- */
  const facet = key => { const m = new Map(); ALL.forEach(p => { const v = key(p); if (v) m.set(v, (m.get(v) || 0) + 1); }); return [...m.entries()]; };
  const roastOpts = facet(p => p.roast ? ROAST[p.roast] : '').sort((a, b) => Object.values(ROAST).indexOf(a[0]) - Object.values(ROAST).indexOf(b[0]));
  const originOpts = facet(p => p.origin), typeOpts = facet(p => p.type);
  const group = (id, title, body, closed) => `<div class="f-group${closed ? ' closed' : ''}" data-g="${id}"><button type="button" aria-expanded="${!closed}">${title}<i>⌃</i></button><div class="f-body"><div>${body}</div></div></div>`;
  const checks = (name, opts) => opts.map(([v, n]) => `<label class="opt"><input type="checkbox" data-f="${name}" value="${esc(v)}"> ${esc(v)} <em>${n}</em></label>`).join('');
  $('#filters').innerHTML = `
    <div class="f-head"><h4>FILTERS</h4><button class="f-apply" id="apply">APPLY FILTERS</button></div>
    ${group('price', 'Max price', `<div class="f-range"><span>${money(minP)}</span><b id="priceLbl">Under ${money(maxP)}</b><span>${money(maxP)}</span></div><input type="range" id="price" min="${minP}" max="${maxP}" step="50" value="${maxP}" aria-label="Maximum price">`)}
    ${group('roast', 'Roast level', checks('roast', roastOpts))}
    ${group('type', 'Bean type', checks('type', typeOpts))}
    ${group('origin', 'Origin', checks('origin', originOpts), true)}
    ${group('offers', 'Offers', `<label class="opt"><input type="checkbox" id="sale"> On sale only</label>`, true)}
    <button class="f-clear" id="clear">Clear all filters</button>`;

  $('#filters').addEventListener('click', e => {
    const gb = e.target.closest('.f-group>button');
    if (gb) { const g = gb.parentElement; g.classList.toggle('closed'); gb.setAttribute('aria-expanded', !g.classList.contains('closed')); }
  });
  $('#filters').addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.f) { t.checked ? S[t.dataset.f].add(t.value) : S[t.dataset.f].delete(t.value); }
    if (t.id === 'sale') S.sale = t.checked;
    S.shown = PAGE; render();
  });
  $('#price').addEventListener('input', e => { S.max = +e.target.value; $('#priceLbl').textContent = 'Under ' + money(S.max); S.shown = PAGE; render(); });
  const resetFilters = () => { S.max = maxP; S.roast.clear(); S.origin.clear(); S.type.clear(); S.sale = false; S.cat = ''; S.q = ''; $('#q').value = ''; $('#price').value = maxP; $('#priceLbl').textContent = 'Under ' + money(maxP); $$('#filters input[type=checkbox]').forEach(c => (c.checked = false)); S.shown = PAGE; render(); };
  $('#clear').addEventListener('click', resetFilters);
  $('#apply').addEventListener('click', () => { $('#filters').classList.remove('open'); $('#overlay').classList.remove('show'); $('#pgrid').scrollIntoView({ behavior: 'smooth' }); });
  $('#fab').addEventListener('click', () => { $('#filters').classList.add('open'); $('#overlay').classList.add('show'); });
  $('#overlay').addEventListener('click', () => $('#filters').classList.remove('open'));

  /* ---- search + sort ---- */
  let t; $('#q').value = S.q;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { S.q = e.target.value.trim(); S.shown = PAGE; render(); }, 180); });
  $('#qClear').addEventListener('click', () => { $('#q').value = ''; S.q = ''; render(); $('#q').focus(); });
  $('#sort').value = S.sort; $('#sort').addEventListener('change', e => { S.sort = e.target.value; render(); });
  $('#more').addEventListener('click', () => { S.shown += PAGE; render(true); });

  /* ---- filtering ---- */
  const hay = p => [p.name, p.short, p.origin, p.type, DATA.catLabel(p.cat), p.roast ? ROAST[p.roast] : '', ...p.notes].join(' ').toLowerCase();
  function filtered() {
    const toks = S.q.toLowerCase().split(/\s+/).filter(Boolean);
    let list = ALL.filter(p => {
      if (S.cat && p.cat !== S.cat) return false;
      if (p.price > S.max) return false;
      if (S.roast.size && !S.roast.has(ROAST[p.roast])) return false;
      if (S.origin.size && !S.origin.has(p.origin)) return false;
      if (S.type.size && !S.type.has(p.type)) return false;
      if (S.sale && !(p.mrp > p.price)) return false;
      if (toks.length) { const h = hay(p); if (!toks.every(k => h.includes(k))) return false; }
      return true;
    });
    const sorters = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, name: (a, b) => a.short.localeCompare(b.short), featured: (a, b) => a.order - b.order };
    return list.sort(sorters[S.sort]);
  }

  function chips() {
    const out = [];
    if (S.cat) out.push(['cat', DATA.catLabel(S.cat)]);
    if (S.q) out.push(['q', `“${S.q}”`]);
    if (S.max < maxP) out.push(['max', 'Under ' + money(S.max)]);
    ['roast', 'type', 'origin'].forEach(k => S[k].forEach(v => out.push([k + ':' + v, v])));
    if (S.sale) out.push(['sale', 'On sale']);
    return out;
  }

  function render(append) {
    const list = filtered(), slice = list.slice(0, S.shown), ch = chips();
    $$('.cat-btn').forEach(b => { const on = b.dataset.cat === S.cat; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'coffee' : 'coffees'}`;
    $('#qClear').classList.toggle('is-hidden', !S.q);
    $('#fabCount').textContent = ch.length ? `(${ch.length})` : '';
    $('#activeFilters').innerHTML = ch.map(([k, l]) => `<span class="af">${esc(l)}<button data-x="${esc(k)}" aria-label="Remove filter ${esc(l)}">✕</button></span>`).join('');
    const prevCount = append ? $$('#pgrid .pcard').length : 0;
    $('#pgrid').innerHTML = slice.length ? slice.map((p, i) => card(p, Math.max(0, i - prevCount))).join('') :
      `<div class="no-results"><div style="color:var(--caramel)">${DATA.icon('cup', 70)}</div><h3>No coffees match your search</h3><p>Try removing a filter or searching for something like “chocolate” or “Arabica”.</p><button class="btn btn-dark" id="resetBtn"><span>Reset filters</span></button></div>`;
    $('#more').classList.toggle('is-hidden', slice.length >= list.length);
    $('#more').innerHTML = `<span>Load more (${list.length - slice.length} left)</span>`;
    const rb = $('#resetBtn'); if (rb) rb.addEventListener('click', resetFilters);
    syncURL();
  }
  $('#activeFilters').addEventListener('click', e => {
    const b = e.target.closest('[data-x]'); if (!b) return;
    const [k, v] = b.dataset.x.split(':');
    if (k === 'cat') S.cat = ''; else if (k === 'q') { S.q = ''; $('#q').value = ''; } else if (k === 'max') { S.max = maxP; $('#price').value = maxP; $('#priceLbl').textContent = 'Under ' + money(maxP); }
    else if (k === 'sale') { S.sale = false; $('#sale').checked = false; }
    else { S[k].delete(v); const cb = $$(`#filters input[data-f="${k}"]`).find(c => c.value === v); if (cb) cb.checked = false; }
    S.shown = PAGE; render();
  });

  render();
})();
