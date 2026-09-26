import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMapPin, FiCreditCard, FiCheckCircle, FiPlus, 
  FiShield, FiLock, FiTruck, FiDollarSign 
} from 'react-icons/fi';
import { addressService, orderService, paymentService } from '../services';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);

  // New address form
  const [newAddress, setNewAddress] = useState({
    full_name: user?.name || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: true,
  });

  // Card demo details
  const [cardData, setCardData] = useState({
    cardNumber: '4242 •••• •••• 4242',
    exp: '12/28',
    cvv: '123',
    cardHolder: user?.name || 'Alex Johnson',
  });

  const [upiId, setUpiId] = useState('alex@oksbi');

  useEffect(() => {
    addressService.getAddresses()
      .then((res) => {
        const addrList = res.data.data || [];
        setAddresses(addrList);
        if (addrList.length > 0) {
          const defaultAddr = addrList.find((a) => a.is_default) || addrList[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressModal(true);
        }
      })
      .catch(() => {});
  }, []);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + shipping + tax;

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address_line1 || !newAddress.city || !newAddress.postal_code) {
      toast.error('Please complete required address fields');
      return;
    }
    try {
      const res = await addressService.createAddress(newAddress);
      const created = res.data.data;
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressModal(false);
      toast.success('Address saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/products');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create order in backend
      const orderPayload = {
        shipping_address_id: selectedAddressId,
        payment_method: paymentMethod,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        tax_amount: tax,
        shipping_amount: shipping,
        discount_amount: 0,
        total_amount: totalAmount,
      };

      const orderRes = await orderService.createOrder(orderPayload);
      const createdOrder = orderRes.data.data;

      // 2. Process Demo Payment
      await paymentService.demoPayment({
        order_id: createdOrder.id,
        amount: totalAmount,
        payment_method: paymentMethod,
        status: 'success',
      });

      toast.success('🎉 Order placed and payment confirmed!');
      await fetchCart(); // Refresh cart state
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container checkout-page">
      <div className="container">
        <h1 className="page-title mb-4">Checkout</h1>

        <div className="checkout-layout-grid">
          {/* Main Checkout Form Columns */}
          <div className="checkout-main-flow">
            {/* Step 1: Shipping Address */}
            <section className="checkout-step-card">
              <div className="step-header">
                <div className="step-badge">1</div>
                <div>
                  <h3 className="step-title">Delivery Address</h3>
                  <p className="step-desc">Select where you want your order delivered</p>
                </div>
              </div>

              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-select-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr.id)}
                  >
                    <div className="addr-radio">
                      <input
                        type="radio"
                        name="address_select"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                    </div>
                    <div className="addr-content">
                      <div className="addr-name">
                        <strong>{addr.full_name}</strong>
                        {addr.is_default && <span className="badge badge-primary badge-sm ml-2">Default</span>}
                      </div>
                      <div className="addr-lines">
                        <p>{addr.address_line1}</p>
                        {addr.address_line2 && <p>{addr.address_line2}</p>}
                        <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                        <p>{addr.country}</p>
                      </div>
                      {addr.phone && <div className="addr-phone">📞 {addr.phone}</div>}
                    </div>
                  </div>
                ))}

                {/* Add New Address Card Button */}
                <button
                  type="button"
                  className="add-address-card-btn"
                  onClick={() => setShowNewAddressModal(true)}
                >
                  <FiPlus className="plus-icon" />
                  <span>Add New Delivery Address</span>
                </button>
              </div>

              {/* Add Address Inline Form Modal */}
              {showNewAddressModal && (
                <div className="new-address-form-box">
                  <h4>Enter New Shipping Address</h4>
                  <form onSubmit={handleCreateAddress}>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newAddress.full_name}
                          onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="+1 (555) 000-0000"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Street Address *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="123 Innovation Way, Apt 4B"
                        value={newAddress.address_line1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State / Province</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Postal Code *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newAddress.postal_code}
                          onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button type="submit" className="btn btn-primary">
                        Save & Select Address
                      </button>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setShowNewAddressModal(false)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </section>

            {/* Step 2: Payment Method */}
            <section className="checkout-step-card">
              <div className="step-header">
                <div className="step-badge">2</div>
                <div>
                  <h3 className="step-title">Payment Method</h3>
                  <p className="step-desc">Secure end-to-end encrypted demo payment gateway</p>
                </div>
              </div>

              <div className="payment-options-list">
                <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div className="payment-option-info">
                    <div className="payment-title">
                      <FiCreditCard /> Credit / Debit Card (Instant Demo)
                    </div>
                    <span className="payment-sub">Visa, MasterCard, Amex, Discover</span>
                  </div>
                </label>

                {paymentMethod === 'card' && (
                  <div className="payment-card-subform">
                    <div className="form-group">
                      <label>Card Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                      />
                    </div>
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Expiry (MM/YY)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardData.exp}
                          onChange={(e) => setCardData({ ...cardData, exp: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Security Code (CVV)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <label className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <div className="payment-option-info">
                    <div className="payment-title">
                      <FiDollarSign /> UPI / QR Payment (GPay, PhonePe, Paytm)
                    </div>
                    <span className="payment-sub">Instant instant approval simulation</span>
                  </div>
                </label>

                {paymentMethod === 'upi' && (
                  <div className="payment-card-subform">
                    <div className="form-group">
                      <label>UPI ID (VPA)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@bank"
                      />
                    </div>
                  </div>
                )}

                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment_method"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-option-info">
                    <div className="payment-title">
                      <FiTruck /> Cash on Delivery (COD)
                    </div>
                    <span className="payment-sub">Pay in cash when package arrives at your doorstep</span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Sidebar Order Summary */}
          <aside className="checkout-summary-sidebar">
            <div className="summary-card">
              <h3 className="summary-title">Order Details ({items.length} items)</h3>

              <div className="checkout-items-preview">
                {items.map((item) => (
                  <div key={item.id} className="checkout-item-compact">
                    <img
                      src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                      alt={item.product_name}
                      className="checkout-item-thumb"
                    />
                    <div className="checkout-item-meta">
                      <div className="checkout-item-name">{item.product_name}</div>
                      <div className="checkout-item-qty-price">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <div className="checkout-item-subtotal">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-rows mt-3">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="free-shipping">FREE</span> : formatPrice(shipping)}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total-row">
                  <span>Final Total</span>
                  <span className="total-val">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block btn-lg mt-4"
                disabled={submitting || items.length === 0}
                onClick={handlePlaceOrder}
              >
                <FiLock /> {submitting ? 'Processing Payment...' : `Pay ${formatPrice(totalAmount)} & Place Order`}
              </button>

              <div className="checkout-guarantee mt-3">
                <FiShield /> <span>256-bit Encrypted Secure Demo Gateway</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
