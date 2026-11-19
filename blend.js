(() => {
  const { $, $$, esc, money, Cart, toast, openDrawer, fly, reduce } = App;
  const PRICE = { A: 450, R: 330, C: 150 };          // per 250g
  const ATTR = ['Strength', 'Aroma', 'Body', 'Acidity', 'Sweetness'];
  const BASE = { A: [5, 9, 6, 8, 8], R: [9, 5, 9, 3, 3], C: [6, 3, 8, 1, 4] };
  const ROAST_ADJ = { light: [-1, 1, -1, 2, 1], medium: [0, 0, 0, 0, 0], dark: [2, -1, 1, -2, -1] };
  const ROAST_SCHEME = { light: 'gold', medium: 'kraft', dark: 'dark' };

  const S = { A: 60, R: 30, C: 10, roast: 'medium', size: '250g', qty: 1 };
  let shown = [0, 0, 0, 0, 0];

  $('#grind').innerHTML = DATA.GRINDS.map(g => `<option>${g}</option>`).join('');

  /* ---- sliders that always total 100 ---- */
  function setShare(k, v) {
    v = Math.max(0, Math.min(100, Math.round(v)));
    const others = ['A', 'R', 'C'].filter(x => x !== k), rest = 100 - v, sum = S[others[0]] + S[others[1]];
    let a = sum ? Math.round(S[others[0]] / sum * rest) : Math.round(rest / 2);
    S[k] = v; S[others[0]] = a; S[others[1]] = rest - a;
  }
  ['A', 'R', 'C'].forEach(k => $('#s' + k).addEventListener('input', e => { setShare(k, +e.target.value); update(); }));
  $('#roastPills').addEventListener('click', e => { const b = e.target.closest('.pill'); if (!b) return; S.roast = b.dataset.v; $$('#roastPills .pill').forEach(x => x.classList.toggle('on', x === b)); update(true); });
  $('#sizePills').addEventListener('click', e => { const b = e.target.closest('.pill'); if (!b) return; S.size = b.dataset.v; $$('#sizePills .pill').forEach(x => x.classList.toggle('on', x === b)); update(); });
  $('#bQty').addEventListener('click', e => { const d = e.target.closest('[data-d]'); if (!d) return; S.qty = Math.min(20, Math.max(1, S.qty + +d.dataset.d)); $('#bQty span').textContent = S.qty; update(); });
  $('#bname').addEventListener('input', () => { $('#bname').closest('.field').classList.remove('bad'); drawPouch(); });

  const profile = () => ATTR.map((_, i) => Math.max(0, Math.min(10, (['A', 'R', 'C'].reduce((a, k) => a + BASE[k][i] * S[k], 0) / 100) + ROAST_ADJ[S.roast][i])));
  const unit = () => Math.round((['A', 'R', 'C'].reduce((a, k) => a + PRICE[k] * S[k], 0) / 100) * DATA.SIZE_MULT[S.size] + (S.roast === 'dark' ? 0 : 0));
  const mixLabel = () => `A${S.A}/R${S.R}/C${S.C}`;

  function tasteText(p) {
    const [st, ar, bo, ac, sw] = p;
    const a = ac > 6 ? 'Bright & fruity' : st > 7 ? 'Bold & punchy' : bo > 7 ? 'Rich & full-bodied' : 'Smooth & balanced';
    const b = sw > 6 ? 'naturally sweet' : ar > 6 ? 'very aromatic' : 'with a bittersweet finish';
    return `${a}, ${b}`;
  }

  /* ---- radar ---- */
  const cx = 100, cy = 100, R = 70;
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  function drawRadar(vals) {
    const grid = [.33, .66, 1].map(f => `<polygon class="grid" points="${ATTR.map((_, i) => pt(i, R * f).join(',')).join(' ')}"/>`).join('');
    const axes = ATTR.map((_, i) => `<line class="grid" x1="${cx}" y1="${cy}" x2="${pt(i, R)[0]}" y2="${pt(i, R)[1]}"/>`).join('');
    const labels = ATTR.map((a, i) => { const [x, y] = pt(i, R + 16); return `<text x="${x}" y="${y + 3}">${a}</text>`; }).join('');
    $('#radar').innerHTML = `${grid}${axes}<polygon class="shape" points="${vals.map((v, i) => pt(i, R * v / 10).join(',')).join(' ')}"/>${labels}`;
  }
  function tween(to) {
    if (reduce) { shown = to; drawRadar(shown); return; }
    const from = [...shown], s = performance.now();
    cancelAnimationFrame(tween.id);
    (function step(now) {
      const p = Math.min(1, (now - s) / 450), e = 1 - Math.pow(1 - p, 3);
      shown = from.map((f, i) => f + (to[i] - f) * e); drawRadar(shown);
      if (p < 1) tween.id = requestAnimationFrame(step);
    })(s);
  }

  /* ---- pouch + readouts ---- */
  const nameVal = () => $('#bname').value.trim();
  function drawPouch(pop) {
    const sc = ROAST_SCHEME[S.roast];
    const box = $('#bPouch'); box.style.setProperty('--tint', DATA.SCHEMES[sc].tint);
    box.innerHTML = DATA.pouch({ name: nameVal() || 'Your Blend', scheme: sc, sub: `${S.size} · ${mixLabel()}` });
    if (pop) { box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop'); }
  }
  function update(pop) {
    ['A', 'R', 'C'].forEach(k => { $('#s' + k).value = S[k]; $('#v' + k).textContent = S[k] + '%'; });
    const bars = $$('#shareBar i'); ['A', 'R', 'C'].forEach((k, i) => (bars[i].style.flex = S[k] || 0.0001));
    const p = profile(); tween(p); $('#taste').textContent = tasteText(p);
    $('#bPrice').textContent = money(unit() * S.qty);
    drawPouch(pop);
  }
  drawRadar(shown); update();

  /* ---- add to cart ---- */
  $('#bAdd').addEventListener('click', e => {
    const n = nameVal(); const f = $('#bname').closest('.field');
    if (n.length < 2) { f.classList.add('bad'); $('#bname').focus(); return; }
    Cart.add({
      pid: 'custom', name: `${n} (Custom Blend)`, size: S.size, grind: $('#grind').value, mix: `${S.roast[0].toUpperCase() + S.roast.slice(1)} roast · ${mixLabel()}`,
      unit: unit(), qty: S.qty, custom: { scheme: ROAST_SCHEME[S.roast], label: n }
    });
    fly(e.currentTarget);
    toast('Your custom blend was added', { action: { label: 'View cart', fn: openDrawer } });
  });
})();
