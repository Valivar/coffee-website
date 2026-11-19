import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { store, money } from '../lib/utils.js';
import { SHIP } from '../lib/orders.js';

const KEY = 'chitchat.cart.v1';
export const MAX_QTY = 20;
export const FREE_SHIP_AT = 599;
export const COD_FEE = 30;
export const COUPONS = {
  CHAT10: { type: 'pct', value: 10, label: '10% off your order' },
  WELCOME50: { type: 'flat', value: 50, min: 399, label: '₹50 off orders above ₹399' },
  FREESHIP: { type: 'ship', label: 'Free shipping' }
};

const empty = () => ({ items: [], coupon: null, note: '' });
function load() {
  const s = store.get(KEY, null);
  if (!s || !Array.isArray(s.items)) return empty();
  return { ...empty(), ...s, items: s.items.filter(i => i && i.key && i.qty > 0 && i.unit >= 0) };
}
const subtotalOf = items => items.reduce((a, i) => a + i.unit * i.qty, 0);

export function computeTotals(state, { ship = 'standard', cod = false } = {}) {
  const subtotal = subtotalOf(state.items);
  const def = state.coupon ? COUPONS[state.coupon] : null;
  let discount = 0, couponOk = !!def;
  if (def) {
    if (def.min && subtotal < def.min) couponOk = false;
    else if (def.type === 'pct') discount = Math.round(subtotal * def.value / 100);
    else if (def.type === 'flat') discount = Math.min(def.value, subtotal);
  }
  let shipping = subtotal ? SHIP[ship].fee(subtotal) : 0;
  if (def && def.type === 'ship' && couponOk) shipping = 0;
  const codFee = cod && subtotal ? COD_FEE : 0;
  const total = Math.max(0, subtotal - discount) + shipping + codFee;
  return { subtotal, discount, shipping, codFee, total, couponOk, coupon: state.coupon, toFree: Math.max(0, FREE_SHIP_AT - subtotal) };
}

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [state, setState] = useState(load);
  const ref = useRef(state); ref.current = state;

  useEffect(() => { store.set(KEY, state); }, [state]);
  useEffect(() => {
    const h = e => { if (e.key === KEY) setState(load()); };
    addEventListener('storage', h); return () => removeEventListener('storage', h);
  }, []);

  const api = useMemo(() => ({
    items: state.items,
    coupon: state.coupon,
    note: state.note || '',
    count: state.items.reduce((a, i) => a + i.qty, 0),
    subtotal: subtotalOf(state.items),
    totals: opts => computeTotals(state, opts),
    add(item) {
      const key = [item.pid, item.size, item.grind || '', item.mix || '', item.pid === 'custom' ? item.name : ''].join('|');
      setState(s => {
        const ex = s.items.find(i => i.key === key);
        const items = ex
          ? s.items.map(i => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + item.qty) } : i))
          : [...s.items, { ...item, key, qty: Math.min(MAX_QTY, item.qty) }];
        return { ...s, items };
      });
    },
    setQty(key, q) {
      setState(s => ({ ...s, items: q <= 0 ? s.items.filter(i => i.key !== key) : s.items.map(i => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, q) } : i)) }));
    },
    remove: key => setState(s => ({ ...s, items: s.items.filter(i => i.key !== key) })),
    clear: () => setState(empty()),
    setNote: n => setState(s => ({ ...s, note: String(n).slice(0, 300) })),
    applyCoupon(code) {
      const c = String(code || '').trim().toUpperCase(), def = COUPONS[c], sub = subtotalOf(ref.current.items);
      if (!c) return { ok: false, msg: 'Enter a coupon code.' };
      if (!def) return { ok: false, msg: 'That code is not valid.' };
      if (def.min && sub < def.min) return { ok: false, msg: `Add ${money(def.min - sub)} more to use ${c}.` };
      setState(s => ({ ...s, coupon: c }));
      return { ok: true, msg: `${c} applied: ${def.label}.` };
    },
    removeCoupon: () => setState(s => ({ ...s, coupon: null }))
  }), [state]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}
