import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isEmail, isPhone, normPhone, store } from '../lib/utils.js';
import { useUI } from '../context/UIContext.jsx';
import { useTitle } from '../lib/hooks.js';
import { Accordion } from '../components/Effects.jsx';

const KEY = 'chitchat.messages.v1';
const RULES = { n: v => v.length >= 2, e: isEmail, p: isPhone, m: v => v.length >= 10, c: v => v.length >= 2 };
const MSG = { n: 'Please enter your name.', e: 'Enter a valid email address.', p: 'Enter a valid 10-digit mobile number.', m: 'Please write at least 10 characters.', c: 'Tell us your city.' };
const FAQ = [
  { tag: 'Shipping', q: 'How long does delivery take?', a: 'Standard delivery takes 3–5 business days, express 1–2 days. Orders over ₹599 ship free.' },
  { tag: 'Returns', q: 'Can I return opened coffee?', a: "Unopened packs can be returned within 7 days. If something arrives damaged we'll replace it free of charge." },
  { tag: 'Wholesale', q: 'Do you offer wholesale pricing?', a: 'Yes. Choose "Become a distributor" above and tell us a little about your business.' }
];
const Ico = ({ children }) => <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
function Field({ id, label, children, full, hidden, error }) {
  if (hidden) return null;
  return (
    <div className={`field${full ? ' full' : ''}${error ? ' bad' : ''}`}><label htmlFor={id}>{label}</label>{children}{MSG[id] && <p className="err">{MSG[id]}</p>}</div>
  );
}
const blank = { n: '', e: '', p: '', c: '', m: '', t: 'Order help', b: 'Retail store', v: 'Under 25 kg' };

export default function Contact() {
  useTitle('Contact Us | ChitChat Coffee', 'Get in touch with the ChitChat coffee team, or enquire about becoming a distributor.');
  const { hash } = useLocation();
  const { toast } = useUI();
  const [mode, setMode] = useState(hash === '#distributor' ? 'distributor' : 'general');
  const [f, setF] = useState(blank);
  const [bad, setBad] = useState({});
  const [sent, setSent] = useState(null);
  const dist = mode === 'distributor';

  useEffect(() => { setMode(hash === '#distributor' ? 'distributor' : 'general'); }, [hash]);

  const set = id => e => {
    const v = id === 'p' ? e.target.value.replace(/[^\d+]/g, '') : e.target.value;
    setF(s => ({ ...s, [id]: v }));
    if (bad[id] && RULES[id] && RULES[id](v.trim())) setBad(b => ({ ...b, [id]: false }));
  };

  const submit = e => {
    e.preventDefault();
    const ids = ['n', 'e', 'p', 'm'].concat(dist ? ['c'] : []);
    const b = {}; let first = null;
    ids.forEach(id => { const ok = RULES[id](f[id].trim()); b[id] = !ok; if (!ok && !first) first = id; });
    setBad(b);
    if (first) { document.getElementById(first)?.focus(); toast('Please fix the highlighted fields.', { type: 'error' }); return; }
    const msg = {
      id: 'MSG' + Date.now().toString(36).toUpperCase(), at: Date.now(), type: mode, name: f.n.trim(), email: f.e.trim(), phone: normPhone(f.p),
      ...(dist ? { city: f.c.trim(), business: f.b, volume: f.v } : { topic: f.t }), message: f.m.trim()
    };
    store.set(KEY, [msg, ...store.get(KEY, [])].slice(0, 50));
    setSent(msg);
  };
  const again = () => { setF(blank); setBad({}); setSent(null); };

  return (
    <main className="page">
      <div className="container shop-hero" style={{ gridTemplateColumns: '1fr' }}><div><h1>Let's talk coffee</h1><p>Questions, wholesale enquiries or just saying hello: we usually reply within one working day.</p></div></div>
      <div className="container contact-grid">
        <div className="info-cards">
          <div className="info"><Ico><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></Ico><div><h3>Visit the estate</h3><p>123 Estate Road, Coffee Town,<br />Karnataka 000000</p></div></div>
          <div className="info"><Ico><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Ico><div><h3>Call us</h3><p>+91 00000 00000<br />Mon–Sat, 9am – 6pm</p></div></div>
          <div className="info"><Ico><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Ico><div><h3>Email</h3><p>hello@example.com</p></div></div>
          <div className="map" aria-hidden="true"><span className="pin-dot" /></div>
        </div>

        <div className="panel" id="distributor">
          {!sent && <div className="seg" role="tablist"><button className={!dist ? 'on' : ''} onClick={() => setMode('general')}>General enquiry</button><button className={dist ? 'on' : ''} onClick={() => setMode('distributor')}>Become a distributor</button></div>}
          {!sent ? (
            <form onSubmit={submit} noValidate>
              <div className="fgrid">
                <Field id="n" error={bad.n} label="Your name"><input id="n" type="text" autoComplete="name" value={f.n} onChange={set('n')} /></Field>
                <Field id="e" error={bad.e} label="Email"><input id="e" type="email" autoComplete="email" value={f.e} onChange={set('e')} /></Field>
                <Field id="p" error={bad.p} label="Phone"><input id="p" type="tel" inputMode="numeric" maxLength={13} autoComplete="tel" value={f.p} onChange={set('p')} /></Field>
                <Field id="t" error={bad.t} label="Topic" hidden={dist}><select id="t" value={f.t} onChange={set('t')}><option>Order help</option><option>Product question</option><option>Wholesale / bulk orders</option><option>Feedback</option><option>Something else</option></select></Field>
                <Field id="c" error={bad.c} label="City" hidden={!dist}><input id="c" type="text" value={f.c} onChange={set('c')} /></Field>
                <Field id="b" error={bad.b} label="Business type" hidden={!dist}><select id="b" value={f.b} onChange={set('b')}><option>Retail store</option><option>Café / restaurant</option><option>Online seller</option><option>Hotel / office supplies</option><option>Other</option></select></Field>
                <Field id="v" error={bad.v} label="Expected monthly volume" full hidden={!dist}><select id="v" value={f.v} onChange={set('v')}><option>Under 25 kg</option><option>25 – 100 kg</option><option>100 – 500 kg</option><option>500 kg +</option></select></Field>
                <Field id="m" error={bad.m} label="Message" full><textarea id="m" rows={5} maxLength={1000} value={f.m} onChange={set('m')} placeholder={dist ? 'Tell us about your business and the area you want to cover…' : 'How can we help?'} /></Field>
              </div>
              <button className="btn btn-dark magnetic" type="submit" style={{ marginTop: 18 }}><span>{dist ? 'Send distributor enquiry' : 'Send message'}</span></button>
            </form>
          ) : (
            <div className="sent">
              <svg className="check" viewBox="0 0 110 110" style={{ width: 90, height: 90 }}><circle cx="55" cy="55" r="48" /><path d="M33 57l15 15 30-33" /></svg>
              <h3>Message sent!</h3>
              <p className="muted">Thanks {sent.name.split(' ')[0]}, we've received your {sent.type === 'distributor' ? 'distributor enquiry' : 'message'} (ref {sent.id}) and will reply to {sent.email} within one working day.</p>
              <button className="btn btn-ghost" onClick={again}><span>Send another</span></button>
            </div>
          )}
        </div>
      </div>

      <section className="container faq" style={{ maxWidth: 900, paddingTop: 0 }}>
        <h2 className="section-title dark" style={{ fontSize: 'clamp(28px,3.6vw,44px)' }}>Quick answers</h2>
        <Accordion items={FAQ} tagFirst={false} />
      </section>
    </main>
  );
}
