import { Link } from 'react-router-dom';
import { useTitle } from '../lib/hooks.js';
import { Icon } from '../components/Visual.jsx';

export default function NotFound() {
  useTitle('Page not found | ChitChat Coffee');
  return (
    <main className="page">
      <div className="empty container" style={{ paddingTop: 120, paddingBottom: 120 }}>
        <div className="empty-ico"><Icon name="cup" size={90} /></div>
        <h4>404: this page went cold</h4>
        <p>We couldn't find what you were looking for.</p>
        <Link className="btn magnetic" to="/"><span>Back to home</span></Link>
      </div>
    </main>
  );
}
