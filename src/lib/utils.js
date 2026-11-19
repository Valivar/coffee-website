export const money = n => '₹' + Math.round(n).toLocaleString('en-IN');

/** Path to a file in /public/images that respects Vite's base URL */
export const img = name => `${import.meta.env.BASE_URL}images/${name}`;

export const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(hover: hover) and (pointer: fine)').matches;

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
};

// validators shared by checkout, contact and tracking
export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
export const normPhone = v => String(v).replace(/\s/g, '').replace(/^\+?91(?=\d{10}$)/, '');
export const isPhone = v => /^[6-9]\d{9}$/.test(normPhone(v));
export const isPin = v => /^[1-9]\d{5}$/.test(v);
export const luhn = n => { let s = 0, d = false; for (let i = n.length - 1; i >= 0; i--) { let x = +n[i]; if (d) { x *= 2; if (x > 9) x -= 9; } s += x; d = !d; } return s % 10 === 0; };

/** Fly a coffee bean from an element to the cart icon */
export function flyToCart(from) {
  const cart = document.getElementById('cartIcon');
  if (!cart || !from || reduceMotion()) return;
  const to = cart.getBoundingClientRect(), f = from.getBoundingClientRect();
  const bean = document.createElement('i'); bean.className = 'fly'; document.body.appendChild(bean);
  const sx = f.left + f.width / 2, sy = f.top + f.height / 2, dx = to.left + to.width / 2 - sx, dy = to.top + to.height / 2 - sy;
  bean.animate([
    { transform: `translate(${sx}px,${sy}px) scale(1.4) rotate(0)`, opacity: 1 },
    { transform: `translate(${sx + dx * .5}px,${sy - 120}px) scale(1) rotate(180deg)`, opacity: 1, offset: .5 },
    { transform: `translate(${sx + dx}px,${sy + dy}px) scale(.3) rotate(360deg)`, opacity: .6 }
  ], { duration: 800, easing: 'cubic-bezier(.5,0,.7,.4)' }).onfinish = () => bean.remove();
}
