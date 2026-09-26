import { Link } from 'react-router-dom';
import { FiArrowRight, FiCompass, FiShield, FiTruck, FiRefreshCw, FiZap, FiAward } from 'react-icons/fi';
import ThreeBackground from './ThreeBackground';

/**
 * Hero Component
 * Apple/Stripe-Inspired Open Cinematic 3D Hero
 * Showcases the hypnotic 3D liquid chrome wave & morphing sculpture
 * across the entire viewport with crystal-clear typographic hierarchy.
 */
export default function Hero() {
  return (
    <section className="hero-section hero-cinematic" id="hero">
      {/* 1. Full-Viewport 3D Liquid Chrome & Silk Background */}
      <ThreeBackground />

      {/* 2. Soft Radial Vignette for AAA Readability */}
      <div className="hero-scrim hero-scrim-cinematic" />

      {/* 3. Centered Cinematic Hero Content */}
      <div className="container hero-container hero-container-centered">
        <div className="hero-center-col">
          {/* Top Pill Badge */}
          <div className="hero-badge">
            <span className="hero-badge-pulse" />
            <FiZap size={14} className="hero-badge-icon" />
            <span>Next-Gen Smart Shopping Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title hero-title-cinematic">
            Shop Smarter.<br />
            <span className="text-gradient">Live Better.</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle hero-subtitle-cinematic">
            Discover products you love with a smarter, faster and more personalized shopping experience.
          </p>

          {/* Action CTAs */}
          <div className="hero-actions hero-actions-centered">
            <Link to="/products" className="btn btn-primary btn-lg hero-cta-btn" id="hero-shop-btn">
              Shop Now <FiArrowRight size={18} />
            </Link>
            <Link to="/products" className="btn btn-secondary btn-lg hero-secondary-btn" id="hero-explore-btn">
              <FiCompass size={18} /> Explore Products
            </Link>
          </div>

          {/* Floating Glassmorphic Feature Pills */}
          <div className="hero-feature-pills">
            <div className="hero-glass-pill">
              <FiTruck size={14} className="text-primary-light" />
              <span>Free Delivery Above ₹499</span>
            </div>
            <div className="hero-glass-pill">
              <FiShield size={14} className="text-success" />
              <span>SSL Secure Checkout</span>
            </div>
            <div className="hero-glass-pill">
              <FiRefreshCw size={14} className="text-accent" />
              <span>30-Day Easy Returns</span>
            </div>
            <div className="hero-glass-pill">
              <FiAward size={14} className="text-pink" />
              <span>100% Verified Sellers</span>
            </div>
          </div>

          {/* Trust Metrics Row */}
          <div className="hero-stats-row hero-stats-centered">
            <div className="hero-stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Verified Products</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <div className="stat-number">15K+</div>
              <div className="stat-label">Active Customers</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <div className="stat-number">99.8%</div>
              <div className="stat-label">On-Time Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
