import { SCHEMES } from '../data/products.js';

const ICONS = {
  sparkle: '<path d="M14 34c-4-5-3-13 5-17s15-2 17 3-1 13-9 17-10 3-13-3z"/><path d="M19 30c4-6 9-10 15-12"/><path d="M38 6v8M34 10h8M10 8v6M7 11h6"/>',
  bean: '<ellipse cx="24" cy="31" rx="9" ry="13" transform="rotate(20 24 31)"/><path d="M20 21c5 4 4 12 8 20"/><path d="M17 6c-3 3 3 5 0 9M26 6c-3 3 3 5 0 9"/>',
  dripper: '<path d="M10 12h28l-7 16H17z"/><path d="M20 28v4h8v-4"/><path d="M13 34h22v9H13z"/><path d="M8 12h32"/>',
  cup: '<path d="M9 21h25v8a9 9 0 0 1-9 9h-7a9 9 0 0 1-9-9z"/><path d="M34 23h3a4.5 4.5 0 0 1 0 9h-4"/><path d="M7 43h32"/><path d="M16 6c-3 3 3 5 0 9M24 6c-3 3 3 5 0 9"/>',
  grinder: '<path d="M13 17h22v11H13z"/><path d="M11 28h26v13H11z"/><path d="M24 17V9h11"/><path d="M35 6v6"/><circle cx="24" cy="35" r="2.5"/>',
  beans: '<ellipse cx="17" cy="27" rx="8.5" ry="12" transform="rotate(-25 17 27)"/><path d="M13 18c6 3 5 11 10 17"/><ellipse cx="32" cy="23" rx="8.5" ry="12" transform="rotate(25 32 23)"/><path d="M29 14c-2 6 4 8 0 16"/>'
};

/** Line icon. The path data above is a static, trusted constant. */
export function Icon({ name, size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />
  );
}

function wrap(text, max = 11, lines = 3) {
  const out = []; let cur = '';
  text.split(/\s+/).forEach(w => {
    if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  });
  if (cur) out.push(cur);
  return out.slice(0, lines);
}

/** Coffee pouch illustration */
export function Pouch({ name = 'Coffee', scheme = 'dark', sub = '' }) {
  const s = SCHEMES[scheme] || SCHEMES.dark;
  const lines = wrap(name);
  return (
    <svg className="pouch" viewBox="0 0 200 280" role="img" aria-label={`${name} pack`}>
      <ellipse cx="100" cy="268" rx="64" ry="7" fill="rgba(0,0,0,.2)" />
      <path d="M32 30H168L178 250C130 262 70 262 22 250Z" fill={s.bag} />
      <path d="M168 30L178 250C172 252 166 253 160 254Z" fill="#000" opacity=".14" />
      <path d="M32 30L22 250C28 252 34 253 40 254Z" fill="#fff" opacity=".10" />
      <rect x="32" y="30" width="136" height="22" fill="#000" opacity=".16" />
      <path d="M38 41H162" stroke="#fff" strokeOpacity=".4" strokeDasharray="3 3" />
      <rect x="46" y="94" width="108" height="130" rx="10" fill={s.label} />
      <g transform="translate(100 120) rotate(25)">
        <ellipse rx="10" ry="14" fill={s.accent} />
        <path d="M-2 -11C6 -4 -6 4 2 11" stroke={s.label} strokeWidth="2" fill="none" />
      </g>
      {lines.map((l, i) => (
        <text key={i} x="100" y={150 + i * 16} textAnchor="middle" fontFamily="Playfair Display,Georgia,serif" fontWeight="700" fontSize="14.5" fill={s.ink}>{l}</text>
      ))}
      <text x="100" y="206" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="7.5" letterSpacing="1.1" fill={s.ink} opacity=".75">{(sub || '').toUpperCase()}</text>
    </svg>
  );
}

const st = { stroke: '#3b2314', strokeWidth: 5, strokeLinejoin: 'round', strokeLinecap: 'round' };
const GEAR = {
  dripper: <>
    <path d="M44 66h112l-30 84H74z" fill="#e3b26b" {...st} /><rect x="84" y="150" width="32" height="14" fill="#3b2314" />
    <path d="M62 170h76l-6 64c-1 9-8 14-17 14H85c-9 0-16-5-17-14z" fill="#f6ecdc" {...st} /><path d="M70 205h60" stroke="#6b4228" strokeWidth="14" strokeLinecap="round" />
  </>,
  grinder: <>
    <path d="M66 100h68l8 28H58z" fill="#e3b26b" {...st} /><rect x="58" y="128" width="84" height="94" rx="8" fill="#6b4228" {...st} />
    <rect x="72" y="196" width="56" height="26" rx="4" fill="#f6ecdc" {...st} /><path d="M100 100V62h56" fill="none" {...st} />
    <circle cx="160" cy="62" r="9" fill="#e3b26b" {...st} /><circle cx="100" cy="160" r="9" fill="#e3b26b" {...st} />
  </>,
  kettle: <>
    <path d="M56 112c0-14 10-22 44-22s44 8 44 22l8 100c0 14-14 24-52 24s-52-10-52-24z" fill="#6b4228" {...st} />
    <path d="M146 120c26-4 38-34 22-60l-6-10" fill="none" {...st} /><path d="M56 136c-26 2-38 30-24 52" fill="none" {...st} />
    <rect x="88" y="76" width="24" height="14" rx="5" fill="#e3b26b" {...st} /><path d="M72 150h56" stroke="#e3b26b" strokeWidth="6" strokeLinecap="round" />
  </>,
  press: <>
    <rect x="62" y="96" width="76" height="140" rx="8" fill="#f6ecdc" {...st} /><path d="M62 170h76v58c0 6-3 8-8 8H70c-5 0-8-2-8-8z" fill="#6b4228" />
    <rect x="62" y="96" width="76" height="140" rx="8" fill="none" {...st} /><path d="M100 96V52" fill="none" {...st} />
    <circle cx="100" cy="48" r="11" fill="#e3b26b" {...st} /><path d="M138 120c24 0 24 44 0 44" fill="none" {...st} />
  </>
};

export function Gear({ kind }) {
  return (
    <svg className="pouch" viewBox="0 0 200 280" role="img" aria-label={kind}>
      <ellipse cx="100" cy="262" rx="62" ry="7" fill="rgba(0,0,0,.15)" />{GEAR[kind]}
    </svg>
  );
}

/** Tinted box containing the product's pack or equipment drawing */
export function Visual({ p }) {
  const s = SCHEMES[p.scheme] || SCHEMES.dark;
  return (
    <div className="pvis" style={{ '--tint': s.tint }}>
      {p.gear ? <Gear kind={p.gear} /> : <Pouch name={p.short} scheme={p.scheme} sub={`${p.sizes[0]}${p.origin ? ' · ' + p.origin.split(' ')[0] : ''}`} />}
    </div>
  );
}

/** Thumbnail for a cart line (catalogue product or custom blend) */
export function CartThumb({ item, byId }) {
  const p = byId(item.pid);
  if (p) return <Visual p={p} />;
  const sc = (item.custom && item.custom.scheme) || 'dark';
  return <div className="pvis" style={{ '--tint': SCHEMES[sc].tint }}><Pouch name={(item.custom && item.custom.label) || 'Custom Blend'} scheme={sc} sub={item.size} /></div>;
}

export function Stars({ rating }) {
  return <span className="stars" style={{ '--r': `${(rating / 5 * 100).toFixed(0)}%` }} aria-label={`${rating} out of 5`}>★★★★★</span>;
}

/** Stepper. Decreasing below 1 calls onChange(0): callers decide whether that means "remove" or "clamp". */
export function Qty({ value, onChange, big = false, max = 20 }) {
  return (
    <div className={'qty' + (big ? ' big' : '')}>
      <button type="button" aria-label="Decrease" onClick={() => onChange(value - 1)}>−</button>
      <span>{value}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}
