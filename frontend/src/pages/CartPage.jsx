import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowRight, FiShoppingBag, FiShield, FiTag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartLoading, updateCartItem, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container text-center py-5">
          <div className="empty-state">
            <FiShoppingBag className="empty-state-icon" style={{ fontSize: '4rem', color: 'var(--primary)' }} />
            <h2>Please sign in to view your cart</h2>
            <p>Access your saved items and proceed seamlessly to checkout.</p>
            <Link to="/login" className="btn btn-primary btn-lg mt-3">
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'SAVE10' || couponCode.toUpperCase() === 'SMART10') {
      setDiscountPercent(10);
      toast.success('10% discount applied!');
    } else if (couponCode.toUpperCase() === 'FESTIVE20') {
      setDiscountPercent(20);
      toast.success('20% special festive discount applied!');
    } else {
      toast.error('Invalid coupon code. Try "SAVE10" or "FESTIVE20"');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax
  const finalTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

  if (cartLoading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Updating cart...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="empty-cart-view">
            <div className="empty-icon-box">🛒</div>
            <h2>Your Shopping Cart is Empty</h2>
            <p>Looks like you haven't added any products to your cart yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg">
              Start Shopping Now <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <div className="container">
        <div className="cart-page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <button className="btn btn-outline-danger btn-sm" onClick={clearCart}>
            <FiTrash2 /> Clear Entire Cart
          </button>
        </div>

        <div className="cart-layout-grid">
          {/* Items List */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Total</span>
              <span>Action</span>
            </div>

            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-info">
                    <img
                      src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                      alt={item.product_name}
                      className="cart-item-img"
                    />
                    <div className="cart-item-details">
                      <Link to={`/products/${item.product_id}`} className="cart-item-title">
                        {item.product_name}
                      </Link>
                      <div className="cart-item-unit-price">{formatPrice(item.price)} each</div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="cart-item-qty">
                    <button
                      type="button"
                      className="qty-btn"
                      disabled={item.quantity <= 1}
                      onClick={() => updateCartItem(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-val">{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Row Total */}
                  <div className="cart-item-total">
                    {formatPrice(item.price * item.quantity)}
                  </div>

                  {/* Remove Button */}
                  <div className="cart-item-remove">
                    <button
                      className="remove-btn"
                      title="Remove Item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer-actions">
              <Link to="/products" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="cart-summary-sidebar">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>

              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <div className="coupon-input-group">
                  <FiTag className="coupon-icon" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. SAVE10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="form-input"
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    Apply
                  </button>
                </div>
              </form>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Estimated Shipping</span>
                  <span>{shipping === 0 ? <span className="free-shipping">FREE</span> : formatPrice(shipping)}</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <div className="summary-divider" />

                <div className="summary-row total-row">
                  <span>Total</span>
                  <span className="total-val">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="shipping-hint">
                  💡 Add {formatPrice(50 - subtotal)} more to qualify for <strong>FREE shipping</strong>!
                </p>
              )}

              <button
                className="btn btn-primary btn-block btn-lg checkout-cta"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <FiArrowRight />
              </button>

              <div className="checkout-guarantee">
                <FiShield /> <span>Secure 256-Bit SSL Checkout Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
