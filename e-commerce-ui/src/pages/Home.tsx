import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, getStoredProducts } from '../utils/mockData';
import { Icon } from '../components/ui/Icon';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Home: React.FC = () => {
  const products = getStoredProducts().slice(0, 4); // Display first 4 as featured
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    toggleWishlist(product);
    const added = !isInWishlist(product.id);
    showToast(
      added ? `Added "${product.name}" to wishlist!` : `Removed "${product.name}" from wishlist!`,
      added ? 'success' : 'info'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
      {/* Hero Banner */}
      <section style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '520px', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%), url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80") center/cover no-repeat' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)' }} />
        <div style={{ position: 'relative', padding: '0 48px', maxWidth: '640px', color: '#ffffff', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span className="badge badge-primary" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', width: 'fit-content', fontSize: '0.8rem', padding: '4px 12px' }}>
            NEW COLLECTION 2026
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, fontFamily: 'var(--font-heading)' }}>
            Elevate Your Everyday Essentials
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.9)' }}>
            Explore VeloMarket\'s handpicked collection of high-fidelity gadgets, bespoke apparel, and minimalist interior decors.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <Link to="/products" className="btn btn-primary btn-lg">
              <span>Shop Collection</span>
              <Icon name="arrow-right" size={18} />
            </Link>
            <Link to="/categories" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)' }}>
              <span>Browse Categories</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Badges Section */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Icon name="truck" size={24} />
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Free Express Shipping</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Complementary standard shipping on order totals exceeding ₹150.</p>
          </div>
        </div>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <Icon name="shield-check" size={24} />
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Secure Processing</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Encrypted payments processed through 256-bit token gateways.</p>
          </div>
        </div>
        <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', textAlign: 'left' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)' }}>
            <Icon name="sparkles" size={24} />
          </div>
          <div>
            <h4 style={{ marginBottom: '4px' }}>Premium Curation</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Hand-tested products guaranteeing long-term quality and durability.</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Shop by Category</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Find exactly what you need in our curated departments.</p>
          </div>
          <Link to="/categories" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
            <span>View All</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {CATEGORIES.slice(0, 4).map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="card" style={{ position: 'relative', height: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px', backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.1) 60%), url("${cat.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ textAlign: 'left', color: '#ffffff' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '4px' }}>{cat.name}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Hot Selling Products */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem' }}>Featured Creations</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Our most popular items loved by customers worldwide.</p>
          </div>
          <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
            <span>View Catalog</span>
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
        <div className="grid-cols-4">
          {products.map((prod) => {
            const isWish = isInWishlist(prod.id);
            return (
              <Link key={prod.id} to={`/products/${prod.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                {/* Wishlist button overlay */}
                <button onClick={(e) => handleToggleWishlist(e, prod)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWish ? 'var(--danger)' : 'var(--text-muted)', boxShadow: 'var(--shadow-sm)' }} aria-label={isWish ? "Remove from Wishlist" : "Add to Wishlist"}>
                  <Icon name="heart" size={18} fill={isWish ? 'var(--danger)' : 'none'} />
                </button>
                <div style={{ overflow: 'hidden', height: '220px', backgroundColor: 'var(--bg-tertiary)' }}>
                  <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }} />
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'left', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>{prod.category}</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{prod.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="star" size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{prod.rating}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({prod.reviewsCount})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{prod.price}</span>
                      {prod.originalPrice && (
                        <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{prod.originalPrice}</span>
                      )}
                    </div>
                    <button onClick={(e) => handleAddToCart(e, prod)} className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-md)' }} aria-label="Add to cart">
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Customer Testimonial Showcase */}
      <section style={{ padding: '64px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
        <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: 'var(--warning)' }}>
            {Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size={20} fill="var(--warning)" />)}
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.6 }}>
            "The AeroSound Pro ANC headphones are hands-down the best headset I have ever purchased. The sound separation is clinical and the build feels robust and premium. The VeloMarket shipping took only 2 days."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left' }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Clara Kensington</h5>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Acoustician & Buyer</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
