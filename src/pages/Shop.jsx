import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATS, ROAST, byId, catLabel, products as ALL } from '../data/products.js';
import { money } from '../lib/utils.js';
import { useTitle } from '../lib/hooks.js';
import ProductCard from '../components/ProductCard.jsx';
import { Icon, Pouch } from '../components/Visual.jsx';

const PAGE = 12;
const MAX_P = Math.ceil(Math.max(...ALL.map(p => p.price)) / 50) * 50;
const MIN_P = Math.floor(Math.min(...ALL.map(p => p.price)) / 50) * 50;
const SORTS = {
  featured: (a, b) => a.order - b.order,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  name: (a, b) => a.short.localeCompare(b.short)
};
const facet = key => { const m = new Map(); ALL.forEach(p => { const v = key(p); if (v) m.set(v, (m.get(v) || 0) + 1); }); return [...m.entries()]; };
const ROAST_OPTS = facet(p => (p.roast ? ROAST[p.roast] : '')).sort((a, b) => Object.values(ROAST).indexOf(a[0]) - Object.values(ROAST).indexOf(b[0]));
const ORIGIN_OPTS = facet(p => p.origin), TYPE_OPTS = facet(p => p.type);
const haystack = p => [p.name, p.short, p.origin, p.type, catLabel(p.cat), p.roast ? ROAST[p.roast] : '', ...p.notes].join(' ').toLowerCase();
const toggled = (set, v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); return n; };

function FilterGroup({ title, closed, onToggle, children }) {
  return (
    <div className={`f-group${closed ? ' closed' : ''}`}>
      <button type="button" aria-expanded={!closed} onClick={onToggle}>{title}<i>⌃</i></button>
      <div className="f-body"><div>{children}</div></div>
    </div>
  );
}
const Checks = ({ opts, selected, onToggle }) => opts.map(([v, n]) => (
  <label className="opt" key={v}><input type="checkbox" checked={selected.has(v)} onChange={() => onToggle(v)} /> {v} <em>{n}</em></label>
));

export default function Shop() {
  useTitle('Shop Coffee | ChitChat Coffee', 'Shop single estate roasted beans, filter coffee, pure coffee, brewing equipment and green coffee beans.');
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '';
  const cat = CATS.some(c => c.id === sp.get('cat')) ? sp.get('cat') : '';
  const sort = SORTS[sp.get('sort')] ? sp.get('sort') : 'featured';
  const setParam = (k, v) => setSp(p => { const n = new URLSearchParams(p); v ? n.set(k, v) : n.delete(k); return n; }, { replace: true });

  const [qInput, setQInput] = useState(q);
  const [max, setMax] = useState(MAX_P);
  const [roast, setRoast] = useState(new Set()), [origin, setOrigin] = useState(new Set()), [type, setType] = useState(new Set());
  const [sale, setSale] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [closed, setClosed] = useState({ origin: true, offers: true });
  const [sheet, setSheet] = useState(false);
  const grid = useRef(null);

  // debounce the search box into the URL
  useEffect(() => { const t = setTimeout(() => { if (qInput.trim() !== q) setParam('q', qInput.trim()); }, 180); return () => clearTimeout(t); }, [qInput]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setQInput(q); }, [q]);
  useEffect(() => { setShown(PAGE); }, [q, cat, sort, max, roast, origin, type, sale]);

  const list = useMemo(() => {
    const toks = q.toLowerCase().split(/\s+/).filter(Boolean);
    return ALL.filter(p => {
      if (cat && p.cat !== cat) return false;
      if (p.price > max) return false;
      if (roast.size && !roast.has(ROAST[p.roast])) return false;
      if (origin.size && !origin.has(p.origin)) return false;
      if (type.size && !type.has(p.type)) return false;
      if (sale && !(p.mrp > p.price)) return false;
      if (toks.length) { const h = haystack(p); if (!toks.every(k => h.includes(k))) return false; }
      return true;
    }).sort(SORTS[sort]);
  }, [q, cat, sort, max, roast, origin, type, sale]);

  const chips = [];
  if (cat) chips.push({ k: 'cat', l: catLabel(cat), x: () => setParam('cat', '') });
  if (q) chips.push({ k: 'q', l: `“${q}”`, x: () => { setQInput(''); setParam('q', ''); } });
  if (max < MAX_P) chips.push({ k: 'max', l: 'Under ' + money(max), x: () => setMax(MAX_P) });
  [['roast', roast, setRoast], ['type', type, setType], ['origin', origin, setOrigin]].forEach(([k, set, setter]) => set.forEach(v => chips.push({ k: k + v, l: v, x: () => setter(toggled(set, v)) })));
  if (sale) chips.push({ k: 'sale', l: 'On sale', x: () => setSale(false) });

  const reset = () => { setMax(MAX_P); setRoast(new Set()); setOrigin(new Set()); setType(new Set()); setSale(false); setQInput(''); setSp({}, { replace: true }); };
  const slice = list.slice(0, shown);
  const toggleGroup = k => setClosed(c => ({ ...c, [k]: !c[k] }));

  return (
    <main className="page">
      <section className="container shop-hero">
        <div><h1>Coffee from farm to cup</h1><p>Speciality coffee from our estate: small-batch roasted, freshly packed.</p></div>
        <div className="hero-pouches" aria-hidden="true">
          {['honey-processed', 'elite-blend', 'directors-blend', 'estate-premium'].map(id => { const p = byId(id); return <div key={id}><Pouch name={p.short} scheme={p.scheme} sub="250g" /></div>; })}
        </div>
      </section>

      <div className="container toolbar">
        <div className="search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" id="q" value={qInput} onChange={e => setQInput(e.target.value)} placeholder="Search specialty coffees, origins, or flavour notes..." aria-label="Search coffees" autoComplete="off" />
          {q && <button aria-label="Clear search" onClick={() => { setQInput(''); setParam('q', ''); }}>✕</button>}
        </div>
        <span className="count" id="count">{list.length} {list.length === 1 ? 'coffee' : 'coffees'}</span>
        <label className="sort">sort by:
          <select id="sort" aria-label="Sort products" value={sort} onChange={e => setParam('sort', e.target.value === 'featured' ? '' : e.target.value)}>
            <option value="featured">featured</option><option value="price-asc">price: low to high</option><option value="price-desc">price: high to low</option>
            <option value="rating">top rated</option><option value="name">name: A to Z</option>
          </select>
        </label>
      </div>

      <div className="cat-row">
        {CATS.map(c => (
          <button key={c.id} className={`cat-btn${cat === c.id ? ' on' : ''}`} aria-pressed={cat === c.id}
            onClick={() => { setParam('cat', cat === c.id ? '' : c.id); if (cat !== c.id) grid.current && grid.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
            <span className="cat-ico"><Icon name={c.icon} size={56} /></span>{c.label}
          </button>
        ))}
      </div>

      <div className="container shop-layout" ref={grid}>
        <aside className={`filters${sheet ? ' open' : ''}`} aria-label="Filters">
          <div className="f-head"><h4>FILTERS</h4><button className="f-apply" onClick={() => setSheet(false)}>APPLY FILTERS</button></div>
          <FilterGroup title="Max price" closed={closed.price} onToggle={() => toggleGroup('price')}>
            <div className="f-range"><span>{money(MIN_P)}</span><b>Under {money(max)}</b><span>{money(MAX_P)}</span></div>
            <input type="range" min={MIN_P} max={MAX_P} step="50" value={max} onChange={e => setMax(+e.target.value)} aria-label="Maximum price" />
          </FilterGroup>
          <FilterGroup title="Roast level" closed={closed.roast} onToggle={() => toggleGroup('roast')}><Checks opts={ROAST_OPTS} selected={roast} onToggle={v => setRoast(toggled(roast, v))} /></FilterGroup>
          <FilterGroup title="Bean type" closed={closed.type} onToggle={() => toggleGroup('type')}><Checks opts={TYPE_OPTS} selected={type} onToggle={v => setType(toggled(type, v))} /></FilterGroup>
          <FilterGroup title="Origin" closed={closed.origin} onToggle={() => toggleGroup('origin')}><Checks opts={ORIGIN_OPTS} selected={origin} onToggle={v => setOrigin(toggled(origin, v))} /></FilterGroup>
          <FilterGroup title="Offers" closed={closed.offers} onToggle={() => toggleGroup('offers')}>
            <label className="opt"><input type="checkbox" checked={sale} onChange={e => setSale(e.target.checked)} /> On sale only</label>
          </FilterGroup>
          <button className="f-clear" onClick={reset}>Clear all filters</button>
        </aside>

        <section>
          <div className="active-filters">{chips.map(c => <span className="af" key={c.k}>{c.l}<button aria-label={`Remove filter ${c.l}`} onClick={c.x}>✕</button></span>)}</div>
          <div className="pgrid" id="pgrid" aria-live="polite">
            {slice.length ? slice.map((p, i) => <ProductCard key={p.id} p={p} i={i % PAGE} />) : (
              <div className="no-results">
                <div style={{ color: 'var(--caramel)' }}><Icon name="cup" size={70} /></div>
                <h3>No coffees match your search</h3>
                <p>Try removing a filter or searching for something like “chocolate” or “Arabica”.</p>
                <button className="btn btn-dark" onClick={reset}><span>Reset filters</span></button>
              </div>
            )}
          </div>
          {slice.length < list.length && <button className="btn btn-dark load-more" id="more" onClick={() => setShown(s => s + PAGE)}><span>Load more ({list.length - slice.length} left)</span></button>}
        </section>
      </div>
      <div className={`overlay${sheet ? ' show' : ''}`} onClick={() => setSheet(false)} />
      <button className="filter-fab" onClick={() => setSheet(true)}>☰ Filters <b>{chips.length ? `(${chips.length})` : ''}</b></button>
    </main>
  );
}
