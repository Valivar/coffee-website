import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { img } from '../lib/utils.js';
import { useParallax, useTitle } from '../lib/hooks.js';
import { CountUp, ImgReveal, Reveal, SplitLine } from '../components/Effects.jsx';

function ParallaxImg({ src, alt, speed }) {
  const ref = useParallax(speed);
  return <img ref={ref} src={src} alt={alt} />;
}

const svg = (d, extra) => <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{d}{extra}</svg>;
const VALUES = [
  [svg(<><path d="M24 40V20" /><path d="M24 26c-8 0-12-5-12-12 8 0 12 4 12 12z" /><path d="M24 22c0-6 4-10 12-10 0 8-4 10-12 10z" /></>), 'Shade-grown, sustainably', 'Coffee grows beneath native canopy, protecting soil, water and the birds that call the estate home.'],
  [svg(<><circle cx="24" cy="24" r="16" /><path d="M24 14v10l7 4" /></>), 'Roasted fresh to order', 'Your coffee is roasted after you order, never sitting on a shelf for weeks.'],
  [svg(<path d="M24 6l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" />), 'Obsessed with quality', 'Every lot is graded, sorted and cupped by hand before it earns our label.'],
  [svg(<path d="M24 40S8 30 8 18a9 9 0 0 1 16-5 9 9 0 0 1 16 5c0 12-16 22-16 22z" />), 'Fair to our people', 'Pickers and processors are part of our extended family, with fair wages year-round.']
];
const TIMELINE = [
  ['1940s', 'The first seedlings', 'Our grandfather plants the first Arabica under native shade trees.'],
  ['1980s', 'Robusta joins the estate', 'The second generation adds Robusta and builds our first curing yard.'],
  ['2008', 'In-house processing', 'A dedicated pulping and curing unit brings processing under our own roof.'],
  ['2019', 'Small-batch roastery', 'We begin roasting to order, with every batch cupped before it ships.'],
  ['Today', 'Farm to doorstep', 'From our estate to coffee lovers across the country, still hand-sorted and freshly roasted.']
];
const TEAM = [
  ['A', 'Arjun Rao', 'Estate Manager', 'Third-generation grower who knows every plot by name.', '#6e4128'],
  ['M', 'Meera Nair', 'Head Roaster', 'Develops every roast profile and cups each batch before it ships.', '#2f5d46'],
  ['K', 'Kiran Patel', 'Quality Lead', 'Grades, sorts and guards the standard of every bag.', '#a8502f'],
  ['S', 'Sana Iyer', 'Customer Care', "Here to help you find your perfect brew.", '#43223c']
];
const GALLERY = [['pourover.jpg', 'Pour-over brewing'], ['green-latte.jpg', 'Latte art among plants'], ['cups-circle.jpg', 'Cups of coffee arranged on a stool'], ['beans-latte.jpg', 'Latte on a bed of coffee beans'], ['boards.jpg', 'Coffee grounds and beans on wooden boards'], ['iced.jpg', 'Iced coffee']];
const QUOTES = [
  ['The freshest coffee I have ever had delivered. You can smell the difference the moment you open the pack.', 'ANANYA R., BENGALURU'],
  ['I switched our whole café to their beans. Customers keep asking what changed.', 'KARTHIK S., CAFÉ OWNER'],
  ['The blend-your-own tool is brilliant. I finally found the exact strength I like.', 'MEERA P., CHENNAI']
];

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(n => (n + 1) % QUOTES.length), 5500); return () => clearInterval(t); }, [i]);
  return (
    <section className="testi">
      <h2>Kind words</h2>
      <div className="slider">{QUOTES.map(([q, who], k) => <div key={k} className={`slide${k === i ? ' on' : ''}`}><p>“{q}”</p><b>{who}</b></div>)}</div>
      <div className="dots">{QUOTES.map((_, k) => <button key={k} className={k === i ? 'on' : ''} aria-label={`Show testimonial ${k + 1}`} onClick={() => setI(k)} />)}</div>
    </section>
  );
}

export default function About() {
  useTitle('About Us | ChitChat Coffee', 'Our story: from a family estate to small-batch roasted coffee, grown, processed and roasted in-house.');
  const bg = useParallax(-0.15);
  return (
    <main>
      <section className="about-hero">
        <div className="bg" ref={bg} />
        <div className="in">
          <p className="eyebrow fade-up" style={{ '--d': '.2s' }}>OUR STORY</p>
          <h1><SplitLine text="Grown on our estate." start={0} /><SplitLine text="Roasted with care." start={4} em={[0]} /></h1>
          <p className="lead fade-up" style={{ '--d': '1s' }}>For more than eighty years our family has grown coffee under the shade of the hills. Today we take every bean from cherry to cup, ourselves.</p>
          <Link className="btn magnetic fade-up" style={{ '--d': '1.15s' }} to="/shop"><span>Shop our coffee</span></Link>
        </div>
      </section>

      <section className="split">
        <ImgReveal><ParallaxImg src={img('sack.jpg')} alt="Roasted coffee beans in a burlap sack" speed={0.08} /></ImgReveal>
        <Reveal><p className="eyebrow">WHO WE ARE</p><h2>A family estate with a roaster's heart</h2>
          <p>What started as a few acres of Arabica and Robusta has grown into a vertically integrated coffee house. We cultivate, harvest, pulp, cure, roast and grind in one place, so nothing about your cup is left to chance.</p>
          <p>Keeping every step under one roof lets us trace every bag back to the plot it came from, and gives us the freedom to roast in small batches, to order.</p></Reveal>
      </section>

      <section className="stats-band">
        <Reveal className="row">
          <div><CountUp to={80} /><span>Years of heritage</span></div>
          <div><CountUp to={120} /><span>Acres under shade</span></div>
          <div><CountUp to={50} /><span>Coffee variations</span></div>
          <div><CountUp to={25000} /><span>Happy customers</span></div>
        </Reveal>
      </section>

      <section className="tl">
        <h2>Our journey</h2>
        <div className="tl-line">{TIMELINE.map(([yr, h, p]) => <Reveal className="tl-item" key={yr}><div className="yr">{yr}</div><div><h3>{h}</h3><p>{p}</p></div></Reveal>)}</div>
      </section>

      <section className="vals">
        <h2>What we stand for</h2>
        <div className="val-grid">{VALUES.map(([icon, h, p], i) => <Reveal className="val" key={h} style={{ '--i': i }}>{icon}<h3>{h}</h3><p>{p}</p></Reveal>)}</div>
      </section>

      <section className="split flip" style={{ paddingTop: 20 }}>
        <ImgReveal><ParallaxImg src={img('portafilters.jpg')} alt="Whole beans, ground coffee and a latte" speed={0.08} /></ImgReveal>
        <Reveal><p className="eyebrow">THE CRAFT</p><h2>Bean to cup, no shortcuts</h2>
          <p>From red ripe cherry to sealed pouch, there are seven careful stages, and we do each one ourselves. It is slower than the industrial route, and it is why our coffee tastes the way it does.</p>
          <Link className="btn btn-dark magnetic" to="/#process"><span>See the process</span></Link></Reveal>
      </section>

      <section className="team">
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px,4.4vw,56px)', marginBottom: 56 }}>The people behind the cup</h2>
        <div className="team-grid">{TEAM.map(([ini, n, role, p, c], i) => <Reveal className="member" key={n} style={{ '--i': i }}><div className="avatar" style={{ background: c }}>{ini}</div><h3>{n}</h3><small>{role}</small><p>{p}</p></Reveal>)}</div>
      </section>

      <section className="gal-sec">
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(32px,4.4vw,56px)', marginBottom: 46 }}>Life at the estate</h2>
        <div className="masonry">{GALLERY.map(([f, alt]) => <Reveal key={f}><img src={img(f)} alt={alt} loading="lazy" /></Reveal>)}</div>
      </section>

      <Testimonials />

      <section className="cta-band"><h2>Taste the difference</h2><Link className="btn magnetic" to="/shop"><span>Explore the collection</span></Link> &nbsp; <Link className="btn btn-ghost" to="/contact"><span>Get in touch</span></Link></section>
    </main>
  );
}
