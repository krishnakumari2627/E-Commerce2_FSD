import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiShield, FiUser, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}! 👋`);
      
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'seller') {
        navigate('/seller', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPassword);
      toast.success(`Logged in as demo ${user.role}! 🚀`);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'seller') {
        navigate('/seller', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Demo login failed');
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
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to manage your orders, wishlist and profile</p>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="demo-accounts-box">
            <span className="demo-label">⚡ Quick 1-Click Demo Logins:</span>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="demo-pill-btn customer"
                onClick={() => handleDemoLogin('customer@smartcart.com', 'Customer@123')}
              >
                <FiUser /> Customer
              </button>
              <button
                type="button"
                className="demo-pill-btn seller"
                onClick={() => handleDemoLogin('seller@smartcart.com', 'Seller@123')}
              >
                <FiShoppingBag /> Seller
              </button>
              <button
                type="button"
                className="demo-pill-btn admin"
                onClick={() => handleDemoLogin('admin@smartcart.com', 'Admin@123')}
              >
                <FiShield /> Admin
              </button>
            </div>
          </div>

          <div className="auth-divider">
            <span>OR SIGN IN WITH EMAIL</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-group">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-link">
                <label>Password</label>
                <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); toast('Password reset link sent to registered email'); }}>
                  Forgot?
                </a>
              </div>
              <div className="input-icon-group">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'} <FiArrowRight />
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
