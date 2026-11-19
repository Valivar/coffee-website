import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LIFESTYLE, ROAST, byId, catLabel, products } from '../data/products.js';
import { img, store } from '../lib/utils.js';
import { useUI } from '../context/UIContext.jsx';
import { useTitle } from '../lib/hooks.js';
import BuyBox from '../components/BuyBox.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Icon, Stars, Visual } from '../components/Visual.jsx';

const SEED = [
  { n: 'Ananya R.', r: 5, t: 'Opened the pack and the whole kitchen smelled amazing. Smooth, no bitterness at all.', d: '2 weeks ago' },
  { n: 'Karthik S.', r: 4, t: 'Great flavour and very fresh. Delivery was quick and the packaging is lovely.', d: '1 month ago' },
  { n: 'Meera P.', r: 5, t: 'Reordered three times already. This is now our default morning coffee.', d: '2 months ago' }
];
const BREW = {
  filter: [['Ratio', '2 tbsp per 100 ml hot water'], ['Water', '90–95°C, freshly boiled'], ['Time', 'Let the decoction drip 10–12 min'], ['Serve', 'Mix 1:3 with hot milk, sweeten to taste']],
  other: [['Ratio', '1:16: 15 g coffee to 240 ml water'], ['Water', '92–96°C, filtered'], ['Time', '2:30–3:30 min brew time'], ['Grind', 'Match the grind to your brewer']]
};

function Gallery({ p }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null);
  const items = [{ kind: 'pack' }, { kind: 'img', src: img(LIFESTYLE[p.cat]) }, { kind: 'img', src: img('beans-bg.jpg') }];
  const g = items[i];
  const bcls = /SALE/.test(p.badge) ? 'sale' : /BEST/.test(p.badge) ? 'best' : 'new';
  return (
    <div className="gal">
      <div className="gal-main"
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setZoom(`${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`); }}
        onMouseLeave={() => setZoom(null)}>
        {p.badge && <span className={`pc-badge ${bcls}`}>{p.badge}</span>}
        {g.kind === 'pack' ? <Visual p={p} /> : <img src={g.src} alt={`${p.short} lifestyle photo`} style={zoom ? { transformOrigin: zoom, transform: 'scale(1.6)' } : undefined} />}
      </div>
      <div className="thumbs">
        {items.map((it, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={`View image ${k + 1}`} onClick={() => setI(k)}>{it.kind === 'pack' ? <Visual p={p} /> : <img src={it.src} alt="" />}</button>)}
      </div>
    </div>
  );
}

function Reviews({ p, onCount }) {
  const KEY = 'chitchat.reviews.' + p.id;
  const { toast } = useUI();
  const [mine, setMine] = useState(() => store.get(KEY, []));
  const [name, setName] = useState(''), [text, setText] = useState(''), [rate, setRate] = useState(0);
  const [bad, setBad] = useState({});
  const all = [...mine, ...SEED];
  const avg = all.reduce((a, r) => a + r.r, 0) / all.length;
  const dist = [5, 4, 3, 2, 1].map(s => all.filter(r => r.r === s).length);
  useEffect(() => { onCount(all.length); }, [all.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = e => {
    e.preventDefault();
    const b = { n: name.trim().length < 2, t: text.trim().length < 10, r: !rate };
    setBad(b); if (b.n || b.t || b.r) return;
    const next = [{ n: name.trim(), r: rate, t: text.trim(), d: 'Just now' }, ...mine];
    store.set(KEY, next); setMine(next); setName(''); setText(''); setRate(0);
    toast('Thanks! Your review was posted.');
  };
  return (
    <div className="reviews" id="reviews">
      <div className="rev-sum"><big>{avg.toFixed(1)}</big><Stars rating={avg} /><p className="muted small">{all.length} reviews</p>
        <div className="rev-bars">{[5, 4, 3, 2, 1].map((s, i) => <div key={s}><span>{s}★</span><i><b style={{ width: `${all.length ? dist[i] / all.length * 100 : 0}%` }} /></i><span>{dist[i]}</span></div>)}</div></div>
      <div>
        {all.map((r, i) => <div className="rev" key={i}><header><b>{r.n}</b><span className="muted small">{r.d}</span></header><Stars rating={r.r} /><p>{r.t}</p></div>)}
        <form className="rev-form" onSubmit={submit} noValidate><h3>Write a review</h3>
          <div className={`field${bad.n ? ' bad' : ''}`}><label htmlFor="rn">Your name</label><input id="rn" type="text" maxLength={40} placeholder="e.g. Priya" value={name} onChange={e => setName(e.target.value)} /><p className="err">Please enter your name.</p></div>
          <div className={`field${bad.r ? ' bad' : ''}`}><label>Rating</label>
            <div className="star-input" role="radiogroup" aria-label="Rating">
              {[5, 4, 3, 2, 1].map(n => <Fragment key={n}><input type="radio" name="rate" id={`s${n}`} value={n} checked={rate === n} onChange={() => setRate(n)} /><label htmlFor={`s${n}`} title={`${n} stars`}>★</label></Fragment>)}
            </div><p className="err">Please choose a rating.</p></div>
          <div className={`field${bad.t ? ' bad' : ''}`}><label htmlFor="rt">Your review</label><textarea id="rt" rows={3} maxLength={400} placeholder="What did you think of the coffee?" value={text} onChange={e => setText(e.target.value)} /><p className="err">Please write at least 10 characters.</p></div>
          <button className="btn btn-dark" type="submit"><span>Submit review</span></button></form>
      </div>
    </div>
  );
}

function ProductView({ p }) {
  useTitle(`${p.short} | ChitChat Coffee`, p.blurb || p.name);
  const [tab, setTab] = useState('desc');
  const [revCount, setRevCount] = useState(SEED.length);
  const [roastDot, setRoastDot] = useState(0);
  const roastPos = p.roast ? (p.roast - 1) / 4 * 100 : null;
  const brew = p.cat === 'filter' ? BREW.filter : BREW.other;
  const related = useMemo(() => products.filter(x => x.id !== p.id).sort((a, b) => (b.cat === p.cat) - (a.cat === p.cat) || b.rating - a.rating).slice(0, 4), [p]);

  useEffect(() => { const t = setTimeout(() => setRoastDot(roastPos || 0), 400); return () => clearTimeout(t); }, [roastPos]);
  // structured data for search engines
  useEffect(() => {
    const s = document.createElement('script'); s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.blurb, brand: 'ChitChat Coffee', offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: 'https://schema.org/InStock' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews } });
    document.head.appendChild(s); return () => s.remove();
  }, [p]);

  const tabs = [['desc', 'Description'], ['brew', 'Brewing guide'], ['ship', 'Shipping & returns'], ['reviews', `Reviews (${revCount})`]];
  return (
    <main className="page">
      <div className="container crumbs"><Link to="/">Home</Link><span>›</span><Link to="/shop">Shop</Link><span>›</span><Link to={`/shop?cat=${p.cat}`}>{catLabel(p.cat)}</Link><span>›</span>{p.short}</div>
      <section className="container pdp">
        <Gallery p={p} />
        <div className="pdp-info">
          <p className="eyebrow">{catLabel(p.cat)}</p>
          <h1>{p.name}</h1>
          <p className="rating"><Stars rating={p.rating} /> <b>{p.rating}</b> <a href="#reviews" onClick={e => { e.preventDefault(); setTab('reviews'); document.querySelector('.tabs').scrollIntoView({ behavior: 'smooth' }); }}>{p.reviews + revCount - SEED.length} reviews</a></p>
          <p className="blurb">{p.blurb}</p>
          {p.notes.length > 0 && <p className="chips">{p.notes.map(n => <span key={n}>{n}</span>)}</p>}
          <BuyBox p={p} buyNow />
          <div className="meta-grid">
            <div><small>Origin</small><b>{p.origin || 'n/a'}</b></div>
            <div><small>Type</small><b>{p.type}</b></div>
            <div><small>Roast</small><b>{p.roast ? ROAST[p.roast] : 'n/a'}</b></div>
          </div>
          {roastPos !== null && <div className="roast-meter"><p><span>Light</span><span>Roast level</span><span>Dark</span></p><div><i style={{ left: `${roastDot}%` }} /></div></div>}
          <div className="perks"><div>🚚 Free shipping over ₹599</div><div>🔥 Roasted to order</div><div>↩️ 7-day easy returns</div><div>🔒 Secure checkout</div></div>
        </div>
      </section>

      <section className="tabs">
        <div className="tab-list" role="tablist">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
        <div className={`tab-panel${tab === 'desc' ? ' on' : ''}`}>
          <p>{p.blurb}</p>
          <p>Grown, processed and roasted by us in small batches, {p.name} is packed fresh on the day it is roasted and sealed with a one-way valve to keep it tasting its best.</p>
          <ul>{p.notes.map(n => <li key={n}>Tasting note: {n}</li>)}</ul>
        </div>
        <div className={`tab-panel${tab === 'brew' ? ' on' : ''}`}><div className="brew-grid">{brew.map(([h, t]) => <div key={h}><h5>{h}</h5><p>{t}</p></div>)}</div></div>
        <div className={`tab-panel${tab === 'ship' ? ' on' : ''}`}>
          <ul><li>Orders ship within 24 hours. Standard delivery takes 3–5 business days, express 1–2 days.</li><li>Free standard shipping on orders over ₹599.</li><li>Unopened items can be returned within 7 days of delivery. Damaged items are replaced free of charge.</li></ul>
          <p><Link className="link-arrow" to="/policies#shipping">Read the full policy →</Link></p>
        </div>
        <div className={`tab-panel${tab === 'reviews' ? ' on' : ''}`}><Reviews p={p} onCount={setRevCount} /></div>
      </section>

      <section className="container related"><h2>You may also like</h2><div className="pgrid">{related.map((x, i) => <ProductCard key={x.id} p={x} i={i} reveal />)}</div></section>
    </main>
  );
}

export default function Product() {
  const { id } = useParams();
  const p = byId(id);
  useTitle(p ? `${p.short} | ChitChat Coffee` : 'Product not found | ChitChat Coffee');
  if (!p) {
    return (
      <main className="page"><div className="empty container" style={{ paddingTop: 120 }}><div className="empty-ico"><Icon name="cup" size={80} /></div><h4>We couldn't find that coffee</h4><p>It may have been renamed or is no longer available.</p><Link className="btn" to="/shop"><span>Back to shop</span></Link></div></main>
    );
  }
  return <ProductView key={p.id} p={p} />;
}
