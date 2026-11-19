import { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartDrawer from './CartDrawer.jsx';
import QuickView from './QuickView.jsx';
import Toasts from './Toasts.jsx';
import { Cursor, ScrollProgress } from './Effects.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useLockBody } from '../lib/hooks.js';

const pageKey = p => (p === '/' ? 'home' : p.startsWith('/product/') ? 'product' : p.startsWith('/order/') ? 'success' : p === '/track-order' ? 'track' : p.slice(1) || 'home');

export default function Layout() {
  const { pathname, hash } = useLocation();
  const { drawerOpen, closeDrawer, quickId, closeQuick, loaded, setLoaded } = useUI();

  // CSS hooks: <body data-page="..."> and <body class="loaded">
  useLayoutEffect(() => { document.body.dataset.page = pageKey(pathname); }, [pathname]);
  useEffect(() => { document.body.classList.toggle('loaded', loaded); }, [loaded]);
  // every page except the home intro is "loaded" straight away
  useEffect(() => { if (pathname !== '/') setLoaded(true); }, [pathname, setLoaded]);

  // scroll to top on navigation, or to the #anchor if there is one
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => { const el = document.getElementById(hash.slice(1)); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  useEffect(() => {
    const k = e => { if (e.key === 'Escape') { closeDrawer(); closeQuick(); } };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [closeDrawer, closeQuick]);

  const modalOpen = drawerOpen || !!quickId;
  useLockBody(modalOpen);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <div className={`overlay${modalOpen ? ' show' : ''}`} onClick={() => { closeDrawer(); closeQuick(); }} />
      <CartDrawer />
      <QuickView />
      <Toasts />
      <ScrollProgress />
      <div className="curtain" key={pathname} />
      <Cursor />
    </>
  );
}
