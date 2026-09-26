import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const StarRating = ({ rating, count }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
  return (
    <div className="product-card__rating">
      <div className="product-card__stars">
        {stars.map((filled, i) => (
          <FiStar key={i} style={{ fill: filled ? '#fbbf24' : 'none', color: filled ? '#fbbf24' : '#4b5563' }} size={12} />
        ))}
      </div>
      <span className="product-card__review-count">({count})</span>
    </div>
  );
};

export default function ProductCard({ product }) {
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !isCustomer) {
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || !isCustomer) {
      navigate('/login');
      return;
    }
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      {/* Overlay badges */}
      <div className="product-card__overlay">
        {product.discount_percentage > 0 && (
          <span className="product-card__discount">{product.discount_percentage}% OFF</span>
        )}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Low Stock</span>
        )}
        {!product.in_stock && (
          <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Out of Stock</span>
        )}
      </div>

      {/* Product image */}
      <img
        src={product.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400'}
        alt={product.name}
        className="product-card__image"
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400'; }}
        loading="lazy"
      />

      {/* Body */}
      <div className="product-card__body">
        <div className="product-card__brand">{product.brand}</div>
        <div className="product-card__name">{product.name}</div>
        <div className="product-card__price">
          <span className="product-card__price-current">{formatPrice(product.effective_price)}</span>
          {product.discount_price && (
            <span className="product-card__price-original">{formatPrice(product.price)}</span>
          )}
        </div>
        <StarRating rating={product.average_rating} count={product.review_count} />
      </div>

      {/* Footer actions */}
      <div className="product-card__footer">
        <button
          className={`btn btn-primary btn-sm`}
          style={{ flex: 1 }}
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          id={`add-to-cart-${product.id}`}
        >
          <FiShoppingCart size={14} />
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button
          className={`product-card__wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          id={`wishlist-${product.id}`}
        >
          <FiHeart size={16} style={{ fill: inWishlist ? 'currentColor' : 'none' }} />
        </button>
      </div>
    </div>
  );
}
