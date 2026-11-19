import { useEffect, useState } from 'react';
import { useUI } from '../context/UIContext.jsx';

function Toast({ t, onDone }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const a = requestAnimationFrame(() => setShown(true));
    const b = setTimeout(() => setShown(false), t.ms || 3200);
    const c = setTimeout(onDone, (t.ms || 3200) + 400);
    return () => { cancelAnimationFrame(a); clearTimeout(b); clearTimeout(c); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`toast${t.type ? ' ' + t.type : ''}${shown ? ' in' : ''}`}>
      <span>{t.msg}</span>
      {t.action && <button onClick={() => { t.action.fn(); onDone(); }}>{t.action.label}</button>}
    </div>
  );
}

export default function Toasts() {
  const { toasts, dismissToast } = useUI();
  return <div className="toasts" aria-live="polite">{toasts.map(t => <Toast key={t.id} t={t} onDone={() => dismissToast(t.id)} />)}</div>;
}
