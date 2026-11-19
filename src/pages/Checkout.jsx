import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { byId } from '../data/products.js';
import { isEmail, isPhone, isPin, luhn, money, normPhone, store } from '../lib/utils.js';
import { COD_FEE, useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { Orders, SHIP } from '../lib/orders.js';
import { useTitle } from '../lib/hooks.js';
import { itemMeta } from '../components/CartDrawer.jsx';
import Stepper from '../components/Stepper.jsx';
import { CartThumb, Icon } from '../components/Visual.jsx';

const PROFILE = 'chitchat.profile.v1';
const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const RULES = {
  name: v => v.length >= 2 && /[a-zA-Z]/.test(v),
  email: isEmail, phone: isPhone, addr: v => v.length >= 6, city: v => v.length >= 2, state: v => !!v, pin: isPin
};
const PAY_RULES = {
  upi: { upi: v => /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(v) },
  card: {
    cnum: v => { const n = v.replace(/\s/g, ''); return n.length >= 13 && n.length <= 19 && luhn(n); },
    cname: v => v.length >= 2,
    cexp: v => { const m = /^(\d{2})\/(\d{2})$/.exec(v); if (!m) return false; const mm = +m[1], yy = 2000 + +m[2]; return mm >= 1 && mm <= 12 && new Date(yy, mm, 0, 23, 59) >= new Date(); },
    ccvv: v => /^\d{3,4}$/.test(v)
  },
  cod: {}
};
const MESSAGES = {
  name: 'Please enter your full name.', email: 'Enter a valid email address.', phone: 'Enter a valid 10-digit Indian mobile number.', addr: 'Please enter your full address.',
  city: 'Please enter your city.', state: 'Please select your state.', pin: 'Enter a valid 6-digit pincode.', upi: 'Enter a valid UPI ID, e.g. name@okbank.',
  cnum: 'Enter a valid card number.', cname: 'Enter the name on the card.', cexp: 'Enter a valid future expiry.', ccvv: 'Enter a 3–4 digit CVV.'
};

function Field({ id, label, error, full, children }) {
  return <div className={`field${full ? ' full' : ''}${error ? ' bad' : ''}`}><label htmlFor={id}>{label}</label>{children}<p className="err">{MESSAGES[id]}</p></div>;
}

export default function Checkout() {
  useTitle('Checkout | ChitChat Coffee');
  const { items, note, totals, clear } = useCart();
  const { toast } = useUI();
  const navigate = useNavigate();
  const prof = useRef(store.get(PROFILE, {})).current;
  const [f, setF] = useState({ name: prof.name || '', email: prof.email || '', phone: prof.phone || '', addr: prof.addr || '', city: prof.city || '', state: prof.state || '', pin: prof.pin || '', upi: '', cnum: '', cname: '', cexp: '', ccvv: '' });
  const [errors, setErrors] = useState({});
  const [ship, setShip] = useState('standard');
  const [pay, setPay] = useState('upi');
  const [step, setStep] = useState(2);
  const [processing, setProcessing] = useState(false);
  const placing = useRef(false);
  const t = totals({ ship, cod: pay === 'cod' });

  const rule = id => RULES[id] || PAY_RULES[pay][id];
  const set = (id, fmt) => e => {
    const v = fmt ? fmt(e.target.value) : e.target.value;
    setF(s => ({ ...s, [id]: v }));
    const r = rule(id); if (errors[id] && r && r(v.trim())) setErrors(er => ({ ...er, [id]: false }));
  };
  const blur = id => () => { const r = rule(id); if (r && f[id]) setErrors(er => ({ ...er, [id]: !r(f[id].trim()) })); };
  const digits = max => v => v.replace(/[^\d+]/g, '').slice(0, max);
  const props = (id, fmt) => ({ id, value: f[id], onChange: set(id, fmt), onBlur: blur(id), onFocus: () => ['upi', 'cnum', 'cname', 'cexp', 'ccvv'].includes(id) && setStep(3) });

  const submit = e => {
    e.preventDefault();
    const rules = { ...RULES, ...PAY_RULES[pay] };
    const bad = {}; let first = null;
    Object.entries(rules).forEach(([id, r]) => { const ok = r(f[id].trim()); bad[id] = !ok; if (!ok && !first) first = id; });
    setErrors(bad);
    if (first) {
      const el = document.getElementById(first);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
      toast('Please fix the highlighted fields.', { type: 'error' }); return;
    }
    const customer = { name: f.name.trim(), email: f.email.trim(), phone: normPhone(f.phone) };
    const address = { line: f.addr.trim(), city: f.city.trim(), state: f.state, pin: f.pin.trim() };
    store.set(PROFILE, { name: customer.name, email: customer.email, phone: customer.phone, addr: address.line, city: address.city, state: address.state, pin: address.pin });
    setProcessing(true);
    setTimeout(() => {
      const order = Orders.create({ items: items.map(i => ({ ...i })), totals: t, customer, address, ship, note, pay: { method: pay, last4: pay === 'card' ? f.cnum.replace(/\s/g, '').slice(-4) : '' } });
      placing.current = true; clear();
      navigate(`/order/${order.id}`);
    }, 1700);
  };

  if (!items.length && !placing.current && !processing) {
    return (
      <main className="page"><div className="page-title"><h1>Checkout</h1></div>
        <div className="empty container" style={{ padding: '50px 5vw 90px' }}><div className="empty-ico"><Icon name="cup" size={90} /></div><h4>Nothing to check out yet</h4><p>Add some coffee to your cart first.</p><Link className="btn" to="/shop"><span>Browse the shop</span></Link></div>
      </main>
    );
  }

  return (
    <main className="page">
      <Stepper step={step} />
      <div className="page-title"><h1>Checkout</h1></div>
      <form className="container co-layout" onSubmit={submit} noValidate>
        <div>
          <div className="panel"><h2><i>1</i> Contact details</h2><div className="fgrid">
            <Field id="name" label="Full name" full error={errors.name}><input type="text" autoComplete="name" {...props('name')} /></Field>
            <Field id="email" label="Email" error={errors.email}><input type="email" autoComplete="email" placeholder="you@example.com" {...props('email')} /></Field>
            <Field id="phone" label="Mobile number" error={errors.phone}><input type="tel" inputMode="numeric" maxLength={13} autoComplete="tel" placeholder="10-digit mobile" {...props('phone', digits(13))} /></Field>
          </div></div>

          <div className="panel"><h2><i>2</i> Delivery address</h2><div className="fgrid">
            <Field id="addr" label="Address" full error={errors.addr}><input type="text" autoComplete="street-address" placeholder="House no., street, area" {...props('addr')} /></Field>
            <Field id="city" label="City" error={errors.city}><input type="text" autoComplete="address-level2" {...props('city')} /></Field>
            <Field id="state" label="State" error={errors.state}><select {...props('state')}><option value="">Select state</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field id="pin" label="Pincode" error={errors.pin}><input type="text" inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="6 digits" {...props('pin', digits(6))} /></Field>
          </div></div>

          <div className="panel"><h2><i>3</i> Delivery method</h2>
            {Object.entries(SHIP).map(([k, s]) => (
              <label key={k} className={`choice${ship === k ? ' on' : ''}`}>
                <input type="radio" name="ship" value={k} checked={ship === k} onChange={() => setShip(k)} />
                <div><b>{s.label}</b><small>{s.eta}</small></div><em>{s.fee(t.subtotal) ? money(s.fee(t.subtotal)) : 'FREE'}</em>
              </label>
            ))}
          </div>

          <div className="panel"><h2><i>4</i> Payment</h2>
            <label className={`choice${pay === 'upi' ? ' on' : ''}`}><input type="radio" name="pay" value="upi" checked={pay === 'upi'} onChange={() => { setPay('upi'); setStep(3); }} /><div><b>UPI</b><small>Pay with any UPI app</small></div></label>
            <div className={`pay-fields${pay === 'upi' ? ' on' : ''}`}><Field id="upi" label="UPI ID" error={errors.upi}><input type="text" placeholder="name@bank" autoComplete="off" {...props('upi')} /></Field></div>

            <label className={`choice${pay === 'card' ? ' on' : ''}`}><input type="radio" name="pay" value="card" checked={pay === 'card'} onChange={() => { setPay('card'); setStep(3); }} /><div><b>Credit / Debit card</b><small>Visa, Mastercard, RuPay</small></div></label>
            <div className={`pay-fields${pay === 'card' ? ' on' : ''}`}><div className="fgrid">
              <Field id="cnum" label="Card number" full error={errors.cnum}><input type="text" inputMode="numeric" maxLength={23} placeholder="1234 5678 9012 3456" autoComplete="cc-number" {...props('cnum', v => v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim())} /></Field>
              <Field id="cname" label="Name on card" full error={errors.cname}><input type="text" autoComplete="cc-name" {...props('cname')} /></Field>
              <Field id="cexp" label="Expiry (MM/YY)" error={errors.cexp}><input type="text" inputMode="numeric" maxLength={5} placeholder="MM/YY" autoComplete="cc-exp" {...props('cexp', v => { let d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; })} /></Field>
              <Field id="ccvv" label="CVV" error={errors.ccvv}><input type="password" inputMode="numeric" maxLength={4} placeholder="•••" autoComplete="cc-csc" {...props('ccvv', digits(4))} /></Field>
            </div></div>

            <label className={`choice${pay === 'cod' ? ' on' : ''}`}><input type="radio" name="pay" value="cod" checked={pay === 'cod'} onChange={() => { setPay('cod'); setStep(3); }} /><div><b>Cash on delivery</b><small>Pay when your coffee arrives</small></div><em>+ {money(COD_FEE)}</em></label>
            <p className="muted small" style={{ marginTop: 12 }}>🔒 This is a demo store: no real payment is taken and card details are never stored or sent anywhere.</p>
          </div>
        </div>

        <aside className="summary" id="summary">
          <h2>Your order</h2>
          {items.map(i => (
            <div className="mini" key={i.key}>
              <span className="mini-badge"><b>{i.qty}</b><span className="d-thumb" style={{ display: 'block', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: '#fff' }}><CartThumb item={i} byId={byId} /></span></span>
              <span>{i.name}<small>{itemMeta(i)}</small></span><b>{money(i.unit * i.qty)}</b>
            </div>
          ))}
          <div className="s-row" style={{ marginTop: 12 }}><span>Subtotal</span><b>{money(t.subtotal)}</b></div>
          {t.discount > 0 && <div className="s-row s-disc"><span>Discount ({t.coupon})</span><b>− {money(t.discount)}</b></div>}
          <div className="s-row"><span>Shipping</span><b>{t.shipping ? money(t.shipping) : 'FREE'}</b></div>
          {t.codFee > 0 && <div className="s-row"><span>COD fee</span><b>{money(t.codFee)}</b></div>}
          <div className="s-row total"><span>Total</span><span>{money(t.total)}</span></div>
          {t.coupon && <p className="s-note">Coupon <b>{t.coupon}</b> applied.</p>}
          <button className="btn magnetic" type="submit"><span>Place order · {money(t.total)}</span></button>
          <p className="s-note" style={{ textAlign: 'center' }}><Link to="/cart" style={{ textDecoration: 'underline' }}>← Edit cart</Link></p>
          <div className="trust"><span>🔒 Secure</span><span>↩️ Easy returns</span></div>
        </aside>
      </form>

      <div className={`processing${processing ? ' on' : ''}`}><div><div className="spinner" /><h3 style={{ fontSize: 26 }}>Roasting your order…</h3><p style={{ opacity: .7, marginTop: 6 }}>Please don't close this window.</p></div></div>
    </main>
  );
}
