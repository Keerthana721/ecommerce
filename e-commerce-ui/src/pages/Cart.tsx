import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';

const Cart: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    subtotal,
    discount,
    shipping,
    tax,
    total
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCouponCode(couponInput.trim());
    if (res.success) {
      showToast(res.message, 'success');
      setCouponInput('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Your Cart Directory</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review selected creations and apply checkout codes.</p>
      </div>

      {cart.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' }} className="cart-grid">
          {/* Items Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map((item) => (
              <div
                key={item.product.id}
                className="card cart-card-layout"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr auto',
                  gap: '20px',
                  padding: '20px',
                  alignItems: 'center'
                }}
              >
                <div style={{ height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>{item.product.category}</span>
                  <Link to={`/products/${item.product.id}`} style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.05rem', margin: '2px 0 6px 0' }}>
                    {item.product.name}
                  </Link>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{item.product.price}</span>
                </div>
                
                {/* Actions & Quantity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', padding: '2px' }}>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Decrease quantity">
                      <Icon name="minus" size={12} />
                    </button>
                    <span style={{ width: '28px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ padding: '6px 10px', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Increase quantity">
                      <Icon name="plus" size={12} />
                    </button>
                  </div>
                  <button onClick={() => { removeFromCart(item.product.id); showToast(`Removed "${item.product.name}" from cart.`, 'info'); }} className="btn-ghost" style={{ color: 'var(--danger)', padding: '8px' }} aria-label="Delete item from cart">
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Summary Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Promo Code Input Card */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>Checkout Promo Code</h3>
              
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px dashed var(--success)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.85rem' }}>{appliedCoupon.code}</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{appliedCoupon.description}</p>
                  </div>
                  <button onClick={removeCouponCode} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} aria-label="Remove coupon">
                    <Icon name="close" size={16} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="input-field"
                    style={{ flex: 1, fontSize: '0.85rem', height: '38px' }}
                  />
                  <button type="submit" className="btn btn-outline" style={{ height: '38px', padding: '0 16px', fontSize: '0.85rem' }}>
                    Apply
                  </button>
                </form>
              )}
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                💡 Try <strong style={{ textDecoration: 'underline' }}>WELCOME10</strong> (10% off) or <strong style={{ textDecoration: 'underline' }}>SUPER50</strong> (50% off!)
              </span>
            </div>

            {/* Price Calculations Card */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>Order summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cart Subtotal</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping Fee</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Estimated Tax (8%)</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{tax.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Order Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
              </div>

              <button onClick={handleCheckoutClick} className="btn btn-primary btn-lg" style={{ width: '100%', height: '48px' }}>
                <span>Secure Checkout</span>
                <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '80px 24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-light)', marginBottom: '20px' }}>
            <Icon name="cart" size={48} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Your Shopping Cart is Empty</h2>
          <p style={{ fontSize: '0.95rem', marginBottom: '28px' }}>You haven\'t added any items to your shopping cart catalog yet.</p>
          <Link to="/products" className="btn btn-primary">
            <span>Start Shopping Catalog</span>
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
          .cart-card-layout { grid-template-columns: 80px 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
