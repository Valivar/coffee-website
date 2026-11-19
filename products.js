/* Product catalogue + visual helpers (packaging art is drawn as SVG, so no product photos are needed) */
window.DATA = (() => {
  const ROAST = { 1: 'Light', 2: 'City', 3: 'City+', 4: 'Full City', 5: 'French' };
  const SIZE_MULT = { '250g': 1, '500g': 1.9, '1kg': 3.6 };
  const GRINDS = ['Whole Bean', 'Espresso', 'Moka Pot', 'Filter / Drip', 'French Press', 'Cold Brew'];

  const ICONS = {
    sparkle: '<path d="M14 34c-4-5-3-13 5-17s15-2 17 3-1 13-9 17-10 3-13-3z"/><path d="M19 30c4-6 9-10 15-12"/><path d="M38 6v8M34 10h8M10 8v6M7 11h6"/>',
    bean: '<ellipse cx="24" cy="31" rx="9" ry="13" transform="rotate(20 24 31)"/><path d="M20 21c5 4 4 12 8 20"/><path d="M17 6c-3 3 3 5 0 9M26 6c-3 3 3 5 0 9"/>',
    dripper: '<path d="M10 12h28l-7 16H17z"/><path d="M20 28v4h8v-4"/><path d="M13 34h22v9H13z"/><path d="M8 12h32"/>',
    cup: '<path d="M9 21h25v8a9 9 0 0 1-9 9h-7a9 9 0 0 1-9-9z"/><path d="M34 23h3a4.500 4.500 0 0 1 0 9h-4"/><path d="M7 43h32"/><path d="M16 6c-3 3 3 5 0 9M24 6c-3 3 3 5 0 9"/>',
    grinder: '<path d="M13 17h22v11H13z"/><path d="M11 28h26v13H11z"/><path d="M24 17V9h11"/><path d="M35 6v6"/><circle cx="24" cy="35" r="2.500"/>',
    beans: '<ellipse cx="17" cy="27" rx="8.500" ry="12" transform="rotate(-25 17 27)"/><path d="M13 18c6 3 5 11 10 17"/><ellipse cx="32" cy="23" rx="8.500" ry="12" transform="rotate(25 32 23)"/><path d="M29 14c-2 6 4 8 0 16"/>'
  };
  const CATS = [
    { id: 'specialty', label: 'Speciality Coffee', icon: 'sparkle' },
    { id: 'roasted', label: 'Roasted Coffee', icon: 'bean' },
    { id: 'filter', label: 'Filter Coffee', icon: 'dripper' },
    { id: 'pure', label: 'Pure Coffee', icon: 'cup' },
    { id: 'equipment', label: 'Brewing Equipments', icon: 'grinder' },
    { id: 'green', label: 'Green Coffee Beans', icon: 'beans' }
  ];
  const icon = (k, size = 40) => `<svg width="${size}" height="${size}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

  const SCHEMES = {
    dark:  { bag: '#1f1813', label: '#ecdcb9', ink: '#2a1a10', accent: '#c68b4e', tint: '#efe6d6' },
    kraft: { bag: '#b9824f', label: '#f6ecdc', ink: '#3b2314', accent: '#7a4a22', tint: '#f3e6d0' },
    cream: { bag: '#f1ebe0', label: '#2f6b4a', ink: '#f6ecdc', accent: '#e3b26b', tint: '#e8efe6' },
    forest:{ bag: '#2f5d46', label: '#f6ecdc', ink: '#1f3a2c', accent: '#c68b4e', tint: '#e3eadf' },
    terra: { bag: '#a8502f', label: '#f6ecdc', ink: '#4a1f10', accent: '#7a2f16', tint: '#f2dccf' },
    plum:  { bag: '#43223c', label: '#e9d5b0', ink: '#2a1626', accent: '#c68b4e', tint: '#eadde8' },
    gold:  { bag: '#d9a24f', label: '#2a1a10', ink: '#f6ecdc', accent: '#e3b26b', tint: '#f6e9cd' }
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function wrap(text, max = 11, lines = 3) {
    const out = []; let cur = '';
    text.split(/\s+/).forEach(w => {
      if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
    });
    if (cur) out.push(cur);
    return out.slice(0, lines);
  }

  /** Coffee pouch illustration. o = { name, scheme, sub } */
  function pouch(o) {
    const s = SCHEMES[o.scheme] || SCHEMES.dark;
    const ls = wrap(o.name || 'Coffee');
    const y0 = 150;
    const text = ls.map((l, i) => `<text x="100" y="${y0 + i * 16}" text-anchor="middle" font-family="Playfair Display,Georgia,serif" font-weight="700" font-size="14.500" fill="${s.ink}">${esc(l)}</text>`).join('');
    return `<svg class="pouch" viewBox="0 0 200 280" role="img" aria-label="${esc(o.name)} pack">
<ellipse cx="100" cy="268" rx="64" ry="7" fill="rgba(0,0,0,.2)"/>
<path d="M32 30H168L178 250C130 262 70 262 22 250Z" fill="${s.bag}"/>
<path d="M168 30L178 250C172 252 166 253 160 254Z" fill="#000" opacity=".14"/>
<path d="M32 30L22 250C28 252 34 253 40 254Z" fill="#fff" opacity=".10"/>
<rect x="32" y="30" width="136" height="22" fill="#000" opacity=".16"/>
<path d="M38 41H162" stroke="#fff" stroke-opacity=".4" stroke-dasharray="3 3"/>
<rect x="46" y="94" width="108" height="130" rx="10" fill="${s.label}"/>
<g transform="translate(100 120) rotate(25)"><ellipse rx="10" ry="14" fill="${s.accent}"/><path d="M-2 -11C6 -4 -6 4 2 11" stroke="${s.label}" stroke-width="2" fill="none"/></g>
${text}
<text x="100" y="206" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="7.500" letter-spacing="1.100" fill="${s.ink}" opacity=".75">${esc((o.sub || '').toUpperCase())}</text>
</svg>`;
  }

  /** Simple equipment illustrations */
  function gear(kind) {
    const st = 'stroke="#3b2314" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
    const art = {
      dripper: `<path d="M44 66h112l-30 84H74z" fill="#e3b26b" ${st}/><rect x="84" y="150" width="32" height="14" fill="#3b2314"/><path d="M62 170h76l-6 64c-1 9-8 14-17 14H85c-9 0-16-5-17-14z" fill="#f6ecdc" ${st}/><path d="M70 205h60" stroke="#6b4228" stroke-width="14" stroke-linecap="round"/>`,
      grinder: `<path d="M66 100h68l8 28H58z" fill="#e3b26b" ${st}/><rect x="58" y="128" width="84" height="94" rx="8" fill="#6b4228" ${st}/><rect x="72" y="196" width="56" height="26" rx="4" fill="#f6ecdc" ${st}/><path d="M100 100V62h56" fill="none" ${st}/><circle cx="160" cy="62" r="9" fill="#e3b26b" ${st}/><circle cx="100" cy="160" r="9" fill="#e3b26b" ${st}/>`,
      kettle: `<path d="M56 112c0-14 10-22 44-22s44 8 44 22l8 100c0 14-14 24-52 24s-52-10-52-24z" fill="#6b4228" ${st}/><path d="M146 120c26-4 38-34 22-60l-6-10" fill="none" ${st}/><path d="M56 136c-26 2-38 30-24 52" fill="none" ${st}/><rect x="88" y="76" width="24" height="14" rx="5" fill="#e3b26b" ${st}/><path d="M72 150h56" stroke="#e3b26b" stroke-width="6" stroke-linecap="round"/>`,
      press: `<rect x="62" y="96" width="76" height="140" rx="8" fill="#f6ecdc" ${st}/><path d="M62 170h76v58c0 6-3 8-8 8H70c-5 0-8-2-8-8z" fill="#6b4228"/><rect x="62" y="96" width="76" height="140" rx="8" fill="none" ${st}/><path d="M100 96V52" fill="none" ${st}/><circle cx="100" cy="48" r="11" fill="#e3b26b" ${st}/><path d="M138 120c24 0 24 44 0 44" fill="none" ${st}/>`
    }[kind] || '';
    return `<svg class="pouch" viewBox="0 0 200 280" role="img" aria-label="${kind}"><ellipse cx="100" cy="262" rx="62" ry="7" fill="rgba(0,0,0,.15)"/>${art}</svg>`;
  }

  const LIFESTYLE = {
    filter: 'images/pourover.jpg', roasted: 'images/beans-bowl.jpg', specialty: 'images/latte-pour.jpg',
    pure: 'images/black-cup.jpg', equipment: 'images/boards.jpg', green: 'images/sack.jpg'
  };

  function mk(id, name, short, cat, type, roast, origin, notes, price, o = {}) {
    const coffee = cat !== 'equipment';
    return Object.assign({
      id, name, short, cat, type, roast, origin, notes, price, mrp: 0,
      sizes: coffee ? ['250g', '500g', '1kg'] : ['Standard'],
      grind: ['roasted', 'specialty', 'pure'].includes(cat),
      badge: '', scheme: 'dark', rating: 4.6, reviews: 40, order: 0
    }, o);
  }

  const products = [
    mk('deal-wali-combo', 'Deal-wali Filter Coffee Combo | 3 Packs | 650g', 'Deal-wali Combo', 'filter', 'Blend', 3, 'Coorg', ['Chicory', 'Chocolate', 'Bold'], 549, { mrp: 620, sizes: ['650g'], badge: 'ON SALE', scheme: 'gold', rating: 4.8, reviews: 212, blurb: 'Three of our best-loved filter blends in one money-saving bundle: ideal for stocking the kitchen.' }),
    mk('medium-strong-filter', 'Medium Strong Filter Coffee | Coffee 70% Chicory 30%', 'Medium Strong Filter', 'filter', 'Blend', 3, 'Coorg', ['Caramel', 'Roasted nuts', 'Thick body'], 236, { scheme: 'kraft', rating: 4.7, reviews: 164, blurb: 'A balanced South-Indian style decoction with a pleasant chicory edge and a long, mellow finish.' }),
    mk('classic-filter', 'Classic Filter Coffee | Coffee 80% Chicory 20%', 'Classic Filter', 'filter', 'Blend', 4, 'Coorg', ['Dark chocolate', 'Smooth', 'Classic'], 199, { badge: 'BEST SELLER', scheme: 'dark', rating: 4.9, reviews: 540, blurb: 'The everyday favourite. Fuller roast, silky mouthfeel and a gentle bittersweet finish.' }),
    mk('sunrise-filter', 'Sunrise Filter Coffee | Coffee 90% Chicory 10%', 'Sunrise Filter', 'filter', 'Blend', 2, 'Coorg', ['Floral', 'Light body', 'Bright'], 219, { scheme: 'cream', rating: 4.5, reviews: 77, blurb: 'Light roast, mostly coffee. A gentle morning cup with floral lift.' }),
    mk('strong-decoction', 'Strong Decoction Blend | Coffee 60% Chicory 40%', 'Strong Decoction', 'filter', 'Blend', 4, 'Coorg', ['Thick', 'Bitter-sweet', 'Bold'], 189, { scheme: 'plum', rating: 4.4, reviews: 93, blurb: 'For those who want their decoction dark, thick and unapologetically strong.' }),
    mk('directors-blend', "Director's Blend Roasted Coffee Beans | Single Estate Beans", "Director's Blend", 'roasted', 'Arabica', 3, 'Coorg', ['Cocoa', 'Orange peel', 'Caramel'], 372, { scheme: 'dark', rating: 4.8, reviews: 188, blurb: 'Our house single-estate roast: balanced, chocolatey and endlessly drinkable.' }),
    mk('elite-blend', 'Elite Blend Roasted Beans | Arabica + Robusta', 'Elite Blend', 'roasted', 'Blend', 3, 'Coorg', ['Hazelnut', 'Toffee', 'Crema'], 429, { scheme: 'cream', badge: 'NEW', rating: 4.7, reviews: 61, blurb: 'Arabica sweetness meets Robusta punch, tuned for espresso and moka alike.' }),
    mk('french-roast', 'French Roast Dark Beans | Robusta', 'French Roast', 'roasted', 'Robusta', 5, 'Coorg', ['Smoky', 'Bittersweet', 'Heavy body'], 359, { scheme: 'plum', rating: 4.3, reviews: 52, blurb: 'Roasted deep for a smoky, syrupy cup that cuts through milk.' }),
    mk('estate-medium', 'Estate Medium Roast Beans | Arabica', 'Estate Medium', 'roasted', 'Arabica', 3, 'Samrudhi Estate', ['Red apple', 'Honey', 'Almond'], 389, { scheme: 'terra', rating: 4.6, reviews: 74, blurb: 'A clean, sweet medium roast straight from our own estate lots.' }),
    mk('honey-processed', 'Honey Processed Specialty Arabica', 'Honey Processed', 'specialty', 'Arabica', 2, 'Samrudhi Estate', ['Honey', 'Stone fruit', 'Brown sugar'], 449, { scheme: 'gold', badge: 'NEW', rating: 4.9, reviews: 96, blurb: 'Dried with the fruit mucilage intact for a syrupy sweetness and a juicy finish.' }),
    mk('estate-premium', 'Estate Premium Specialty Arabica', 'Estate Premium', 'specialty', 'Arabica', 3, 'Samrudhi Estate', ['Jasmine', 'Peach', 'Black tea'], 399, { scheme: 'forest', rating: 4.8, reviews: 131, blurb: 'Hand-picked, wet-processed and roasted to highlight the estate\'s floral side.' }),
    mk('estate-peaberry', 'Estate Peaberry Specialty | Limited Lot', 'Peaberry', 'specialty', 'Arabica', 3, 'Samrudhi Estate', ['Berry', 'Sweet citrus', 'Silky'], 479, { scheme: 'kraft', badge: 'LIMITED', rating: 4.9, reviews: 38, blurb: 'Rare single-seed cherries, sorted by hand for an extra-concentrated cup.' }),
    mk('monsoon-malabar', 'Monsoon Malabar | Low Acidity', 'Monsoon Malabar', 'specialty', 'Arabica', 4, 'Coorg', ['Earthy', 'Spice', 'Low acidity'], 419, { scheme: 'terra', rating: 4.5, reviews: 58, blurb: 'Beans aged in monsoon winds for a mellow, heavy-bodied and spicy profile.' }),
    mk('cold-brew-bags', 'Cold Brew Coffee Bags | 10 Bags', 'Cold Brew Bags', 'specialty', 'Arabica', 2, 'Coorg', ['Smooth', 'Chocolate', 'Naturally sweet'], 349, { sizes: ['10 bags'], grind: false, scheme: 'forest', rating: 4.6, reviews: 84, blurb: 'Just add water and wait. Ten steeping bags for smooth, low-acid cold brew.' }),
    mk('pure-arabica', 'Pure Arabica Ground Coffee', 'Pure Arabica', 'pure', 'Arabica', 3, 'Coorg', ['Aromatic', 'Sweet', 'Clean'], 389, { scheme: 'cream', rating: 4.7, reviews: 112, blurb: '100% Arabica with no chicory. Aromatic, smooth and naturally sweet.' }),
    mk('pure-robusta', 'Pure Robusta Ground Coffee', 'Pure Robusta', 'pure', 'Robusta', 4, 'Coorg', ['Nutty', 'Strong', 'Thick crema'], 329, { scheme: 'dark', rating: 4.4, reviews: 67, blurb: '100% Robusta for a strong cup with a generous crema. Great with milk.' }),
    mk('pure-instant', 'Pure Instant Coffee Powder | Arabica', 'Pure Instant', 'pure', 'Arabica', 3, 'Coorg', ['Smooth', 'Quick', 'Rich'], 299, { sizes: ['100g'], grind: false, scheme: 'kraft', rating: 4.2, reviews: 45, blurb: 'Freshly brewed, then freeze-dried: real coffee flavour in seconds.' }),
    mk('pourover-dripper', 'Ceramic Pour-over Dripper | Size 02', 'Pour-over Dripper', 'equipment', 'Gear', 0, '', ['Ceramic', 'Size 02', 'Fits 1–4 cups'], 1299, { gear: 'dripper', rating: 4.8, reviews: 49, blurb: 'Heat-retaining ceramic cone that gives even extraction every pour.' }),
    mk('hand-grinder', 'Manual Burr Hand Grinder', 'Hand Grinder', 'equipment', 'Gear', 0, '', ['Steel burrs', '25 g capacity', 'Adjustable'], 2499, { gear: 'grinder', rating: 4.7, reviews: 33, badge: 'BEST SELLER', blurb: 'Consistent, adjustable grind from espresso to French press: no electricity needed.' }),
    mk('gooseneck-kettle', 'Gooseneck Pouring Kettle | 600 ml', 'Gooseneck Kettle', 'equipment', 'Gear', 0, '', ['Stainless steel', '600 ml', 'Precise pour'], 1899, { gear: 'kettle', rating: 4.6, reviews: 27, blurb: 'A slender spout gives you total control over flow rate and pour pattern.' }),
    mk('french-press', 'Glass French Press | 350 ml', 'French Press', 'equipment', 'Gear', 0, '', ['Borosilicate glass', '350 ml', 'Steel mesh'], 999, { gear: 'press', rating: 4.5, reviews: 41, mrp: 1199, badge: 'ON SALE', blurb: 'Full-immersion brewing for a rich, full-bodied cup in four minutes.' }),
    mk('green-arabica', 'Green Coffee Beans | Arabica', 'Green Arabica', 'green', 'Arabica', 0, 'Samrudhi Estate', ['Unroasted', 'Grassy', 'Sweet'], 299, { scheme: 'forest', rating: 4.5, reviews: 29, blurb: 'Raw, graded Arabica beans for home roasters.' }),
    mk('green-robusta', 'Green Coffee Beans | Robusta', 'Green Robusta', 'green', 'Robusta', 0, 'Coorg', ['Unroasted', 'Woody', 'Earthy'], 259, { scheme: 'forest', rating: 4.3, reviews: 21, blurb: 'Raw, graded Robusta beans for home roasters.' }),
    mk('green-peaberry', 'Green Coffee Beans | Peaberry', 'Green Peaberry', 'green', 'Arabica', 0, 'Samrudhi Estate', ['Unroasted', 'Fruity', 'Dense'], 349, { scheme: 'forest', rating: 4.7, reviews: 17, blurb: 'Dense, uniform peaberry beans that roast evenly.' })
  ].map((p, i) => (p.order = i, p));

  const byId = id => products.find(p => p.id === id);
  const priceFor = (p, size) => p.sizes.length === 1 ? p.price : Math.round(p.price * (SIZE_MULT[size] || 1));
  const catLabel = id => (CATS.find(c => c.id === id) || {}).label || '';

  /** Visual for a product: drawn pouch or equipment illustration, inside a tinted box */
  function visual(p) {
    const s = SCHEMES[p.scheme] || SCHEMES.dark;
    const inner = p.gear ? gear(p.gear) : pouch({ name: p.short, scheme: p.scheme, sub: `${p.sizes[0]}${p.origin ? ' · ' + p.origin.split(' ')[0] : ''}` });
    return `<div class="pvis" style="--tint:${s.tint}">${inner}</div>`;
  }

  return { products, byId, priceFor, catLabel, CATS, ROAST, SIZE_MULT, GRINDS, SCHEMES, LIFESTYLE, icon, pouch, gear, visual };
})();
