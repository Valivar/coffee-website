# coffee-website

A multi-page coffee shop built with **React 18 + Vite + React Router**: home, shop, product pages, cart, checkout,
order confirmation and tracking, about, blend builder, contact / distributor enquiry and policies.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

## Structure

```
src/
  main.jsx, App.jsx        entry + routes
  data/products.js         product catalogue
  context/                 CartContext (cart, coupons, totals), UIContext (drawer, quick view, toasts)
  lib/                     utils, hooks (scroll reveal, parallax, add-to-cart) and orders store
  components/              Header, Footer, CartDrawer, QuickView, ProductCard, BuyBox, Visual (SVG packs), Effects...
  pages/                   Home, Shop, Product, Cart, Checkout, OrderSuccess, TrackOrder, About, Blend, Contact, Policies
  styles/                  styles.css, pages.css
public/images/             photos (Unsplash)
```

## Notes

- This is a front-end demo: the cart, orders, reviews and messages are saved in the browser (`localStorage`) and no real payment is taken.
- Coupon codes to try: `CHAT10`, `WELCOME50`, `FREESHIP`.
- Deploying to a sub-path (e.g. GitHub Pages): set `base` in `vite.config.js` to `'/coffee-website/'` and add a `404.html` copy of `index.html` so deep links work.
- The original plain HTML/CSS/JS version is preserved in git history (commit `ced2ce4`).
