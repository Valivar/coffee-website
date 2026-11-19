import { Link } from 'react-router-dom';
import { catLabel, ROAST } from '../data/products.js';
import { money } from '../lib/utils.js';
import { useUI } from '../context/UIContext.jsx';
import { useAddToCart, useInView } from '../lib/hooks.js';
import { Stars, Visual } from './Visual.jsx';

export const needsOptions = p => p.sizes.length > 1 || p.grind;

export default function ProductCard({ p, i = 0, reveal = false }) {
  const { openQuick } = useUI();
  const addToCart = useAddToCart();
  const [ref, seen] = useInView();
  const sale = p.mrp > p.price, opts = needsOptions(p), from = p.sizes.length > 1;
  const bcls = /SALE/.test(p.badge) ? 'sale' : /BEST/.test(p.badge) ? 'best' : 'new';
  const to = `/product/${p.id}`;
  return (
    <article ref={ref} className={`pcard${reveal ? ' reveal' + (seen ? ' in' : '') : ''}`} style={{ '--i': i }} data-id={p.id}>
      {p.badge && <span className={`pc-badge ${bcls}`}>{p.badge}</span>}
      <Link className="pc-media" to={to} aria-label={p.name}><Visual p={p} /></Link>
      <div className="pc-body">
        <p className="pc-cat">{catLabel(p.cat)}</p>
        <h3><Link to={to}>{p.name}</Link></h3>
        <p className="pc-rate"><Stars rating={p.rating} /> <span>({p.reviews})</span></p>
        <p className="pc-tags">
          {p.origin && <span>{p.origin}</span>}
          {p.roast ? <span>{ROAST[p.roast]} Roast</span> : null}
          {p.type === 'Gear' && <span>Brew gear</span>}
        </p>
        <div className="pc-foot">
          <p className="pc-price">{from && <><small>from</small> </>}{money(p.price)}{sale && <> <s>{money(p.mrp)}</s></>}</p>
          <button className="pc-btn" onClick={e => (opts ? openQuick(p.id) : addToCart(p, {}, e.currentTarget))}>{opts ? 'View Options' : 'Add to Cart'}</button>
        </div>
      </div>
    </article>
  );
}
