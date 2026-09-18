import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../ui/Icon';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { cartTotalCount } = useCart();
  const { wishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Promobar */}
      <div style={{ backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '0.8rem', textAlign: 'center', padding: '6px 12px', fontWeight: 500, letterSpacing: '0.03em' }}>
        🚀 FLASH SALE: Use CODE <strong style={{ textDecoration: 'underline' }}>SUPER50</strong> for 50% off! Free express shipping on orders over ₹150.
      </div>

      {/* Header */}
      <header className="nav-glass" style={{ width: '100%', position: 'sticky', top: 0, zIndex: 999 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
            <img src="/logo.png" alt="Diyora Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: 'var(--shadow-sm)' }} />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Diyora</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }} className="desktop-only">
            <Link to="/" style={{ fontWeight: location.pathname === '/' ? 600 : 500, color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)' }}>Home</Link>
            <Link to="/products" style={{ fontWeight: location.pathname === '/products' ? 600 : 500, color: location.pathname === '/products' ? 'var(--primary)' : 'var(--text-secondary)' }}>Shop</Link>
            <Link to="/categories" style={{ fontWeight: location.pathname === '/categories' ? 600 : 500, color: location.pathname === '/categories' ? 'var(--primary)' : 'var(--text-secondary)' }}>Categories</Link>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '280px' }} className="desktop-only">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ width: '100%', paddingRight: '40px', paddingLeft: '14px', height: '38px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
            />
            <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} aria-label="Search">
              <Icon name="search" size={16} />
            </button>
          </form>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }} aria-label="Toggle theme">
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={20} />
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="desktop-only" style={{ position: 'relative', padding: '8px' }} aria-label={`View Wishlist. ${wishlist.length} items.`}>
              <Icon name="heart" size={20} style={{ color: wishlist.length > 0 ? 'var(--danger)' : 'var(--text-secondary)' }} />
              {wishlist.length > 0 && (
                <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: 'var(--danger)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-secondary)' }}>
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Link */}
            <Link to="/cart" style={{ position: 'relative', padding: '8px' }} aria-label={`View Cart. ${cartTotalCount} items.`}>
              <Icon name="cart" size={20} style={{ color: cartTotalCount > 0 ? 'var(--primary)' : 'var(--text-secondary)' }} />
              {cartTotalCount > 0 && (
                <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 700, borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-secondary)' }}>
                  {cartTotalCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown Trigger */}
            <div style={{ position: 'relative' }} className="desktop-only">
              {user ? (
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  aria-label="User account menu"
                  aria-haspopup="true"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <img src={user.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                  <Icon name="chevron-down" size={14} className="desktop-only" style={{ color: 'var(--text-secondary)' }} />
                </button>
              ) : (
                <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
                  <Icon name="user" size={14} />
                  <span>Login</span>
                </Link>
              )}

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && user && (
                <div style={{ position: 'absolute', right: 0, marginTop: '8px', width: '220px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1000, overflow: 'hidden', textAlign: 'left' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                    <span className="badge badge-primary" style={{ marginTop: '4px', fontSize: '0.65rem', padding: '1px 6px' }}>{user.role}</span>
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="dropdown-item">
                      <Icon name="user" size={16} /> My Profile
                    </Link>
                    <Link to="/address-management" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="dropdown-item">
                      <Icon name="map-pin" size={16} /> Address Book
                    </Link>
                    <Link to="/orders" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="dropdown-item">
                      <Icon name="package" size={16} /> Order History
                    </Link>
                    
                    {user.role === 'ADMIN' && (
                      <Link to="/admin" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }} className="dropdown-item">
                        <Icon name="activity" size={16} /> Admin Control
                      </Link>
                    )}
                    {user.role === 'MANAGER' && (
                      <Link to="/seller" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 600 }} className="dropdown-item">
                        <Icon name="settings" size={16} /> Seller Console
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>
                    <button onClick={handleLogout} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <Icon name="logout" size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-ghost mobile-only"
              style={{ padding: '8px', cursor: 'pointer' }}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name={isMobileMenuOpen ? 'close' : 'menu'} size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '16px', gap: '16px', animation: 'fadeIn var(--transition-fast) forwards' }} className="mobile-only">
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ width: '100%', paddingRight: '40px', height: '40px', borderRadius: 'var(--radius-md)' }}
              />
              <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)' }}>
                <Icon name="search" size={16} />
              </button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="shopping-bag" size={16} /> Home
              </Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="search" size={16} /> Shop Catalog
              </Link>
              <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="grid" size={16} /> Categories
              </Link>
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Icon name="heart" size={16} /> Wishlist</span>
                {wishlist.length > 0 && (
                  <span style={{ backgroundColor: 'var(--danger)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {wishlist.length}
                  </span>
                )}
              </Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="user" size={16} /> My Profile ({user.name})
                  </Link>
                  <Link to="/address-management" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="map-pin" size={16} /> Address Book
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="package" size={16} /> Order History
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="activity" size={16} /> Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'MANAGER' && (
                    <Link to="/seller" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 600, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon name="settings" size={16} /> Seller Dashboard
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 4px', fontWeight: 500, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    <Icon name="logout" size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ padding: '8px 4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                  <Icon name="user" size={16} /> Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 0' }}>
        <div className="container animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', padding: '64px 0 32px 0', marginTop: 'auto' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '48px', marginBottom: '48px' }} className="footer-grid">
            {/* Branding Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.45rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                <img src="/logo.png" alt="Diyora Logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', boxShadow: 'var(--shadow-sm)' }} />
                <span style={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Diyora</span>
              </Link>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '320px' }}>
                Your destination for modern, premium everyday items. Curated tech gadgets, hand-tanned fashion items, and minimal home decor.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <span style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}><Icon name="sparkles" size={16} /></span>
                <span style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}><Icon name="shield-check" size={16} /></span>
                <span style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}><Icon name="activity" size={16} /></span>
              </div>
            </div>

            {/* Shop Links Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Explore</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/categories">Categories</Link></li>
                <li><Link to="/search">Search Products</Link></li>
                <li><Link to="/wishlist">Your Wishlist</Link></li>
              </ul>
            </div>

            {/* Business Links Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Business</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li><Link to="/login?role=seller">Seller Portal</Link></li>
                <li><Link to="/login?role=nadmi">Admin Console</Link></li>
                <li><Link to="/login?role=customer">Customer Access</Link></li>
                <li><Link to="/orders">Order Tracking</Link></li>
              </ul>
            </div>

            {/* Newsletter Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Stay Updated</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subscribe to our newsletter for exclusive discounts and product releases.</p>
              <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} style={{ display: 'flex', gap: '8px' }}>
                <input type="email" required placeholder="Enter your email" className="input-field" style={{ flex: 1, fontSize: '0.85rem', height: '40px' }} />
                <button type="submit" className="btn btn-primary" style={{ height: '40px', padding: '0 16px' }}>Join</button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }} className="footer-bottom">
            <p>© 2026 VeloMarket Inc. All rights reserved. Built with premium React & CSS.</p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>WCAG Accessibility</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Media Query Helpers injected for dynamic grid layout responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
        .dropdown-item:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
};
