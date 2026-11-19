import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRINDS, priceFor } from '../data/products.js';
import { money } from '../lib/utils.js';
import { useCart } from '../context/CartContext.jsx';
import { useAddToCart } from '../lib/hooks.js';
import { Qty } from './Visual.jsx';

/** Size / grind / quantity controls + add to cart (used on the product page and in the quick-view modal) */
export default function BuyBox({ p, buyNow = false, onAdd }) {
  const [size, setSize] = useState(p.sizes[0]);
  const [grind, setGrind] = useState(p.grind ? 'Whole Bean' : '');
  const [qty, setQty] = useState(1);
  const addToCart = useAddToCart();
  const { add } = useCart();
  const navigate = useNavigate();
  const unit = priceFor(p, size);
  const mrp = p.mrp && p.sizes.length === 1 ? p.mrp * qty : 0;

  return (
    <div>
      <div className="bb-price"><b>{money(unit * qty)}</b>{mrp ? <s>{money(mrp)}</s> : null}{mrp ? <small>Save {money(mrp - unit * qty)}</small> : null}</div>
      {p.sizes.length > 1 ? (
        <div className="bb-field"><label>Pack size</label>
          <div className="pills" id="bbSizes">{p.sizes.map(s => <button key={s} type="button" className={'pill' + (s === size ? ' on' : '')} onClick={() => setSize(s)}>{s}</button>)}</div>
        </div>
      ) : p.sizes[0] !== 'Standard' ? <p className="muted">Pack: <b>{p.sizes[0]}</b></p> : null}
      {p.grind && (
        <div className="bb-field"><label htmlFor="bbGrind">Grind type</label>
          <select id="bbGrind" value={grind} onChange={e => setGrind(e.target.value)}>{GRINDS.map(g => <option key={g}>{g}</option>)}</select>
        </div>
      )}
      <div className="bb-actions">
        <Qty big value={qty} onChange={v => setQty(Math.max(1, v))} />
        <button type="button" className="btn grow" onClick={e => { addToCart(p, { size, grind, qty }, e.currentTarget); onAdd && onAdd(); }}><span>Add to cart</span></button>
        {buyNow && <button type="button" className="btn btn-dark" onClick={() => { add({ pid: p.id, name: p.short, size, grind, unit, qty }); navigate('/checkout'); }}><span>Buy now</span></button>}
      </div>
    </div>
  );
}
