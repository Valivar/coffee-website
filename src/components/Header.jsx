import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';

const LINKS = [
  ['/', 'home', true], ['/shop', 'shop'], ['/blend', 'blend your own coffee'], ['/about', 'about'],
  ['/contact#distributor', 'become a distributor', false, true], ['/contact', 'contact']
];

export default function Header() {
  const { count } = useCart();
  const { openDrawer } = useUI();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const [hide, setHide] = useState(false);
  const [compact, setCompact] = useState(false);
  const [bump, setBump] = useState(false);
  const last = useRef(0), prevCount = useRef(count);

  useEffect(() => { setMenu(false); }, [pathname]);
  useEffect(() => {
    last.current = scrollY;
    const on = () => {
      const y = scrollY;
      setHide(y > last.current && y > 200);
      setCompact(y > 80);
      last.current = y;
    };
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    if (count > prevCount.current) { setBump(true); const t = setTimeout(() => setBump(false), 520); prevCount.current = count; return () => clearTimeout(t); }
    prevCount.current = count;
  }, [count]);

  return (
    <header className={`site-header${hide && !menu ? ' hide' : ''}${compact ? ' compact' : ''}`} id="top">
      <Link className="logo" to="/">CHITCHAT<span>.</span></Link>
      <nav className={`nav${menu ? ' open' : ''}`} aria-label="Main">
        {LINKS.map(([to, label, end, never]) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive && !never ? 'active' : undefined)}>{label}</NavLink>
        ))}
      </nav>
      <div className="header-actions">
        <button className={`cart${bump ? ' bump' : ''}`} id="cartIcon" aria-label="Open cart" onClick={openDrawer}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" /></svg>
          <b id="cartCount">{count}</b>
        </button>
        <button className="burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(m => !m)}><i /><i /><i /></button>
      </div>
    </header>
  );
}
