import { useEffect, useRef, useState } from 'react';
import { useInView } from '../lib/hooks.js';
import { useUI } from '../context/UIContext.jsx';
import { finePointer, reduceMotion } from '../lib/utils.js';

/** Fades/slides children in when scrolled into view */
export function Reveal({ as: Tag = 'div', className = '', style, children, ...rest }) {
  const [ref, seen] = useInView();
  return <Tag ref={ref} className={`reveal${seen ? ' in' : ''} ${className}`.trim()} style={style} {...rest}>{children}</Tag>;
}

/** Arch/clip-path image reveal. Observes its parent, because a fully clipped element reports as off-screen. */
export function ImgReveal({ className = 'art', children }) {
  const [ref, seen] = useInView({ parent: true, threshold: 0.25 });
  return <div ref={ref} className={`${className} img-reveal${seen ? ' in' : ''}`}>{children}</div>;
}

/** Splits a headline into masked words that rise in once the page has loaded */
export function SplitLine({ text, start = 0, className = '', em = [] }) {
  return (
    <span className={`line ${className}`.trim()} data-split="">
      {text.trim().split(/\s+/).map((w, i) => <span className="w" key={i}><span style={{ '--wi': start + i }}>{em.includes(i) ? <em>{w}</em> : w}</span></span>)}
    </span>
  );
}

/** Number that counts up when visible (and the page has finished its intro) */
export function CountUp({ to }) {
  const [ref, seen] = useInView({ threshold: 0.4 });
  const { loaded } = useUI();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen || !loaded) return;
    if (reduceMotion()) { setN(to); return; }
    let raf; const s = performance.now() + 500;
    const tick = now => {
      const p = Math.min(1, Math.max(0, (now - s) / 1800));
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, loaded, to]);
  return <b ref={ref}>{n.toLocaleString('en-IN')}</b>;
}

export function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    const ro = new ResizeObserver(on); ro.observe(document.body);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); ro.disconnect(); };
  }, []);
  return <div className="progress" ref={ref} />;
}

/** Custom cursor (fine pointers only) + magnetic buttons */
export function Cursor() {
  const dot = useRef(null), ring = useRef(null), label = useRef(null);
  useEffect(() => {
    if (!finePointer()) return;
    let mx = 0, my = 0, rx = 0, ry = 0, raf;
    const root = document.documentElement;
    const move = e => {
      if (!root.classList.contains('has-cursor')) { rx = e.clientX; ry = e.clientY; root.classList.add('has-cursor'); }
      mx = e.clientX; my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${mx}px,${my}px)`;
      if (!reduceMotion()) {
        const b = e.target.closest && e.target.closest('.magnetic');
        if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; }
      }
    };
    const out = e => { const b = e.target.closest && e.target.closest('.magnetic'); if (b) b.style.transform = ''; };
    const over = e => {
      const t = e.target.closest && e.target.closest('a, button, summary, select, .pcard, .post, input[type=range], label.opt');
      ring.current && ring.current.classList.toggle('hover', !!t);
      if (label.current) label.current.textContent = t && t.matches('.pcard') ? 'VIEW' : t && t.matches('.post') ? 'OPEN' : '';
    };
    const follow = () => { rx += (mx - rx) * .16; ry += (my - ry) * .16; if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`; raf = requestAnimationFrame(follow); };
    follow();
    addEventListener('mousemove', move); document.addEventListener('mouseout', out); document.addEventListener('mouseover', over);
    return () => { cancelAnimationFrame(raf); removeEventListener('mousemove', move); document.removeEventListener('mouseout', out); document.removeEventListener('mouseover', over); root.classList.remove('has-cursor'); };
  }, []);
  return (<><div className="cursor-dot" ref={dot} /><div className="cursor-ring" ref={ring}><span ref={label} /></div></>);
}

/** FAQ accordion with smooth open/close; one item open at a time */
function Item({ open, onToggle, num, tag, q, a, tagFirst }) {
  const [domOpen, setDom] = useState(open);
  const [cls, setCls] = useState(open);
  useEffect(() => {
    if (open) { setDom(true); const r = requestAnimationFrame(() => setCls(true)); return () => cancelAnimationFrame(r); }
    setCls(false); const t = setTimeout(() => setDom(false), 500); return () => clearTimeout(t);
  }, [open]);
  return (
    <details open={domOpen} className={cls ? 'open' : ''}>
      <summary onClick={e => { e.preventDefault(); onToggle(); }}>
        <span>{num}</span>{tagFirst && <small>{tag}</small>}{q}{!tagFirst && <small>{tag}</small>}
      </summary>
      <div className="ans"><p>{a}</p></div>
    </details>
  );
}
export function Accordion({ items, tagFirst = true }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="faq-list">
      {items.map((it, i) => <Item key={i} num={String(i + 1).padStart(2, '0')} {...it} tagFirst={tagFirst} open={idx === i} onToggle={() => setIdx(idx === i ? -1 : i)} />)}
    </div>
  );
}
