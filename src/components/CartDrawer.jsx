import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { byId } from '../data/products.js';
import { money } from '../lib/utils.js';
import { useCart, FREE_SHIP_AT } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useRemover } from '../lib/hooks.js';
import { CartThumb, Icon, Qty } from './Visual.jsx';

export const itemMeta = i => [i.size, i.grind, i.mix].filter(Boolean).join(' · ');
export const itemLink = i => (i.pid === 'custom' ? '/blend' : `/product/${i.pid}`);

export default function CartDrawer() {
  const { items, count, totals, setQty } = useCart();
  const { drawerOpen, closeDrawer } = useUI();
  const [leaving, removeItem] = useRemover();
  const closeBtn = useRef(null);
  const t = totals();
  const pct = Math.min(100, t.subtotal / FREE_SHIP_AT * 100);

  useEffect(() => { if (drawerOpen) { const id = setTimeout(() => closeBtn.current && closeBtn.current.focus(), 50); return () => clearTimeout(id); } }, [drawerOpen]);

  return (
    <aside className={`drawer${drawerOpen ? ' open' : ''}`} id="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden={!drawerOpen}>
      <div className="drawer-head"><h3>Your cart <span>{items.length ? `(${count})` : ''}</span></h3><button ref={closeBtn} className="icon-btn" aria-label="Close cart" onClick={closeDrawer}>✕</button></div>
      {items.length > 0 && (
        <div className="ship-bar">
          <p>{t.toFree > 0 ? <>Add <b>{money(t.toFree)}</b> more for <b>free shipping</b></> : <>🎉 You've unlocked <b>free shipping</b></>}</p>
          <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
      )}
      <div className="drawer-items">
        {items.length ? items.map(i => (
          <div className={`d-item${leaving === i.key ? ' removing' : ''}`} key={i.key}>
            <Link className="d-thumb" to={itemLink(i)} onClick={closeDrawer}><CartThumb item={i} byId={byId} /></Link>
            <div className="d-info"><h4>{i.name}</h4><p className="muted">{itemMeta(i)}</p>
              <div className="d-row"><Qty value={i.qty} onChange={q => setQty(i.key, q)} /><b>{money(i.unit * i.qty)}</b></div></div>
            <button className="d-remove" aria-label={`Remove ${i.name}`} onClick={() => removeItem(i)}>✕</button>
          </div>
        )) : (
          <div className="empty"><div className="empty-ico"><Icon name="cup" size={64} /></div><h4>Your cart is empty</h4><p>Fresh roasted coffee is just a click away.</p>
            <Link className="btn" to="/shop" onClick={closeDrawer}><span>Start shopping</span></Link></div>
        )}
      </div>
      {items.length > 0 && (
        <div className="drawer-foot">
          <div className="sum-row"><span>Subtotal</span><b>{money(t.subtotal)}</b></div>
          <p className="muted small">Shipping, taxes and coupons are applied at checkout.</p>
          <div className="d-btns"><Link className="btn btn-ghost" to="/cart" onClick={closeDrawer}><span>View cart</span></Link><Link className="btn" to="/checkout" onClick={closeDrawer}><span>Checkout</span></Link></div>
        </div>
      )}
    </aside>
  );
}
