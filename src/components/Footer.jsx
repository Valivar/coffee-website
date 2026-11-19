import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <footer className="footer" id="contact-footer">
        <div className="foot-grid">
          <div>
            <Link className="logo" to="/">CHITCHAT<span>.</span></Link>
            <p className="tag">SPECIALTY COFFEE ROASTERS</p>
            <p>123 Estate Road, Coffee Town,<br />Karnataka 000000</p>
            <p>+91 00000 00000<br />hello@example.com</p>
          </div>
          <div><h4>QUICK LINKS</h4>
            <Link to="/shop">Shop</Link><Link to="/blend">Custom Blend</Link><Link to="/about">About</Link>
            <Link to="/contact#distributor">Become a Distributor</Link><Link to="/contact">Contact Us</Link></div>
          <div><h4>CUSTOMER CARE</h4>
            <Link to="/track-order">Track Order</Link><Link to="/policies#shipping">Shipping &amp; Delivery</Link><Link to="/policies#returns">Returns &amp; Refunds</Link></div>
        </div>
        <div className="foot-bottom">
          <p>© 2026 ChitChat Specialty Coffee Roasters. All rights reserved.</p>
          <p><Link to="/policies#privacy">Privacy Policy</Link> · <Link to="/policies#terms">Terms &amp; Conditions</Link></p>
        </div>
        <p className="photo-credit">Photos via Unsplash.</p>
      </footer>
      <a className="whatsapp" href="https://wa.me/910000000000" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2 1.3 2.3 1.4.3.1.5.1.6-.1l.9-1.1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2z" /></svg>
      </a>
    </>
  );
}
