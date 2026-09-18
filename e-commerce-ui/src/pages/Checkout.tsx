import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';

const Checkout: React.FC = () => {
  const { user } = useAuth();
  const { cart, subtotal, discount, shipping, tax, total } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'razorpay' | 'gpay' | 'cod'>('card');

  // New Address inline form if user has no addresses
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    if (!user) {
      showToast('Please sign in to checkout.', 'info');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty.', 'error');
      navigate('/products');
      return;
    }

    // Pre-select default address
    const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
    }
  }, [user, cart, navigate]);

  if (!user || cart.length === 0) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetAddress = null;

    if (user.addresses.length > 0) {
      targetAddress = user.addresses.find((a) => a.id === selectedAddressId);
      if (!targetAddress) {
        showToast('Please select a shipping address.', 'error');
        return;
      }
    } else {
      // Validate inline address
      if (!name || !street || !city || !state || !zipCode) {
        showToast('Please complete shipping address details.', 'error');
        return;
      }
      targetAddress = { name, street, city, state, zipCode, country: 'United States' };
    }

    // Save transient order detail to session/state to pass to Payment page
    sessionStorage.setItem(
      'ec_checkout_data',
      JSON.stringify({
        address: targetAddress,
        paymentMethod
      })
    );

    // Redirect to Payment processing page
    navigate('/payment');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Security Checkout</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure shipping location and select payment details.</p>
      </div>

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '40px' }} className="checkout-grid">
        {/* Information Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Shipping Address Section */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="map-pin" size={20} style={{ color: 'var(--primary)' }} />
              <span>1. Shipping Address</span>
            </h3>

            {user.addresses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {user.addresses.map((addr) => (
                  <label
                    key={addr.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '16px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      backgroundColor: selectedAddressId === addr.id ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                      borderColor: selectedAddressId === addr.id ? 'var(--primary)' : 'var(--border-color)'
                    }}
                  >
                    <input
                      type="radio"
                      name="shipping-address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      style={{ marginTop: '4px', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{addr.name}</span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                        {addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                      </p>
                    </div>
                  </label>
                ))}
                <Link to="/address-management" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="plus" size={14} /> Add or edit addresses in settings
                </Link>
              </div>
            ) : (
              // Inline Address Form
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="label" htmlFor="checkout-name">Recipient Full Name</label>
                  <input id="checkout-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Liam Foster" className="input-field" required />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="checkout-street">Street Address</label>
                  <input id="checkout-street" type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="e.g. 100 Main St" className="input-field" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="label" htmlFor="checkout-city">City</label>
                    <input id="checkout-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" required />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="checkout-state">State</label>
                    <input id="checkout-state" type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Tamil Nadu" className="input-field" required />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="checkout-zip">Pin Code</label>
                    <input id="checkout-zip" type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="600032" className="input-field" required />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="credit-card" size={20} style={{ color: 'var(--primary)' }} />
              <span>2. Payment Option</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="payment-options">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className="btn"
                style={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-secondary)',
                  borderColor: paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)',
                  color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <Icon name="credit-card" size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className="btn"
                style={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'razorpay' ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-secondary)',
                  borderColor: paymentMethod === 'razorpay' ? 'var(--primary)' : 'var(--border-color)',
                  color: paymentMethod === 'razorpay' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <Icon name="credit-card" size={20} style={{ color: '#002984' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Razorpay (UPI/Cards)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('gpay')}
                className="btn"
                style={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'gpay' ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-secondary)',
                  borderColor: paymentMethod === 'gpay' ? 'var(--primary)' : 'var(--border-color)',
                  color: paymentMethod === 'gpay' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <Icon name="credit-card" size={20} style={{ color: '#4285F4' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Google Pay</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className="btn"
                style={{
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'cod' ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-secondary)',
                  borderColor: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--border-color)',
                  color: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <Icon name="truck" size={20} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cash on Delivery</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>Review Order Items</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              {cart.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.product.images[0]} alt="" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.product.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity} x ${item.product.price}</p>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax (8%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <span style={{ fontWeight: 600 }}>Total Order Price</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>₹{total.toFixed(2)}</span>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', height: '48px' }}>
              <Icon name="lock" size={16} />
              <span>Proceed to Payment</span>
            </button>
          </div>
        </div>
      </form>
      
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .payment-options { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;
