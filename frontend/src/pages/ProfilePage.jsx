import { useState, useEffect } from 'react';
import { FiUser, FiMapPin, FiPhone, FiMail, FiPlus, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authService, addressService } from '../services';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    is_default: false,
  });

  const fetchAddresses = () => {
    addressService.getAddresses()
      .then((res) => setAddresses(res.data.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const res = await authService.updateProfile({ name, phone });
      updateUser(res.data.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      full_name: user?.name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      is_default: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line1: addr.address_line1 || '',
      address_line2: addr.address_line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postal_code: addr.postal_code || '',
      country: addr.country || 'United States',
      is_default: addr.is_default || false,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, addressForm);
        toast.success('Address updated!');
      } else {
        await addressService.createAddress(addressForm);
        toast.success('Address created!');
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete address');
    }
  };

  return (
    <div className="page-container profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar-banner">
            <div className="profile-avatar-large">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <span className="badge badge-primary">{user?.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="profile-content-grid">
          {/* Personal Info Form */}
          <div className="profile-card">
            <h3 className="card-title">
              <FiUser /> Personal Details
            </h3>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-icon-group">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-group">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <small className="form-hint">Email address cannot be modified directly.</small>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-icon-group">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                {updatingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Saved Addresses Section */}
          <div className="profile-card">
            <div className="card-title-row">
              <h3 className="card-title">
                <FiMapPin /> Saved Addresses
              </h3>
              <button className="btn btn-outline btn-sm" onClick={handleOpenNewAddress}>
                <FiPlus /> Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="empty-substate">
                <p>You have no saved delivery addresses.</p>
                <button className="btn btn-secondary btn-sm mt-2" onClick={handleOpenNewAddress}>
                  Add Shipping Address
                </button>
              </div>
            ) : (
              <div className="saved-addresses-list">
                {addresses.map((addr) => (
                  <div key={addr.id} className="profile-address-card">
                    <div className="addr-meta">
                      <div className="addr-name-tag">
                        <strong>{addr.full_name}</strong>
                        {addr.is_default && <span className="badge badge-success badge-sm ml-2">Default</span>}
                      </div>
                      <p>{addr.address_line1}</p>
                      {addr.address_line2 && <p>{addr.address_line2}</p>}
                      <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                      <p>{addr.country}</p>
                      {addr.phone && <p>📞 {addr.phone}</p>}
                    </div>

                    <div className="addr-item-actions">
                      <button
                        className="btn-icon"
                        title="Edit"
                        onClick={() => handleEditAddress(addr)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Address Modal */}
        {showAddressModal && (
          <div className="modal-backdrop">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                  <button className="close-btn" onClick={() => setShowAddressModal(false)}>✕</button>
                </div>

                <form onSubmit={handleSaveAddress}>
                  <div className="modal-body">
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={addressForm.full_name}
                          onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Street Address *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={addressForm.address_line1}
                        onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-row-3">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          className="form-input"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Postal Code *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={addressForm.postal_code}
                          onChange={(e) => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group mt-2">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={addressForm.is_default}
                          onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                        />
                        <span>Set as Default Delivery Address</span>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowAddressModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
