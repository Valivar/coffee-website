import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { reduceMotion } from '../lib/utils.js';
import { Orders, SHIP } from '../lib/orders.js';
import { useTitle } from '../lib/hooks.js';
import OrderCard from '../components/OrderCard.jsx';
import Stepper from '../components/Stepper.jsx';
import { Icon } from '../components/Visual.jsx';

const etaDate = o => new Date(o.createdAt + (o.ship === 'express' ? 2 : 5) * 864e5).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
const payLabel = o => ({ upi: 'UPI', card: `Card ending ${o.pay.last4}`, cod: 'Cash on delivery' }[o.pay.method]);

function Confetti() {
  const [bits, setBits] = useState(() => Array.from({ length: 36 }, () => ({
    left: Math.random() * 100 + 'vw', animationDuration: 2.5 + Math.random() * 2.5 + 's', animationDelay: Math.random() * 1.2 + 's',
    width: 10 + Math.random() * 12, height: 15 + Math.random() * 16, opacity: .6 + Math.random() * .4
  })));
  useEffect(() => { const t = setTimeout(() => setBits([]), 7000); return () => clearTimeout(t); }, []);
  return <>{bits.map((b, i) => <i key={i} className="confetti" style={b} />)}</>;
}

export default function OrderSuccess() {
  const { id } = useParams();
  const o = useMemo(() => Orders.find(id), [id]);
  useTitle(o ? `Order ${o.id} confirmed | ChitChat Coffee` : 'Order not found | ChitChat Coffee');

  if (!o) {
    return (
      <main className="page"><div className="empty container" style={{ padding: '70px 5vw' }}><div className="empty-ico"><Icon name="cup" size={80} /></div><h4>We couldn't find that order</h4>
        <p>Open the same browser you used to place it, or track it with your order ID.</p><Link className="btn" to="/track-order"><span>Track an order</span></Link></div></main>
    );
  }
  return (
    <main className="page">
      <Stepper step={4} />
      <div className="success">
        <svg className="check" viewBox="0 0 110 110"><circle cx="55" cy="55" r="48" /><path d="M33 57l15 15 30-33" /></svg>
        <h1>Thank you, {o.customer.name.split(' ')[0]}!</h1>
        <p className="muted">Your order has been placed and the roasters are on it.</p>
        <div className="order-id">{o.id}</div>
        <p>Estimated delivery by <b>{etaDate(o)}</b> · {SHIP[o.ship].label}</p>
        <OrderCard o={o} />
        <div className="o-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div><small className="muted">DELIVERING TO</small><p><b>{o.customer.name}</b><br />{o.address.line}<br />{o.address.city}, {o.address.state} {o.address.pin}<br />{o.customer.phone}</p></div>
          <div><small className="muted">PAYMENT</small><p><b>{payLabel(o)}</b><br />{o.pay.method === 'cod' ? 'Pay on delivery' : 'Paid (demo)'}</p>
            {o.note && <><small className="muted">NOTE</small><p>{o.note}</p></>}</div>
        </div>
        <Link className="btn magnetic" to={`/track-order?id=${o.id}`}><span>Track this order</span></Link> &nbsp; <Link className="btn btn-ghost" to="/shop"><span>Keep shopping</span></Link>
      </div>
      {!reduceMotion() && <Confetti />}
    </main>
  );
}
