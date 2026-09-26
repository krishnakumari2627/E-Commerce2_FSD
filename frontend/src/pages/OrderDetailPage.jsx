import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiCheck, FiTruck, FiPackage, FiClock, 
  FiMapPin, FiCreditCard, FiPrinter, FiAlertCircle 
} from 'react-icons/fi';
import { orderService } from '../services';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

const ORDER_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch((err) => {
        toast.error('Order not found');
        navigate('/orders');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(order.id);
      toast.success('Order cancelled successfully');
      const res = await orderService.getOrder(id);
      setOrder(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status?.toLowerCase());
  const isCancelled = order.status?.toLowerCase() === 'cancelled';

  return (
    <div className="page-container order-detail-page">
      <div className="container">
        {/* Navigation & Header */}
        <div className="detail-top-bar">
          <Link to="/orders" className="back-link">
            <FiArrowLeft /> Back to Orders
          </Link>
          <button className="btn btn-outline btn-sm print-btn" onClick={handlePrint}>
            <FiPrinter /> Print Invoice
          </button>
        </div>

        <div className="order-main-card">
          <div className="order-main-header">
            <div>
              <h1 className="order-main-title">
                Order {order.order_number || `#ORD-${order.id}`}
              </h1>
              <span className="order-date-text">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="order-status-badge-wrap">
              <span className={`badge badge-lg ${isCancelled ? 'badge-danger' : 'badge-primary'}`}>
                {order.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Timeline Tracker */}
          {!isCancelled ? (
            <div className="order-timeline-card">
              <div className="timeline-steps">
                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= (currentStepIndex === -1 ? 0 : currentStepIndex);
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    >
                      <div className="step-circle">
                        {isCompleted ? <FiCheck /> : idx + 1}
                      </div>
                      <div className="step-label">{step.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="order-cancelled-alert">
              <FiAlertCircle />
              <div>
                <strong>This order was cancelled</strong>
                <p>If you have already paid, your refund will be processed within 3-5 business days.</p>
              </div>
            </div>
          )}

          {/* Order Items Table */}
          <div className="order-items-table-section">
            <h3>Items in this Order</h3>
            <div className="items-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-product-cell">
                          <img
                            src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={item.product_name}
                            className="table-product-thumb"
                          />
                          <div>
                            <Link to={`/products/${item.product_id}`} className="table-product-title">
                              {item.product_name}
                            </Link>
                            {item.sku && <span className="table-sku">SKU: {item.sku}</span>}
                          </div>
                        </div>
                      </td>
                      <td>{formatPrice(item.unit_price || item.price)}</td>
                      <td>{item.quantity}</td>
                      <td className="text-right font-weight-bold">
                        {formatPrice((item.unit_price || item.price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="order-info-columns">
            {/* Delivery Address */}
            <div className="info-block">
              <h4>
                <FiMapPin /> Delivery Address
              </h4>
              <div className="address-display">
                <p><strong>{order.shipping_address?.full_name || order.user_name || 'Customer'}</strong></p>
                <p>{order.shipping_address?.address_line1 || '123 Tech Boulevard'}</p>
                {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                <p>
                  {order.shipping_address?.city || 'San Francisco'},{' '}
                  {order.shipping_address?.state || 'CA'}{' '}
                  {order.shipping_address?.postal_code || '94107'}
                </p>
                <p>{order.shipping_address?.country || 'United States'}</p>
                {order.shipping_address?.phone && <p>📞 {order.shipping_address.phone}</p>}
              </div>
            </div>

            {/* Payment & Breakdown */}
            <div className="info-block">
              <h4>
                <FiCreditCard /> Payment & Summary
              </h4>
              <div className="payment-meta-row">
                <span>Payment Method:</span>
                <strong className="text-capitalize">{order.payment_method || 'Credit Card'}</strong>
              </div>
              <div className="payment-meta-row">
                <span>Payment Status:</span>
                <span className="badge badge-success">PAID</span>
              </div>

              <div className="summary-breakdown-list mt-3">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal || order.total_amount)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="breakdown-row discount">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="breakdown-row">
                  <span>Shipping</span>
                  <span>{order.shipping_amount === 0 ? 'FREE' : formatPrice(order.shipping_amount)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax_amount || 0)}</span>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-row grand-total">
                  <span>Grand Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {(order.status === 'pending' || order.status === 'confirmed') && (
            <div className="order-bottom-actions">
              <button className="btn btn-outline-danger" onClick={handleCancelOrder}>
                Cancel This Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
