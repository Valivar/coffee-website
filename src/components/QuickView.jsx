import { Link } from 'react-router-dom';
import { byId, catLabel } from '../data/products.js';
import { useUI } from '../context/UIContext.jsx';
import BuyBox from './BuyBox.jsx';
import { Stars, Visual } from './Visual.jsx';

export default function QuickView() {
  const { quickId, closeQuick } = useUI();
  const p = quickId ? byId(quickId) : null;
  return (
    <div className={`modal${p ? ' open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!p} onClick={e => { if (e.target === e.currentTarget) closeQuick(); }}>
      <div className="modal-box">
        {p && (
          <>
            <button className="icon-btn modal-x" aria-label="Close" onClick={closeQuick}>✕</button>
            <div className="qv">
              <div className="qv-media"><Visual p={p} /></div>
              <div className="qv-info">
                <p className="eyebrow">{catLabel(p.cat)}</p><h3>{p.name}</h3>
                <p className="rating"><Stars rating={p.rating} /> <span>{p.rating} · {p.reviews} reviews</span></p>
                <p className="muted">{p.blurb}</p>
                {p.notes.length > 0 && <p className="chips">{p.notes.map(n => <span key={n}>{n}</span>)}</p>}
                <BuyBox key={p.id} p={p} onAdd={closeQuick} />
                <Link className="link-arrow" to={`/product/${p.id}`} onClick={closeQuick}>View full details →</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
