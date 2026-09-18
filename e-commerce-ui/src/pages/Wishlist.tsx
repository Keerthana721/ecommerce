import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';

const Wishlist: React.FC = () => {
  const { wishlist, toggleWishlist, moveToCart } = useWishlist();
  const { showToast } = useToast();

  const handleMoveToCart = (prod: any) => {
    moveToCart(prod);
    showToast(`Moved "${prod.name}" to cart!`, 'success');
  };

  const handleRemove = (prod: any) => {
    toggleWishlist(prod);
    showToast(`Removed "${prod.name}" from wishlist.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Your Wishlist Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review creations you have saved for later and add them directly to cart.</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid-cols-4">
          {wishlist.map((prod) => (
            <div key={prod.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
              {/* Delete Icon Overlay */}
              <button
                onClick={() => handleRemove(prod)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 10,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--danger)',
                  boxShadow: 'var(--shadow-sm)'
                }}
                aria-label="Remove item from wishlist"
              >
                <Icon name="close" size={16} />
              </button>

              <Link to={`/products/${prod.id}`} style={{ display: 'block', overflow: 'hidden', height: '180px', backgroundColor: 'var(--bg-tertiary)' }}>
                <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Link>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>{prod.category}</span>
                <Link to={`/products/${prod.id}`} style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {prod.name}
                </Link>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="star" size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{prod.rating}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{prod.price}</span>
                  <button onClick={() => handleMoveToCart(prod)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="cart" size={12} />
                    <span>To Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '80px 24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-light)', marginBottom: '20px' }}>
            <Icon name="heart" size={48} style={{ color: 'var(--text-light)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Your Wishlist is Empty</h2>
          <p style={{ fontSize: '0.95rem', marginBottom: '28px' }}>Save items from our catalog to review them here later.</p>
          <Link to="/products" className="btn btn-primary">
            <span>Shop Catalog Catalog</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
