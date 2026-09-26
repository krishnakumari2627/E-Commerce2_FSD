import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiArrowRight, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { orderService } from '../services';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page-container order-success-page">
      <div className="container">
        <div className="order-success-card">
          <div className="success-icon-animation">
            <FiCheckCircle className="check-icon" />
          </div>

          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for shopping with SmartCart. We've received your order and are getting it ready to be shipped.
          </p>

          <div className="order-id-badge">
            Order ID: <strong>{order?.order_number || `#ORD-${id}`}</strong>
          </div>

          {order && (
            <div className="order-summary-box">
              <div className="summary-info-grid">
                <div>
                  <span className="info-label">Payment Status:</span>
                  <span className="badge badge-success">Paid</span>
                </div>
                <div>
                  <span className="info-label">Delivery Status:</span>
                  <span className="badge badge-primary">{order.status || 'Confirmed'}</span>
                </div>
                <div>
                  <span className="info-label">Total Amount:</span>
                  <span className="info-val">{formatPrice(order.total_amount)}</span>
                </div>
                <div>
                  <span className="info-label">Est. Delivery:</span>
                  <span className="info-val">3 - 5 Business Days</span>
                </div>
              </div>
            </div>
          )}

          <div className="success-actions">
            <Link to={`/orders/${id}`} className="btn btn-primary btn-lg">
              <FiTruck /> Track Order Details
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
