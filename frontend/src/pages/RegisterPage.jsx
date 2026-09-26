import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    store_name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        store_name: formData.role === 'seller' ? formData.store_name : undefined,
      });

      toast.success('Registration successful! Welcome to SmartCart 🎉');
      if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-brand">
              <span className="brand-smart">Smart</span>
              <span className="brand-cart">Cart</span>
            </Link>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join thousands of smart shoppers and verified sellers</p>
          </div>

          {/* Role selector */}
          <div className="role-selector-toggle">
            <button
              type="button"
              className={`role-toggle-btn ${formData.role === 'customer' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'customer' })}
            >
              <FiUser /> Customer
            </button>
            <button
              type="button"
              className={`role-toggle-btn ${formData.role === 'seller' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'seller' })}
            >
              <FiShoppingBag /> Merchant / Seller
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.role === 'seller' && (
              <div className="form-group">
                <label>Store / Brand Name</label>
                <div className="input-icon-group">
                  <FiShoppingBag className="input-icon" />
                  <input
                    type="text"
                    name="store_name"
                    className="form-input"
                    placeholder="e.g. Apex Electronics Hub"
                    value={formData.store_name}
                    onChange={handleChange}
                    required={formData.role === 'seller'}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-group">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-group">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon-group">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'} <FiArrowRight />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
