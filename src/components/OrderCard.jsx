import { byId } from '../data/products.js';
import { money } from '../lib/utils.js';
import { itemMeta } from './CartDrawer.jsx';
import { CartThumb } from './Visual.jsx';

export const fmtDate = ts => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Line items + totals for a placed order */
export default function OrderCard({ o }) {
  return (
    <div className="o-card">
      {o.items.map(i => (
        <div className="mini" key={i.key} style={{ gridTemplateColumns: '56px 1fr auto', borderColor: 'rgba(59,35,20,.1)' }}>
          <span className="d-thumb" style={{ display: 'block', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', background: '#fff' }}><CartThumb item={i} byId={byId} /></span>
          <span>{i.name} × {i.qty}<small className="muted">{itemMeta(i)}</small></span><b>{money(i.unit * i.qty)}</b>
        </div>
      ))}
      <div className="o-row" style={{ marginTop: 10 }}><span>Subtotal</span><span>{money(o.totals.subtotal)}</span></div>
      {o.totals.discount > 0 && <div className="o-row"><span>Discount</span><span>− {money(o.totals.discount)}</span></div>}
      <div className="o-row"><span>Shipping</span><span>{o.totals.shipping ? money(o.totals.shipping) : 'FREE'}</span></div>
      {o.totals.codFee > 0 && <div className="o-row"><span>COD fee</span><span>{money(o.totals.codFee)}</span></div>}
      <div className="o-row total"><span>Total paid</span><span>{money(o.totals.total)}</span></div>
    </div>
  );
}
