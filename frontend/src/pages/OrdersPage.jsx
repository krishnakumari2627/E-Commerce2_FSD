import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiClock, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { orderService } from '../services';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'badge-success';
    case 'shipped':
      return 'badge-info';
    case 'confirmed':
    case 'processing':
      return 'badge-primary';
    case 'cancelled':
      return 'badge-danger';
    default:
      return 'badge-warning';
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  const fetchOrders = () => {
    setLoading(true);
    const params = activeStatus !== 'all' ? { status: activeStatus } : {};
    orderService.getOrders(params)
      .then((res) => setOrders(res.data.data?.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [activeStatus]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(orderId);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const statusTabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="page-container orders-page">
      <div className="container">
        <div className="orders-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">Track, view details, and manage your past orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="order-tabs-bar">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              className={`order-tab-btn ${activeStatus === tab.key ? 'active' : ''}`}
              onClick={() => setActiveStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="page-loader">
            <div className="spinner" />
            <span>Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>You have no {activeStatus !== 'all' ? activeStatus : ''} orders placed yet.</p>
            <Link to="/products" className="btn btn-primary mt-3">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-header-meta">
                    <div>
                      <span className="order-num-label">Order</span>
                      <span className="order-num-val">{order.order_number || `#ORD-${order.id}`}</span>
                    </div>
                    <div>
                      <span className="order-date-label">Placed On</span>
                      <span className="order-date-val">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="order-total-label">Total Amount</span>
                      <span className="order-total-val">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>

                  <div className="order-header-status">
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-preview-list">
                    {order.items?.map((item) => (
                      <div key={item.id} className="order-preview-item">
                        <img
                          src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt={item.product_name}
                          className="preview-item-img"
                        />
                        <div className="preview-item-details">
                          <Link to={`/products/${item.product_id}`} className="preview-item-name">
                            {item.product_name}
                          </Link>
                          <div className="preview-item-qty">
                            Qty: {item.quantity} × {formatPrice(item.unit_price || item.price)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card-actions">
                    <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">
                      View Details & Track <FiChevronRight />
                    </Link>
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
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
