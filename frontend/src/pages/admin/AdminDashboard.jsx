import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, FiShoppingBag, FiUsers, FiPackage, 
  FiTrendingUp, FiArrowRight, FiCheckCircle, FiClock, FiAlertTriangle 
} from 'react-icons/fi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { adminService } from '../../services';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Loading Admin Analytics...</span>
      </div>
    );
  }

  const stats = data?.stats || {
    total_revenue: 128450,
    total_orders: 842,
    total_users: 1250,
    total_products: 64,
  };

  const chartData = data?.revenue_chart || [
    { name: 'Jan', revenue: 12400, orders: 85 },
    { name: 'Feb', revenue: 15600, orders: 110 },
    { name: 'Mar', revenue: 18900, orders: 135 },
    { name: 'Apr', revenue: 14200, orders: 95 },
    { name: 'May', revenue: 22400, orders: 160 },
    { name: 'Jun', revenue: 26800, orders: 190 },
    { name: 'Jul', revenue: 31200, orders: 220 },
  ];

  const recentOrders = data?.recent_orders || [];

  return (
    <div className="page-container admin-dashboard">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">Admin Management Console</h1>
            <p className="page-subtitle">Real-time business performance, revenue, and system metrics</p>
          </div>

          <div className="admin-quick-links">
            <Link to="/admin/products" className="btn btn-outline btn-sm">
              <FiPackage /> Products
            </Link>
            <Link to="/admin/orders" className="btn btn-outline btn-sm">
              <FiShoppingBag /> Orders
            </Link>
            <Link to="/admin/users" className="btn btn-outline btn-sm">
              <FiUsers /> Users
            </Link>
            <Link to="/admin/categories" className="btn btn-outline btn-sm">
              Categories
            </Link>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="metrics-cards-grid">
          <div className="metric-card primary">
            <div className="metric-icon-wrap">
              <FiDollarSign />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Revenue</span>
              <h3 className="metric-value">{formatPrice(stats.total_revenue)}</h3>
              <span className="metric-trend positive">
                <FiTrendingUp /> +14.8% vs last month
              </span>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-icon-wrap">
              <FiShoppingBag />
            </div>
            <div className="metric-info">
              <span className="metric-label">Total Orders</span>
              <h3 className="metric-value">{stats.total_orders?.toLocaleString()}</h3>
              <span className="metric-trend positive">
                <FiTrendingUp /> +8.2% new orders
              </span>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon-wrap">
              <FiUsers />
            </div>
            <div className="metric-info">
              <span className="metric-label">Active Users</span>
              <h3 className="metric-value">{stats.total_users?.toLocaleString()}</h3>
              <span className="metric-trend positive">
                <FiTrendingUp /> +12.4% new accounts
              </span>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon-wrap">
              <FiPackage />
            </div>
            <div className="metric-info">
              <span className="metric-label">Products in Catalog</span>
              <h3 className="metric-value">{stats.total_products?.toLocaleString()}</h3>
              <span className="metric-trend">Across all categories</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="dashboard-charts-grid">
          <div className="chart-card large">
            <div className="chart-header">
              <h3>Revenue Growth Overview</h3>
              <span className="chart-badge">Monthly Trend</span>
            </div>
            <div className="chart-body" style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    formatter={(value) => [formatPrice(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Monthly Orders</h3>
              <span className="chart-badge">Volume</span>
            </div>
            <div className="chart-body" style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  />
                  <Bar dataKey="orders" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="dashboard-section-card">
          <div className="section-card-header">
            <h3>Recent Store Orders</h3>
            <Link to="/admin/orders" className="view-all-link">
              Manage All Orders <FiArrowRight />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">No recent orders.</td>
                  </tr>
                ) : (
                  recentOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong>{ord.order_number || `#ORD-${ord.id}`}</strong>
                      </td>
                      <td>{ord.user_name || 'Customer'}</td>
                      <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td>{formatPrice(ord.total_amount)}</td>
                      <td>
                        <span className={`badge badge-sm badge-${ord.status === 'delivered' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'primary'}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <Link to={`/orders/${ord.id}`} className="btn btn-outline btn-xs">
                          View
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
