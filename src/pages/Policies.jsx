import { Link } from 'react-router-dom';
import { useTitle } from '../lib/hooks.js';

export default function Policies() {
  useTitle('Policies | ChitChat Coffee');
  return (
    <main className="page">
      <div className="page-title"><h1>Policies</h1><p className="muted" style={{ marginTop: 8 }}>Placeholder policy text for this demo store: replace it with your own before launch.</p></div>
      <div className="policy">
        <section id="shipping"><h2>Shipping &amp; delivery</h2>
          <ul><li>Orders are roasted and packed within 24 hours of being placed.</li><li>Standard delivery: 3–5 business days. Free on orders over ₹599, otherwise ₹60.</li><li>Express delivery: 1–2 business days for ₹120.</li><li>You can follow every order from the <Link to="/track-order" style={{ textDecoration: 'underline' }}>Track Order</Link> page.</li></ul></section>
        <section id="returns"><h2>Returns &amp; refunds</h2>
          <ul><li>Unopened products can be returned within 7 days of delivery.</li><li>Damaged or incorrect items are replaced or refunded in full.</li><li>Opened coffee cannot be returned for hygiene reasons, but tell us if you're not happy and we'll make it right.</li><li>Refunds are issued to the original payment method within 5–7 business days.</li></ul></section>
        <section id="privacy"><h2>Privacy policy</h2>
          <p>We collect only the information needed to process your order and reply to your messages: your name, contact details and delivery address. We never sell your data.</p>
          <p>In this demo, your cart, orders and messages are stored only in your own browser and are never sent to a server.</p></section>
        <section id="terms"><h2>Terms &amp; conditions</h2>
          <p>By placing an order you agree to provide accurate information and to pay the listed price. Prices are in Indian rupees and include applicable taxes. We may cancel orders affected by pricing errors or stock shortages and will refund any payment made.</p></section>
      </div>
    </main>
  );
}
