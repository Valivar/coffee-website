import { useState } from 'react';
import { Link } from 'react-router-dom';
import { byId, products } from '../data/products.js';
import { isPin, money } from '../lib/utils.js';
import { COUPONS, FREE_SHIP_AT, useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useRemover, useTitle } from '../lib/hooks.js';
import { itemLink, itemMeta } from '../components/CartDrawer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Stepper from '../components/Stepper.jsx';
import { CartThumb, Icon, Qty } from '../components/Visual.jsx';

export default function Cart() {
  useTitle('Your Cart | ChitChat Coffee');
  const { items, count, coupon, note, totals, setQty, setNote, clear, add, applyCoupon, removeCoupon } = useCart();
  const { toast } = useUI();
  const [leaving, removeItem] = useRemover();
  const [code, setCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const t = totals();
  const cdef = coupon ? COUPONS[coupon] : null;
  const inCart = new Set(items.map(i => i.pid));
  const reco = products.filter(p => !inCart.has(p.id)).sort((a, b) => b.rating - a.rating).slice(0, 4);

  const onCoupon = e => { e.preventDefault(); const r = applyCoupon(code); setCouponMsg(r); if (r.ok) setCode(''); };
  const onPin = e => { e.preventDefault(); setPinMsg(isPin(pin.trim()) ? `✓ We deliver to ${pin.trim()}: standard in 3–5 days, express in 1–2 days.` : 'Please enter a valid 6-digit pincode.'); };
  const onClear = () => { const snap = [...items]; clear(); toast('Cart cleared', { action: { label: 'Undo', fn: () => snap.forEach(i => add(i)) } }); };

  return (
    <main className="page">
      <Stepper step={1} />
      <div className="page-title"><h1>Your cart</h1></div>

      {!items.length ? (
        <div className="empty container" style={{ padding: '50px 5vw 70px' }}>
          <div className="empty-ico"><Icon name="cup" size={90} /></div><h4>Your cart is empty</h4><p>Looks like you haven't picked your coffee yet.</p>
          <Link className="btn magnetic" to="/shop"><span>Browse the shop</span></Link>
        </div>
      ) : (
        <div className="container cart-layout">
          <div>
            <div className="c-list">
              {items.map(i => (
                <div className={`c-item${leaving === i.key ? ' removing' : ''}`} key={i.key}>
                  <Link className="c-thumb" to={itemLink(i)}><CartThumb item={i} byId={byId} /></Link>
                  <div>
                    <h3><Link to={itemLink(i)}>{i.name}</Link></h3>
                    <p className="muted">{itemMeta(i)}<br />{money(i.unit)} each</p>
                    <Qty value={i.qty} onChange={q => setQty(i.key, q)} />
                  </div>
                  <div className="c-right"><b>{money(i.unit * i.qty)}</b><button className="c-remove" onClick={() => removeItem(i)}>Remove</button></div>
                </div>
              ))}
            </div>
            <div className="panel note-box" style={{ marginTop: 20 }}>
              <label htmlFor="note">Add an order note (optional)</label>
              <textarea id="note" rows={2} maxLength={300} placeholder="Gift message, delivery instructions…" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <p style={{ marginTop: 16 }}><Link className="link-arrow" to="/shop">← Continue shopping</Link> &nbsp;·&nbsp; <button className="c-remove" onClick={onClear}>Clear cart</button></p>
          </div>

          <aside className="summary">
            <h2>Order summary</h2>
            <div className="ship-bar" style={{ background: 'rgba(255,255,255,.1)', borderRadius: 12, marginBottom: 14 }}>
              <p>{t.toFree > 0 ? <>Add <b>{money(t.toFree)}</b> more for <b>free shipping</b></> : '🎉 Free shipping unlocked'}</p>
              <div className="bar"><i style={{ width: `${Math.min(100, t.subtotal / FREE_SHIP_AT * 100)}%` }} /></div>
            </div>
            <div className="s-row"><span>Subtotal ({count} items)</span><b>{money(t.subtotal)}</b></div>
            {t.discount > 0 && <div className="s-row s-disc"><span>Discount ({t.coupon})</span><b>− {money(t.discount)}</b></div>}
            <div className="s-row"><span>Shipping</span><b>{t.shipping ? money(t.shipping) : 'FREE'}</b></div>
            {cdef ? (
              <div className="applied"><span>🏷️ {coupon}: {cdef.label}{t.couponOk ? '' : ' (conditions not met)'}</span><button onClick={() => { setCouponMsg(null); removeCoupon(); }}>Remove</button></div>
            ) : (
              <form className="coupon" onSubmit={onCoupon}>
                <input type="text" id="code" placeholder="Coupon code" aria-label="Coupon code" autoComplete="off" value={code} onChange={e => setCode(e.target.value)} />
                <button className="btn" type="submit" style={{ width: 'auto', margin: 0 }}><span>Apply</span></button>
              </form>
            )}
            <p className={`coupon-msg${couponMsg ? (couponMsg.ok ? ' ok' : ' bad') : ''}`} id="couponMsg">{couponMsg ? couponMsg.msg : ''}</p>
            <p className="s-note">Try <b>CHAT10</b> (10% off), <b>WELCOME50</b> (₹50 off ₹399+) or <b>FREESHIP</b>.</p>
            <div className="s-row total"><span>Total</span><span>{money(t.total)}</span></div>
            <p className="s-note">Inclusive of all taxes. Express delivery &amp; COD options at checkout.</p>
            <form className="pin" onSubmit={onPin}>
              <input type="text" inputMode="numeric" maxLength={6} placeholder="Delivery pincode" aria-label="Pincode" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
              <button className="btn" type="submit" style={{ width: 'auto', margin: 0, padding: '10px 16px' }}><span>Check</span></button>
            </form>
            <p className="s-note">{pinMsg}</p>
            <Link className="btn magnetic" to="/checkout"><span>Proceed to checkout →</span></Link>
            <div className="trust"><span>🔒 Secure checkout</span><span>↩️ 7-day returns</span><span>🚚 Fast dispatch</span></div>
          </aside>
        </div>
      )}

      <section className="container related"><h2>Complete your coffee ritual</h2><div className="pgrid">{reco.map((p, i) => <ProductCard key={p.id} p={p} i={i} reveal />)}</div></section>
    </main>
  );
}
