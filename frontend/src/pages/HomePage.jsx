import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { categoryService, recommendationService } from '../services';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: FiTruck, title: 'Free Delivery', text: 'On orders above ₹499', color: '#10b981' },
  { icon: FiShield, title: 'Secure Payment', text: 'SSL encrypted checkout', color: '#6366f1' },
  { icon: FiRefreshCw, title: 'Easy Returns', text: '30-day return policy', color: '#f59e0b' },
  { icon: FiStar, title: 'Top Quality', text: 'Verified sellers only', color: '#ec4899' },
];

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'SmartCart – Discover. Shop. Track. Simplify.';
    const fetchData = async () => {
      try {
        const [catRes, featuredRes, trendingRes] = await Promise.all([
          categoryService.getCategories(),
          recommendationService.getFeatured(),
          recommendationService.getTrending(),
        ]);
        setCategories(catRes.data.data || []);
        setFeatured(featuredRes.data.data || []);
        setTrending(trendingRes.data.data || []);

        if (isAuthenticated && isCustomer) {
          try {
            const recRes = await recommendationService.getRecommendations();
            setRecommended(recRes.data.data?.recommendations || []);
          } catch { /* no recs */ }
        }
      } catch (err) {
        console.error('Home fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, isCustomer]);

  return (
    <div className="page-wrapper">
      {/* 1. 3D Hero Section */}
      <Hero />

      {/* 2. Featured Products */}
      {featured.length > 0 && (
        <section className="section" style={{ paddingTop: '3rem' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">🔥 Featured Products & Hot Deals</h2>
                <p className="section-subtitle">Hand-picked premium selections with special limited-time pricing</p>
              </div>
              <Link to="/products?sort_by=newest" className="btn btn-secondary btn-sm" id="see-all-deals-btn">
                See All Deals
              </Link>
            </div>
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : (
              <div className="product-grid">
                {featured.slice(0, 4).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Categories */}
      {categories.length > 0 && (
        <section className="section" style={{ paddingTop: featured.length > 0 ? 0 : '3rem' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">Shop by Category</h2>
                <p className="section-subtitle">Explore our curated range of tech, fashion, lifestyle and essentials</p>
              </div>
              <Link to="/products" className="btn btn-secondary btn-sm" id="view-all-categories-btn">
                View All Categories
              </Link>
            </div>
            <div className="category-grid">
              {categories.slice(0, 8).map(cat => (
                <div
                  key={cat.id}
                  className="category-card"
                  onClick={() => navigate(`/products?category_id=${cat.id}`)}
                  id={`category-${cat.id}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/products?category_id=${cat.id}`)}
                >
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200'}
                    alt={cat.name}
                    className="category-card__image"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200'; }}
                  />
                  <div className="category-card__name">{cat.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Features / Benefits */}
      <section className="features-highlight-bar" style={{ backgroundColor: 'var(--bg-secondary)', padding: '2.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.75rem' }}>
            {FEATURES.map(({ icon: Icon, title, text, color }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${color}18`,
                  border: `1px solid ${color}35`,
                  display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
                }}>
                  <Icon size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call To Action (Promo Banner) */}
      <section style={{ padding: '4rem 0 3rem' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(236,72,153,0.18) 50%, rgba(245,158,11,0.12) 100%)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: 24, padding: '3.5rem 2.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '2rem',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 50%, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
              <div className="badge badge-primary" style={{ marginBottom: '0.85rem' }}>Special Welcome Offer</div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2 }}>
                Get <span className="text-gradient">20% OFF</span> Your First Order
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                Join thousands of happy shoppers today. Sign up and apply code <strong style={{ color: '#fff' }}>SMART20</strong> at checkout for instant savings.
              </p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg" id="promo-register-btn" style={{ zIndex: 1 }}>
              Claim Offer Now <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Trending Now */}
      {trending.length > 0 && (
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">📈 Trending Now</h2>
                <p className="section-subtitle">Most popular products shoppers are buying this week</p>
              </div>
              <Link to="/products?sort_by=popular" className="btn btn-secondary btn-sm" id="view-trending-btn">
                View More
              </Link>
            </div>
            <div className="product-grid">
              {trending.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Personalized Recommendations */}
      {recommended.length > 0 && (
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title">✨ Recommended For You</h2>
                <p className="section-subtitle">Personalized picks based on your activity</p>
              </div>
            </div>
            <div className="product-grid">
              {recommended.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
