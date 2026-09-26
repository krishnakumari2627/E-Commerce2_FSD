import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container text-center py-5">
          <div className="empty-state">
            <FiHeart className="empty-state-icon" style={{ fontSize: '4rem', color: 'var(--accent)' }} />
            <h2>Please sign in to view your wishlist</h2>
            <p>Save items you love and revisit them anytime.</p>
            <Link to="/login" className="btn btn-primary btn-lg mt-3">
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleMoveToCart = async (item) => {
    const success = await addToCart(item.product_id, 1);
    if (success) {
      removeFromWishlist(item.product_id);
    }
  };

  return (
    <div className="page-container wishlist-page">
      <div className="container">
        <div className="page-header-simple">
          <h1 className="page-title">My Wishlist</h1>
          <p className="page-subtitle">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist-view">
            <div className="empty-icon-box">❤️</div>
            <h2>Your Wishlist is Empty</h2>
            <p>Explore our trending catalog and tap the heart icon to save products you love.</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {wishlist.map((item) => (
              <div key={item.id || item.product_id} className="product-card wishlist-card">
                <div className="product-card-image-wrap">
                  <img
                    src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                    alt={item.product_name}
                    className="product-card-img"
                  />
                  <button
                    className="wishlist-remove-float"
                    title="Remove from wishlist"
                    onClick={() => removeFromWishlist(item.product_id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="product-card-body">
                  <div className="product-card-category">{item.category_name || 'Electronics'}</div>
                  <Link to={`/products/${item.product_id}`} className="product-card-title">
                    {item.product_name}
                  </Link>

                  <div className="product-card-price-row">
                    <div className="price-display">
                      <span className="current-price">{formatPrice(item.price)}</span>
                    </div>
                  </div>

                  <div className="wishlist-card-actions">
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <FiShoppingCart /> Move to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
