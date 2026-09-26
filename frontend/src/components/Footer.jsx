import { Link } from 'react-router-dom';
import { FiZap, FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="navbar__logo" style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.5rem', fontWeight: 800 }}>
              ⚡ SmartCart
            </div>
            <p className="footer__tagline">
              Discover. Shop. Track. Simplify. Your all-in-one smart shopping platform for the modern age.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              {[FiGithub, FiTwitter, FiLinkedin].map((Icon, i) => (
                <a key={i} href="#" className="navbar__icon-btn" style={{ textDecoration: 'none' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="footer__heading">Shop</div>
            <div className="footer__links">
              {['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Books', 'Beauty'].map(cat => (
                <Link key={cat} to={`/products?search=${cat}`} className="footer__link">{cat}</Link>
              ))}
            </div>
          </div>

          <div>
            <div className="footer__heading">Account</div>
            <div className="footer__links">
              {[
                { label: 'My Account', to: '/account' },
                { label: 'My Orders', to: '/orders' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'Cart', to: '/cart' },
                { label: 'Register', to: '/register' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="footer__link">{item.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <div className="footer__heading">Support</div>
            <div className="footer__links">
              <a href="mailto:support@smartcart.com" className="footer__link">
                <FiMail size={12} style={{ marginRight: '0.4rem' }} />
                support@smartcart.com
              </a>
              <a href="tel:+919999999999" className="footer__link">
                <FiPhone size={12} style={{ marginRight: '0.4rem' }} />
                +91 99999 99999
              </a>
              <span className="footer__link" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiMapPin size={12} />
                Hyderabad, India
              </span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2024 SmartCart. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Built with <FiZap size={12} style={{ color: 'var(--accent)' }} /> by SmartCart Team
          </span>
        </div>
      </div>
    </footer>
  );
}
