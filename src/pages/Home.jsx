import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { byId } from '../data/products.js';
import { img, reduceMotion, finePointer } from '../lib/utils.js';
import { useUI } from '../context/UIContext.jsx';
import { useParallax, useTitle } from '../lib/hooks.js';
import { Accordion, CountUp, ImgReveal, Reveal, SplitLine } from '../components/Effects.jsx';
import ProductCard from '../components/ProductCard.jsx';

let introDone = false; // the cup preloader only plays on the first visit to "/" in a session

function Preloader() {
  return (
    <div className="loader" id="loader" aria-hidden="true">
      <div className="loader-inner">
        <svg viewBox="0 0 120 120" width="130" height="130">
          <defs><clipPath id="cupClip"><path d="M25 50h60v28a22 22 0 0 1-22 22H47a22 22 0 0 1-22-22z" /></clipPath></defs>
          <g clipPath="url(#cupClip)"><rect className="fill" x="20" y="100" width="70" height="55" fill="#c68b4e" /></g>
          <path d="M25 50h60v28a22 22 0 0 1-22 22H47a22 22 0 0 1-22-22z" fill="none" stroke="#e3b26b" strokeWidth="3" strokeLinejoin="round" />
          <path d="M85 58h6a10 10 0 0 1 0 20h-8" fill="none" stroke="#e3b26b" strokeWidth="3" strokeLinecap="round" />
          <path className="steam s1" d="M42 40c-7-6 7-11 0-19" /><path className="steam s2" d="M55 40c-7-6 7-11 0-19" /><path className="steam s3" d="M68 40c-7-6 7-11 0-19" />
        </svg>
        <p className="loader-text">CHITCHAT<span>.</span> <em>brewing…</em></p>
      </div>
    </div>
  );
}

function Marquee() {
  const track = useRef(null);
  useEffect(() => {
    if (reduceMotion()) return;
    let x = 0, last = scrollY, raf;
    const loop = () => {
      const dy = Math.abs(scrollY - last); last = scrollY;
      x -= 0.6 + dy * 0.35;
      const half = track.current ? track.current.scrollWidth / 2 : 0;
      if (half && x < -half) x += half;
      if (track.current) track.current.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, []);
  const text = 'Single Estate ✦ Small Batch ✦ Freshly Roasted ✦ Filter Coffee ✦ Arabica & Robusta ✦ ';
  return <div className="marquee" aria-hidden="true"><div ref={track}><span>{text + text}</span></div></div>;
}

function ParallaxImg({ src, alt, speed }) {
  const ref = useParallax(speed);
  return <img ref={ref} src={src} alt={alt} />;
}

const STEPS = [
  ['Origin', 'Red Ripe Coffee Cherry', 'Hand-picked at peak ripeness from our high-altitude estate.', 'green-latte.jpg'],
  ['Depulping', 'Wet Processing & Depulping', 'Cherries are depulped to separate the fruit from the parchment-covered beans.', 'beans-bowl.jpg'],
  ['Sun-Drying', 'Sun-Dried Parchment', 'Dried on raised beds and turned by hand for even, gentle drying.', 'sack.jpg'],
  ['Curing', 'Curing & Hulling', 'Parchment is hulled away and beans are graded by size and quality.', 'beans-bg.jpg'],
  ['Roasting', 'Small-Batch Roasting', "Roasted in small batches to match each bean's profile.", 'boards.jpg'],
  ['Crack & Grind', 'Cracked & Ground', 'Ground evenly and packed straight away to lock in aroma.', 'portafilters.jpg'],
  ['Packaging', 'Sealed Fresh', 'Sealed at the source so it reaches you tasting like it just left the roaster.', 'plants-cups.jpg']
];

function Process() {
  const [active, setActive] = useState(0);
  const list = useRef(null), items = useRef([]);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(items.current.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
    items.current.forEach(el => el && io.observe(el));
    const on = () => {
      if (!list.current) return;
      const r = list.current.getBoundingClientRect();
      list.current.style.setProperty('--p', Math.min(1, Math.max(0, (innerHeight * .5 - r.top) / r.height)).toFixed(3));
    };
    on(); addEventListener('scroll', on, { passive: true });
    return () => { io.disconnect(); removeEventListener('scroll', on); };
  }, []);
  return (
    <section className="process" id="process">
      <h2 className="section-title">FROM BEAN TO CUP</h2>
      <div className="process-wrap">
        <div className="process-visual">
          <div className="pv-sticky">
            {STEPS.map((s, i) => <img key={i} className={`pv${i === active ? ' active' : ''}`} src={img(s[3])} alt="" />)}
            <div className="pv-count"><b>{String(active + 1).padStart(2, '0')}</b><span>/ 07</span></div>
          </div>
        </div>
        <ol className="steps" ref={list}>
          {STEPS.map((s, i) => (
            <li key={i} ref={el => (items.current[i] = el)} className={i === active ? 'active' : ''}>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <div><img className="step-img" src={img(s[3])} alt="" /><small>Stage {String(i + 1).padStart(2, '0')} // {s[0]}</small><h3>{s[1]}</h3><p>{s[2]}</p></div>
            </li>
          ))}
        </ol>
      </div>
      <Link className="btn btn-light magnetic" to="/shop"><span>Shop the roast →</span></Link>
    </section>
  );
}

const FAQ = [
  { tag: 'Estate Origin', q: 'Where does our coffee come from?', a: 'From our own estate, where we grow both Arabica and Robusta.' },
  { tag: 'Cultivation & Heritage', q: 'Do you grow your own coffee?', a: 'Yes. Growing it ourselves gives us control from cultivation to processing.' },
  { tag: 'In-House Processing', q: 'Where is the coffee processed?', a: 'At our own facility, with an in-house pulping and curing unit.' },
  { tag: 'Quality & Craftsmanship', q: 'How do you maintain quality?', a: 'We manage growing, harvesting, pulping, curing, roasting and grinding ourselves.' },
  { tag: 'Arabica vs Robusta', q: 'What is the difference?', a: 'Arabica is smoother and more aromatic; Robusta is stronger and fuller. We offer both.' }
];

const InstaIcon = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>;

export default function Home() {
  useTitle('ChitChat Coffee | Single Estate Freshly Roasted Beans', 'Small-batch single estate coffee, roasted fresh and delivered to your cup.');
  const { setLoaded } = useUI();
  const [showLoader] = useState(!introDone);
  const bgRef = useParallax(-0.15), blendBg = useParallax(-0.12), distBg = useParallax(-0.1);
  const visual = useRef(null);
  const [beans] = useState(() => Array.from({ length: 16 }, () => {
    const w = 14 + Math.random() * 26;
    return { width: w, height: w * 1.45, left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', rotate: Math.random() * 360 + 'deg', '--t': 7 + Math.random() * 8 + 's', '--x': (Math.random() - .5) * 90 + 'px', '--y': -30 - Math.random() * 90 + 'px', '--r': (Math.random() - .5) * 240 + 'deg', opacity: .35 + Math.random() * .5 };
  }));

  // intro preloader: finish after the page has loaded and at least ~2s have passed
  useEffect(() => {
    if (introDone) { setLoaded(true); return; }
    const done = () => { introDone = true; setLoaded(true); };
    const min = reduceMotion() ? 0 : 2000, t0 = performance.now();
    let t;
    const go = () => { t = setTimeout(done, Math.max(0, min - (performance.now() - t0))); };
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    const fallback = setTimeout(done, 4500);
    return () => { clearTimeout(t); clearTimeout(fallback); removeEventListener('load', go); };
  }, [setLoaded]);

  const onMove = e => {
    if (!finePointer() || reduceMotion() || !visual.current) return;
    visual.current.style.setProperty('--mx', ((e.clientX / innerWidth) - .5) * 2);
    visual.current.style.setProperty('--my', ((e.clientY / innerHeight) - .5) * 2);
  };
  const onLeave = () => { if (visual.current) { visual.current.style.setProperty('--mx', 0); visual.current.style.setProperty('--my', 0); } };
  const depth = n => ({ '--dp': n });
  const featured = ['deal-wali-combo', 'medium-strong-filter', 'classic-filter', 'directors-blend'].map(byId);

  return (
    <>
      {showLoader && <Preloader />}
      <main>
        <section className="hero" id="hero" onMouseMove={onMove} onMouseLeave={onLeave}>
          <div className="hero-bg" ref={bgRef} />
          <div className="beans" aria-hidden="true">{!reduceMotion() && beans.map((b, i) => <i key={i} className="bean" style={b} />)}</div>

          <div className="hero-copy">
            <p className="eyebrow fade-up" style={{ '--d': '.2s' }}>FRESHLY ROASTED</p>
            <h1><SplitLine text="Rich &" start={0} /><SplitLine text="Aromatic" start={2} /><SplitLine className="gold" text="Coffee Lounge" start={3} /></h1>
            <p className="lead fade-up" style={{ '--d': '.9s' }}>Exceptional beans, roasted with care and delivered from our estate to your cup.</p>
            <Link className="btn magnetic fade-up" style={{ '--d': '1.05s' }} to="/shop"><span>Explore Collection</span></Link>
            <ul className="stats fade-up" style={{ '--d': '1.2s' }}>
              <li><CountUp to={20} />+<span>Flavours</span></li>
              <li><CountUp to={80} />+<span>Years of Heritage</span></li>
              <li><CountUp to={50} />+<span>Variations</span></li>
            </ul>
          </div>

          <div className="hero-visual" ref={visual}>
            <div className="ring" data-depth="8" style={depth(8)}>
              <svg viewBox="0 0 200 200"><defs><path id="circ" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
                <text><textPath href="#circ" textLength="496" lengthAdjust="spacing">FRESHLY ROASTED • SINGLE ESTATE • SMALL BATCH • </textPath></text></svg>
            </div>
            <div className="disc main" data-depth="14" style={depth(14)}><img src={img('beans-latte.jpg')} alt="Latte on coffee beans" /></div>
            <div className="disc small s1" data-depth="34" style={depth(34)}><img src={img('cup-top.jpg')} alt="Black coffee" /></div>
            <div className="disc small s2" data-depth="26" style={depth(26)}><img src={img('latte-pour.jpg')} alt="Pouring latte art" /></div>
            <div className="chip c1" data-depth="40" style={depth(40)}>☕ 100% Arabica</div>
            <div className="chip c2" data-depth="22" style={depth(22)}>★ 4.9 Loved by 10k+</div>
          </div>
          <a href="#statement" className="scroll-hint" aria-label="Scroll"><span /></a>
        </section>

        <Marquee />

        <section className="statement" id="statement">
          <div className="statement-row">
            <ImgReveal><ParallaxImg src={img('sack.jpg')} alt="Roasted beans in a burlap sack" speed={0.08} /></ImgReveal>
            <Reveal className="text-block"><p className="eyebrow">THE ORIGIN</p><h2>Rooted in the <em>soil</em></h2><p>Our beans grow slowly under shade at high altitude, picked only when ripe, so every cup starts with character.</p></Reveal>
          </div>
          <div className="statement-row flip">
            <ImgReveal><ParallaxImg src={img('portafilters.jpg')} alt="Whole beans, ground coffee and latte" speed={0.08} /></ImgReveal>
            <Reveal className="text-block"><p className="eyebrow">THE CRAFT</p><h2>Perfected in the <em>Roast</em></h2><p>Small batches, patient heat and constant tasting bring out the sweetness, body and aroma each lot deserves.</p></Reveal>
          </div>
        </section>

        <Process />

        <section className="shop" id="shop">
          <p className="eyebrow">CURATED SELECTION</p>
          <h2 className="section-title dark">Explore the ChitChat Shop</h2>
          <p className="sub">Small-batch roasted beans and filter blends from high-altitude farms.</p>
          <div className="pgrid" id="featured">{featured.map((p, i) => <ProductCard key={p.id} p={p} i={i} reveal />)}</div>
          <Link className="btn magnetic view-all" to="/shop"><span>View all coffees</span></Link>
        </section>

        <section className="blend" id="blend">
          <div className="blend-bg" ref={blendBg} />
          <Reveal className="blend-copy"><h2>Wanna get <em>creative?</em></h2><p>Blend your own coffee</p><Link className="btn magnetic" to="/blend"><span>Blend Now</span></Link></Reveal>
          <div className="blend-art">
            <div className="disc blend-disc"><img src={img('boards.jpg')} alt="" /></div>
            <div className="disc blend-disc d2"><img src={img('pourover.jpg')} alt="" /></div>
          </div>
        </section>

        <section className="insta">
          <p className="eyebrow">FOLLOW ALONG</p>
          <h2 className="section-title dark">@chitchat.coffee on Instagram</h2>
          <div className="insta-grid">
            {[['pourover.jpg', 'Natural process'], ['latte-pour.jpg', 'Find your coffee'], ['iced.jpg', 'Washed process'], ['cups-circle.jpg', 'Filter coffee mornings']].map(([src, cap], i) => (
              <Reveal as="a" key={cap} className="post" style={{ '--i': i }} href="#" onClick={e => e.preventDefault()}><img src={img(src)} alt="" /><span><InstaIcon />{cap}</span></Reveal>
            ))}
          </div>
          <a className="btn magnetic" href="#" onClick={e => e.preventDefault()}><span>Follow us</span></a>
        </section>

        <section className="distributor" id="distributor">
          <div className="distributor-bg" ref={distBg} />
          <Reveal><h2>Become a distributor</h2><p>Bring freshly roasted estate coffee to your city. Write to us and we will share the details.</p>
            <Link className="btn btn-light magnetic" to="/contact#distributor"><span>Get in touch</span></Link></Reveal>
        </section>

        <section className="faq">
          <h2 className="section-title dark">Frequently Asked Questions</h2>
          <Accordion items={FAQ} />
          <p className="faq-more">Can't find what you're looking for? <Link to="/contact">Chat with our coffee team →</Link></p>
        </section>
      </main>
    </>
  );
}
