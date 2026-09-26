import { useState, useEffect } from 'react';
import { FiUsers, FiSearch, FiCheck, FiX, FiShield, FiUser, FiShoppingBag } from 'react-icons/fi';
import { adminService } from '../../services';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        role: roleFilter || undefined,
        search: search || undefined,
      });
      setUsers(res.data.data?.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.is_active ? 0 : 1;
    try {
      await adminService.updateUserStatus(user.id, { is_active: newStatus });
      toast.success(`User account ${newStatus ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="page-container admin-users-page">
      <div className="container">
        <div className="admin-header-row">
          <div>
            <h1 className="page-title">User Account Directory</h1>
            <p className="page-subtitle">Manage customer accounts, registered sellers, and administrative staff</p>
          </div>
        </div>

        <div className="admin-toolbar-card">
          <div className="toolbar-search">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-filter">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All User Roles</option>
              <option value="customer">Customers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        <div className="dashboard-section-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-inline" /> Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">No user records found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-user-avatar">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="table-user-name">{u.name}</span>
                            <span className="table-user-email">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'seller' ? 'warning' : 'primary'}`}>
                          {u.role === 'admin' && <FiShield className="mr-1" />}
                          {u.role === 'seller' && <FiShoppingBag className="mr-1" />}
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${u.is_active ? 'success' : 'danger'}`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="text-right">
                        {u.role !== 'admin' && (
                          <button
                            className={`btn btn-xs ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => handleToggleStatus(u)}
                          >
                            {u.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        )}
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
