import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiLogOut, FiSettings, FiPackage, FiGrid, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
  const { cartItemCount, wishlistCount } = useCart();
  const [search, setSearch] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.navbar__user-menu')) setDropdownOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isSeller) return '/seller';
    return '/account';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          ⚡ SmartCart
        </Link>

        {/* Search */}
        <div className="navbar__search">
          <form onSubmit={handleSearch}>
            <FiSearch className="navbar__search-icon" size={16} />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="navbar-search"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          {isAuthenticated && !isAdmin && !isSeller && (
            <>
              <Link to="/wishlist" className="navbar__icon-btn" title="Wishlist" id="nav-wishlist-btn">
                <FiHeart size={18} />
                {wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" className="navbar__icon-btn" title="Cart" id="nav-cart-btn">
                <FiShoppingCart size={18} />
                {cartItemCount > 0 && <span className="navbar__badge">{cartItemCount}</span>}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <div className="navbar__user-menu">
              <button
                className="navbar__user-btn"
                onClick={() => setDropdownOpen(prev => !prev)}
                id="nav-user-menu-btn"
              >
                <FiUser size={16} />
                <span>{user?.name?.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <div style={{ padding: '0.5rem 0.875rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {user?.email}
                    </div>
                    <span className={`badge badge-${isAdmin ? 'danger' : isSeller ? 'warning' : 'primary'}`} style={{ marginTop: '0.375rem' }}>
                      {user?.role}
                    </span>
                  </div>

                  <div style={{ padding: '0.4rem 0' }}>
                    <Link to={getDashboardLink()} className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <FiGrid size={15} /> Dashboard
                    </Link>
                    {!isAdmin && !isSeller && (
                      <>
                        <Link to="/orders" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiPackage size={15} /> My Orders
                        </Link>
                        <Link to="/account" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiSettings size={15} /> Settings
                        </Link>
                      </>
                    )}
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item danger" onClick={handleLogout} id="nav-logout-btn">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm" id="nav-login-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
