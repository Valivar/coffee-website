import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { money, normPhone } from '../lib/utils.js';
import { DEMO_SPEED, Orders, TRACK } from '../lib/orders.js';
import { useTitle } from '../lib/hooks.js';
import OrderCard, { fmtDate } from '../components/OrderCard.jsx';

const norm = s => { const v = String(s).toLowerCase().replace(/\s/g, ''); return /^\+?\d+$/.test(v) ? normPhone(v) : v; };

function Result({ o }) {
  const stage = Orders.stage(o), pct = stage / (TRACK.length - 1) * 100;
  const [h, setH] = useState(0);
  useEffect(() => { const t = setTimeout(() => setH(pct), 100); return () => clearTimeout(t); }, [pct]);
  return (
    <>
      <div className="o-card" style={{ marginTop: 26 }}>
        <div className="o-row"><span>Order <b>{o.id}</b></span><span>{fmtDate(o.createdAt)}</span></div>
        <div className="o-row"><span className="muted">Deliver to {o.address.city} {o.address.pin}</span><span className="muted">{money(o.totals.total)}</span></div>
        <ul className="timeline" style={{ '--h': `calc(${h}% - 6px)` }}>
          {TRACK.map((t, i) => (
            <li key={t[0]} className={i < stage ? 'done' : i === stage ? 'now' : ''}>
              <b>{t[0]}</b><small>{i <= stage ? fmtDate(o.createdAt + t[1] * 60000 / DEMO_SPEED) : 'Pending'}</small>
            </li>
          ))}
        </ul>
        <p className="muted small" style={{ marginTop: 6 }}>Demo mode: tracking runs at accelerated speed (1 minute = 1 hour) so you can watch it progress.</p>
      </div>
      <OrderCard o={o} />
    </>
  );
}

export default function TrackOrder() {
  useTitle('Track Your Order | ChitChat Coffee');
  const [sp] = useSearchParams();
  const idParam = sp.get('id') || '';
  const [oid, setOid] = useState(idParam);
  const [contact, setContact] = useState('');
  const [bad, setBad] = useState({});
  const [result, setResult] = useState(null); // { order } | { none: true }
  const recent = Orders.all();

  const run = (id, v) => {
    const o = Orders.find(id);
    setBad({ oid: !id, ov: !v });
    if (!id || !v) return;
    const ok = o && (norm(o.customer.email) === norm(v) || norm(o.customer.phone) === norm(v));
    setResult(ok ? { order: o } : { none: true });
  };
  // arriving from the confirmation page: pre-fill and show straight away
  useEffect(() => {
    const o = Orders.find(idParam);
    if (o) { setOid(o.id); setContact(o.customer.email); run(o.id, o.customer.email); }
  }, [idParam]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="page">
      <div className="page-title"><h1>Track your order</h1><p className="muted" style={{ marginTop: 8 }}>Enter the order ID from your confirmation along with the email or phone number you used.</p></div>
      <div className="track-wrap">
        <form className="track-form" noValidate onSubmit={e => { e.preventDefault(); run(oid, contact.trim()); }}>
          <div className={`field${bad.oid ? ' bad' : ''}`}><label htmlFor="oid">Order ID</label><input id="oid" type="text" placeholder="e.g. CC123456" autoComplete="off" value={oid} onChange={e => setOid(e.target.value)} /><p className="err">Enter your order ID.</p></div>
          <div className={`field${bad.ov ? ' bad' : ''}`}><label htmlFor="ov">Email or phone</label><input id="ov" type="text" placeholder="used at checkout" autoComplete="off" value={contact} onChange={e => setContact(e.target.value)} /><p className="err">Enter the email or phone used at checkout.</p></div>
          <button className="btn btn-dark" type="submit"><span>Track</span></button>
        </form>

        <div id="result">
          {result && result.none && <div className="o-card" style={{ marginTop: 26, textAlign: 'center' }}><b>No matching order found.</b><p className="muted">Check the order ID and the email or phone you used at checkout. Orders are stored in the browser used to place them.</p></div>}
          {result && result.order && <Result o={result.order} />}
        </div>

        {recent.length > 0 && (
          <div className="recent"><h3 style={{ marginBottom: 12 }}>Orders on this device</h3>
            {recent.map(o => <Link key={o.id} to={`/track-order?id=${o.id}`}><span><b>{o.id}</b> · {fmtDate(o.createdAt)}</span><span>{money(o.totals.total)} →</span></Link>)}
          </div>
        )}
      </div>
    </main>
  );
}
