import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { priceFor } from '../data/products.js';
import { flyToCart, reduceMotion } from './utils.js';

/** True (once) when the element, or its parent, scrolls into view */
export function useInView({ parent = false, threshold = 0.12 } = {}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current && (parent ? ref.current.parentElement : ref.current);
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [parent, threshold, seen]);
  return [ref, seen];
}

/** Moves an element vertically as the page scrolls (speed: px per px of offset from viewport centre) */
export function useParallax(speed) {
  const ref = useRef(null);
  useEffect(() => {
    if (reduceMotion()) return;
    let tick = false;
    const run = () => {
      tick = false;
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      el.style.transform = `translate3d(0,${((r.top + r.height / 2 - innerHeight / 2) * speed).toFixed(1)}px,0)`;
    };
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(run); } };
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    run();
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }, [speed]);
  return ref;
}

/** add-to-cart with fly animation + toast */
export function useAddToCart() {
  const { add } = useCart();
  const { toast, openDrawer } = useUI();
  return useCallback((p, { size, grind = '', qty = 1 } = {}, srcEl) => {
    const sz = size || p.sizes[0];
    add({ pid: p.id, name: p.short, size: sz, grind, unit: priceFor(p, sz), qty });
    flyToCart(srcEl);
    toast(`${p.short} added to cart`, { action: { label: 'View cart', fn: openDrawer } });
  }, [add, toast, openDrawer]);
}

/** remove a line with a slide-out animation and an Undo toast */
export function useRemover() {
  const { remove, add } = useCart();
  const { toast } = useUI();
  const [leaving, setLeaving] = useState(null);
  const run = useCallback(item => {
    const go = () => { remove(item.key); setLeaving(null); toast(`Removed ${item.name}`, { action: { label: 'Undo', fn: () => add(item) } }); };
    if (reduceMotion()) return go();
    setLeaving(item.key); setTimeout(go, 300);
  }, [remove, add, toast]);
  return [leaving, run];
}

export function useLockBody(locked) {
  useEffect(() => {
    document.body.classList.toggle('lock', locked);
    return () => document.body.classList.remove('lock');
  }, [locked]);
}

export function useTitle(title, description) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let m = document.querySelector('meta[name=description]');
      if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
      m.content = description;
    }
  }, [title, description]);
}
