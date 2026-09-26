import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, FiHeart, FiStar, FiTruck, FiShield, 
  FiRefreshCw, FiCheck, FiShare2, FiArrowLeft, FiSend 
} from 'react-icons/fi';
import { productService, reviewService, recommendationService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInWishlist, addToWishlist, removeFromWishlist } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Review form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setQuantity(1);

    Promise.all([
      productService.getProduct(id),
      productService.getProductReviews(id).catch(() => ({ data: { data: [] } })),
      recommendationService.getRecommendations().catch(() => ({ data: { data: [] } }))
    ])
      .then(([prodRes, revRes, recRes]) => {
        setProduct(prodRes.data.data);
        setReviews(revRes.data.data || []);
        setRelatedProducts(recRes.data.data || []);
      })
      .catch((err) => {
        toast.error('Product not found');
        navigate('/products');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Loading product details...</span>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.primary_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to post a review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please provide a review comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        product_id: product.id,
        rating,
        title,
        comment,
      });
      toast.success('Review submitted successfully!');
      setTitle('');
      setComment('');
      // Refresh reviews
      const res = await productService.getProductReviews(product.id);
      setReviews(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="page-container product-detail-page">
      <div className="container">
        {/* Back link */}
        <div className="breadcrumbs">
          <Link to="/products" className="breadcrumb-back">
            <FiArrowLeft /> Back to Products
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-category">{product.category_name || 'Electronics'}</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Product Main Section */}
        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="main-image-wrapper">
              <img
                src={images[selectedImage]?.image_url || images[selectedImage]}
                alt={product.name}
                className="main-image"
              />
              {product.discount_percentage > 0 && (
                <span className="badge badge-discount">
                  -{product.discount_percentage}% OFF
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumbnail-btn ${selectedImage === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img src={img?.image_url || img} alt={`View ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="product-info-panel">
            <div className="product-brand-category">
              <span className="brand-tag">{product.brand || 'SmartCart Certified'}</span>
              <span className="sku-tag">SKU: {product.sku || 'SC-' + product.id}</span>
            </div>

            <h1 className="product-detail-title">{product.name}</h1>

            {/* Rating summary */}
            <div className="product-rating-row">
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`star-icon ${i < Math.round(product.rating || 5) ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <span className="rating-number">{Number(product.rating || 5).toFixed(1)}</span>
              <span className="rating-count">({product.reviews_count || reviews.length} customer reviews)</span>
            </div>

            {/* Price Box */}
            <div className="price-box">
              <div className="current-price">{formatPrice(product.price)}</div>
              {product.compare_at_price > product.price && (
                <div className="compare-price">{formatPrice(product.compare_at_price)}</div>
              )}
              {product.discount_percentage > 0 && (
                <span className="save-amount">
                  Save {formatPrice(product.compare_at_price - product.price)}
                </span>
              )}
            </div>

            {/* Availability */}
            <div className="stock-status">
              {product.stock_quantity > 0 ? (
                <span className="in-stock">
                  <FiCheck /> In Stock ({product.stock_quantity} available)
                </span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            <p className="product-summary">{product.short_description || product.description}</p>

            {/* Quantity & Action Buttons */}
            {product.stock_quantity > 0 && (
              <div className="purchase-controls">
                <div className="quantity-selector">
                  <label htmlFor="qty">Qty:</label>
                  <div className="quantity-buttons">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock_quantity}
                      onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="action-buttons-group">
                  <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button className="btn btn-accent btn-lg" onClick={handleBuyNow}>
                    Buy Now
                  </button>
                  <button
                    className={`btn btn-icon-lg ${inWishlist ? 'active-wishlist' : 'btn-outline'}`}
                    onClick={handleWishlistToggle}
                    title="Add to Wishlist"
                  >
                    <FiHeart className={inWishlist ? 'filled' : ''} />
                  </button>
                </div>
              </div>
            )}

            {/* Features / Trust Badges */}
            <div className="trust-features-grid">
              <div className="trust-item">
                <FiTruck className="trust-icon" />
                <div>
                  <h4>Free Delivery</h4>
                  <p>Orders over $50</p>
                </div>
              </div>
              <div className="trust-item">
                <FiShield className="trust-icon" />
                <div>
                  <h4>1 Year Warranty</h4>
                  <p>100% Guaranteed</p>
                </div>
              </div>
              <div className="trust-item">
                <FiRefreshCw className="trust-icon" />
                <div>
                  <h4>30-Day Returns</h4>
                  <p>Hassle-free refunds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description, Specs, Reviews */}
        <div className="product-tabs-section">
          <div className="tab-headers">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description & Details
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-pane-description">
                <h3>Product Overview</h3>
                <p>{product.description}</p>
                
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="specs-table-wrapper">
                    <h3>Technical Specifications</h3>
                    <table className="specs-table">
                      <tbody>
                        {Object.entries(product.specifications).map(([key, val]) => (
                          <tr key={key}>
                            <td className="spec-name">{key}</td>
                            <td className="spec-val">{String(val)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane-reviews">
                {/* Write Review Form */}
                <div className="write-review-card">
                  <h3>Leave a Customer Review</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-group">
                      <label>Rating</label>
                      <div className="rating-select-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`star-select-btn ${star <= rating ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Review Headline</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Great quality and fast shipping!"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Your Review</label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Tell others about your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingReview}
                    >
                      <FiSend /> {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </div>

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <div className="no-reviews">
                      <p>No reviews yet for this product. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div key={rev.id} className="review-item-card">
                        <div className="review-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {rev.user_name ? rev.user_name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="reviewer-name">{rev.user_name || 'Verified Buyer'}</div>
                              <div className="review-date">
                                {new Date(rev.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="review-rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`star-icon ${i < rev.rating ? 'filled' : ''}`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.title && <h4 className="review-title">{rev.title}</h4>}
                        <p className="review-comment">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Recommendations */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <h2 className="section-title">Customers Also Viewed</h2>
            <div className="products-grid">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
