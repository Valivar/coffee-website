import { useEffect, useRef, useState } from 'react';
import { GRINDS, SCHEMES, SIZE_MULT } from '../data/products.js';
import { flyToCart, money, reduceMotion } from '../lib/utils.js';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useTitle } from '../lib/hooks.js';
import { Pouch, Qty } from '../components/Visual.jsx';

const PRICE = { A: 450, R: 330, C: 150 }; // per 250g
const ATTR = ['Strength', 'Aroma', 'Body', 'Acidity', 'Sweetness'];
const BASE = { A: [5, 9, 6, 8, 8], R: [9, 5, 9, 3, 3], C: [6, 3, 8, 1, 4] };
const ROAST_ADJ = { light: [-1, 1, -1, 2, 1], medium: [0, 0, 0, 0, 0], dark: [2, -1, 1, -2, -1] };
const ROAST_SCHEME = { light: 'gold', medium: 'kraft', dark: 'dark' };
const KEYS = ['A', 'R', 'C'];
const NAMES = { A: 'Arabica', R: 'Robusta', C: 'Chicory' };
const COLORS = { A: '#c68b4e', R: '#3b2314', C: '#9a8a6a' };

const profileOf = (mix, roast) => ATTR.map((_, i) => Math.max(0, Math.min(10, KEYS.reduce((a, k) => a + BASE[k][i] * mix[k], 0) / 100 + ROAST_ADJ[roast][i])));
function tasteText([st, ar, bo, ac, sw]) {
  const a = ac > 6 ? 'Bright & fruity' : st > 7 ? 'Bold & punchy' : bo > 7 ? 'Rich & full-bodied' : 'Smooth & balanced';
  const b = sw > 6 ? 'naturally sweet' : ar > 6 ? 'very aromatic' : 'with a bittersweet finish';
  return `${a}, ${b}`;
}

const CX = 100, CY = 100, R = 70;
const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [CX + r * Math.cos(a), CY + r * Math.sin(a)]; };

function Radar({ values }) {
  const poly = f => ATTR.map((_, i) => pt(i, R * f).join(',')).join(' ');
  return (
    <svg className="radar" viewBox="-24 0 248 200" aria-label="Taste profile">
      {[.33, .66, 1].map(f => <polygon key={f} className="grid" points={poly(f)} />)}
      {ATTR.map((_, i) => <line key={i} className="grid" x1={CX} y1={CY} x2={pt(i, R)[0]} y2={pt(i, R)[1]} />)}
      <polygon className="shape" points={values.map((v, i) => pt(i, R * v / 10).join(',')).join(' ')} />
      {ATTR.map((a, i) => { const [x, y] = pt(i, R + 16); return <text key={a} x={x} y={y + 3}>{a}</text>; })}
    </svg>
  );
}

export default function Blend() {
  useTitle('Blend Your Own Coffee | ChitChat Coffee', 'Design your own coffee blend: choose Arabica, Robusta and chicory, pick a roast and grind, and name your pack.');
  const { add } = useCart();
  const { toast, openDrawer } = useUI();
  const [mix, setMix] = useState({ A: 60, R: 30, C: 10 });
  const [roast, setRoast] = useState('medium');
  const [size, setSize] = useState('250g');
  const [grind, setGrind] = useState(GRINDS[0]);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('My Signature Blend');
  const [badName, setBadName] = useState(false);
  const [pop, setPop] = useState(0);

  // the other two shares rebalance so the total is always 100
  const setShare = (k, v) => setMix(m => {
    v = Math.max(0, Math.min(100, Math.round(v)));
    const [o1, o2] = KEYS.filter(x => x !== k), rest = 100 - v, sum = m[o1] + m[o2];
    const a = sum ? Math.round(m[o1] / sum * rest) : Math.round(rest / 2);
    return { ...m, [k]: v, [o1]: a, [o2]: rest - a };
  });

  const target = profileOf(mix, roast);
  const [shown, setShown] = useState(target);
  const shownRef = useRef(shown); shownRef.current = shown;
  useEffect(() => {
    if (reduceMotion()) { setShown(target); return; }
    const from = [...shownRef.current], s = performance.now(); let raf;
    const step = now => {
      const p = Math.min(1, (now - s) / 450), e = 1 - Math.pow(1 - p, 3);
      setShown(from.map((f, i) => f + (target[i] - f) * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [mix, roast]); // eslint-disable-line react-hooks/exhaustive-deps

  const unit = Math.round(KEYS.reduce((a, k) => a + PRICE[k] * mix[k], 0) / 100 * SIZE_MULT[size]);
  const scheme = ROAST_SCHEME[roast];
  const mixLabel = `A${mix.A}/R${mix.R}/C${mix.C}`;

  const addToCart = e => {
    const n = name.trim();
    if (n.length < 2) { setBadName(true); document.getElementById('bname')?.focus(); return; }
    add({ pid: 'custom', name: `${n} (Custom Blend)`, size, grind, mix: `${roast[0].toUpperCase() + roast.slice(1)} roast · ${mixLabel}`, unit, qty, custom: { scheme, label: n } });
    flyToCart(e.currentTarget);
    toast('Your custom blend was added', { action: { label: 'View cart', fn: openDrawer } });
  };

  return (
    <main className="page">
      <div className="container shop-hero" style={{ gridTemplateColumns: '1fr' }}>
        <div><h1>Blend your own coffee</h1><p>Mix, roast and name your signature blend. We'll roast it fresh and pack it with your label.</p></div>
      </div>
      <div className="container blend-layout">
        <div>
          <div className="panel"><h2><i>1</i> Choose your mix</h2>
            <div className="share-bar">{KEYS.map(k => <i key={k} style={{ background: COLORS[k], flex: mix[k] || 0.0001 }} />)}</div>
            {KEYS.map(k => (
              <div className="sl" key={k}><label htmlFor={`s${k}`}>{NAMES[k]} <b>{mix[k]}%</b></label>
                <input type="range" id={`s${k}`} min="0" max="100" value={mix[k]} onChange={e => setShare(k, +e.target.value)} /></div>
            ))}
            <p className="muted small">The three shares always add up to 100%. Move one slider and the others rebalance.</p>
          </div>
          <div className="panel"><h2><i>2</i> Roast level</h2>
            <div className="pills">{['light', 'medium', 'dark'].map(r => <button key={r} type="button" className={`pill${roast === r ? ' on' : ''}`} onClick={() => { setRoast(r); setPop(p => p + 1); }}>{r[0].toUpperCase() + r.slice(1)}</button>)}</div></div>
          <div className="panel"><h2><i>3</i> Grind &amp; size</h2><div className="fgrid">
            <div className="field"><label htmlFor="grind">Grind type</label><select id="grind" value={grind} onChange={e => setGrind(e.target.value)}>{GRINDS.map(g => <option key={g}>{g}</option>)}</select></div>
            <div className="field"><label>Pack size</label><div className="pills">{Object.keys(SIZE_MULT).map(s => <button key={s} type="button" className={`pill${size === s ? ' on' : ''}`} onClick={() => setSize(s)}>{s}</button>)}</div></div>
          </div></div>
          <div className="panel"><h2><i>4</i> Name your blend</h2>
            <div className={`field${badName ? ' bad' : ''}`}><label htmlFor="bname">Blend name (shown on your pack)</label>
              <input id="bname" type="text" maxLength={28} value={name} onChange={e => { setName(e.target.value); setBadName(false); }} /><p className="err">Give your blend a name (2+ characters).</p></div></div>
        </div>

        <aside className="b-preview">
          <div key={pop} className={`b-pouch${pop ? ' pop' : ''}`} style={{ '--tint': SCHEMES[scheme].tint }}>
            <Pouch name={name.trim() || 'Your Blend'} scheme={scheme} sub={`${size} · ${mixLabel}`} />
          </div>
          <p className="taste" style={{ marginTop: 12 }}>{tasteText(target)}</p>
          <Radar values={shown} />
          <div className="b-price"><span>Total</span><b>{money(unit * qty)}</b></div>
          <div className="bb-actions" style={{ marginTop: 6 }}>
            <div style={{ background: '#fff', borderRadius: 30, display: 'inline-flex' }}><Qty big value={qty} onChange={v => setQty(Math.max(1, v))} /></div>
            <button className="btn grow" onClick={addToCart}><span>Add to cart</span></button>
          </div>
        </aside>
      </div>
    </main>
  );
}
