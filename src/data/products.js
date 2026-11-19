/* Product catalogue (pure data + helpers). Visuals live in components/Visual.jsx */
export const ROAST = { 1: 'Light', 2: 'City', 3: 'City+', 4: 'Full City', 5: 'French' };
export const SIZE_MULT = { '250g': 1, '500g': 1.9, '1kg': 3.6 };
export const GRINDS = ['Whole Bean', 'Espresso', 'Moka Pot', 'Filter / Drip', 'French Press', 'Cold Brew'];

export const CATS = [
  { id: 'specialty', label: 'Speciality Coffee', icon: 'sparkle' },
  { id: 'roasted', label: 'Roasted Coffee', icon: 'bean' },
  { id: 'filter', label: 'Filter Coffee', icon: 'dripper' },
  { id: 'pure', label: 'Pure Coffee', icon: 'cup' },
  { id: 'equipment', label: 'Brewing Equipments', icon: 'grinder' },
  { id: 'green', label: 'Green Coffee Beans', icon: 'beans' }
];

export const SCHEMES = {
  dark:   { bag: '#1f1813', label: '#ecdcb9', ink: '#2a1a10', accent: '#c68b4e', tint: '#efe6d6' },
  kraft:  { bag: '#b9824f', label: '#f6ecdc', ink: '#3b2314', accent: '#7a4a22', tint: '#f3e6d0' },
  cream:  { bag: '#f1ebe0', label: '#2f6b4a', ink: '#f6ecdc', accent: '#e3b26b', tint: '#e8efe6' },
  forest: { bag: '#2f5d46', label: '#f6ecdc', ink: '#1f3a2c', accent: '#c68b4e', tint: '#e3eadf' },
  terra:  { bag: '#a8502f', label: '#f6ecdc', ink: '#4a1f10', accent: '#7a2f16', tint: '#f2dccf' },
  plum:   { bag: '#43223c', label: '#e9d5b0', ink: '#2a1626', accent: '#c68b4e', tint: '#eadde8' },
  gold:   { bag: '#d9a24f', label: '#2a1a10', ink: '#f6ecdc', accent: '#e3b26b', tint: '#f6e9cd' }
};

export const LIFESTYLE = {
  filter: 'pourover.jpg', roasted: 'beans-bowl.jpg', specialty: 'latte-pour.jpg',
  pure: 'black-cup.jpg', equipment: 'boards.jpg', green: 'sack.jpg'
};

function mk(id, name, short, cat, type, roast, origin, notes, price, o = {}) {
  const coffee = cat !== 'equipment';
  return {
    id, name, short, cat, type, roast, origin, notes, price, mrp: 0,
    sizes: coffee ? ['250g', '500g', '1kg'] : ['Standard'],
    grind: ['roasted', 'specialty', 'pure'].includes(cat),
    badge: '', scheme: 'dark', rating: 4.6, reviews: 40, order: 0, ...o
  };
}

export const products = [
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
  mk('estate-premium', 'Estate Premium Specialty Arabica', 'Estate Premium', 'specialty', 'Arabica', 3, 'Samrudhi Estate', ['Jasmine', 'Peach', 'Black tea'], 399, { scheme: 'forest', rating: 4.8, reviews: 131, blurb: "Hand-picked, wet-processed and roasted to highlight the estate's floral side." }),
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
].map((p, i) => ({ ...p, order: i }));

export const byId = id => products.find(p => p.id === id);
export const priceFor = (p, size) => (p.sizes.length === 1 ? p.price : Math.round(p.price * (SIZE_MULT[size] || 1)));
export const catLabel = id => (CATS.find(c => c.id === id) || {}).label || '';
