import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiChevronRight } from 'react-icons/fi';
import { sellerService, orderService } from '../../services';
import toast from 'react-hot-toast';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await sellerService.getOrders();
      setOrders(res.data.data?.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, { status });
      toast.success(`Fulfillment status updated to ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="page-container seller-orders-page">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">Store Order Fulfillment</h1>
            <p className="page-subtitle">Process incoming customer orders and prepare packages for shipping</p>
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Order Total</th>
                  <th>Status</th>
                  <th>Fulfillment Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-inline" /> Loading incoming orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      No customer orders received yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong>{ord.order_number || `#ORD-${ord.id}`}</strong>
                      </td>
                      <td>
                        <span className="customer-name">{ord.user_name || 'Customer'}</span>
                      </td>
                      <td>{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td><strong>{formatPrice(ord.total_amount)}</strong></td>
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
