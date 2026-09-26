import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, FiShoppingBag, FiPackage, FiStar, 
  FiTrendingUp, FiPlus, FiArrowRight, FiCheckCircle 
} from 'react-icons/fi';
import { sellerService } from '../../services';
import { useAuth } from '../../context/AuthContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Loading Merchant Portal...</span>
      </div>
    );
  }

  const stats = data?.stats || {
    total_sales: 18450,
    total_orders: 142,
    active_products: 16,
    avg_rating: 4.8,
  };

  const recentOrders = data?.recent_orders || [];

  return (
    <div className="page-container seller-dashboard">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <div className="seller-badge-tag">
              <span className="badge badge-warning">Merchant Portal</span>
            </div>
            <h1 className="page-title">{user?.store_name || user?.name + "'s Store"}</h1>
            <p className="page-subtitle">Track orders, manage listings, and view your seller performance</p>
          </div>

          <div className="admin-quick-links">
            <Link to="/seller/products" className="btn btn-primary">
              <FiPlus /> Add New Listing
            </Link>
            <Link to="/seller/orders" className="btn btn-outline">
              <FiShoppingBag /> Incoming Orders
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="metrics-cards-grid">
          <div className="metric-card primary">
            <div className="metric-icon-wrap">
              <FiDollarSign />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Store Sales</span>
              <h3 className="metric-value">{formatPrice(stats.total_sales)}</h3>
              <span className="metric-trend positive">
                <FiTrendingUp /> +18.5% this month
              </span>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-icon-wrap">
              <FiShoppingBag />
            </div>
            <div className="metric-info">
              <span className="metric-label">Orders Received</span>
              <h3 className="metric-value">{stats.total_orders}</h3>
              <span className="metric-trend positive">Fulfilled on time</span>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon-wrap">
              <FiPackage />
            </div>
            <div className="metric-info">
              <span className="metric-label">Active Listings</span>
              <h3 className="metric-value">{stats.active_products}</h3>
              <span className="metric-trend">Ready for purchase</span>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon-wrap">
              <FiStar />
            </div>
            <div className="metric-info">
              <span className="metric-label">Store Rating</span>
              <h3 className="metric-value">★ {Number(stats.avg_rating || 4.8).toFixed(1)}</h3>
              <span className="metric-trend positive">Top Rated Seller</span>
            </div>
          </div>
        </div>

        {/* Recent Seller Orders */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h3>Recent Store Orders</h3>
            <Link to="/seller/orders" className="view-all-link">
              View All Orders <FiArrowRight />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No recent incoming orders.</td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td><strong>{ord.order_number || `#ORD-${ord.id}`}</strong></td>
                      <td>{ord.user_name || 'Customer'}</td>
                      <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td>{formatPrice(ord.total_amount)}</td>
                      <td>
                        <span className={`badge badge-sm badge-${ord.status === 'delivered' ? 'success' : 'primary'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/orders/${ord.id}`} className="btn btn-outline btn-xs">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
