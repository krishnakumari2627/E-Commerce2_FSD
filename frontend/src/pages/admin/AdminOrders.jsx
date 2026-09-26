import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiCheckCircle, FiClock, FiTruck, FiXCircle, FiChevronRight } from 'react-icons/fi';
import { orderService } from '../../services';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders({
        status: statusFilter || undefined,
      });
      setOrders(res.data.data?.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="page-container admin-orders-page">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">Order Processing & Fulfillment</h1>
            <p className="page-subtitle">Track customer purchases, update fulfillment steps and manage shipping</p>
          </div>

          <div className="status-filter-select">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Order Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Placed Date</th>
                  <th>Current Status</th>
                  <th>Update Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-inline" /> Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      No orders found matching the filter.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong>{ord.order_number || `#ORD-${ord.id}`}</strong>
                      </td>
                      <td>
                        <div className="customer-info-cell">
                          <span className="customer-name">{ord.user_name || 'Customer'}</span>
                          <span className="customer-email">{ord.user_email}</span>
                        </div>
                      </td>
                      <td>{ord.items?.length || 1} items</td>
                      <td>
                        <strong>{formatPrice(ord.total_amount)}</strong>
                      </td>
                      <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${ord.status === 'delivered' ? 'success' : ord.status === 'cancelled' ? 'danger' : 'primary'}`}>
                          {ord.status?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={ord.status}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="text-right">
                        <Link to={`/orders/${ord.id}`} className="btn btn-outline btn-xs">
                          Details <FiChevronRight />
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
