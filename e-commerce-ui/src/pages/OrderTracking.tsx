import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllStoredOrders, PRODUCTS, type Order } from '../utils/mockData';
import { api } from '../utils/apis/api';
import { Icon } from '../components/ui/Icon';

const OrderTracking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderId = searchParams.get('id') || '';

  const [trackingInput, setTrackingInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId.trim()) {
      setOrder(null);
      return;
    }

    const loadOrder = async () => {
      const online = await api.status.check();
      if (online) {
        try {
          const beOrd = await api.orders.get(orderId.trim());
          if (beOrd) {
            const formattedDate = beOrd.createdAt ? beOrd.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
            const mappedOrder: Order = {
              id: beOrd.id.toString(),
              userId: beOrd.userId.toString(),
              items: beOrd.items.map((it: any) => {
                const matchImg = PRODUCTS.find((p) => p.id === `prod-${it.productId}` || p.id === it.productId.toString());
                return {
                  productId: it.productId.toString(),
                  name: it.productName,
                  image: matchImg ? matchImg.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
                  price: parseFloat(it.price),
                  quantity: it.quantity
                };
              }),
              subtotal: beOrd.totalAmount,
              discount: 0,
              tax: beOrd.totalAmount * 0.08,
              shipping: beOrd.totalAmount > 150 ? 0 : 9.99,
              total: beOrd.totalAmount,
              address: {
                name: 'Recipient Name',
                street: beOrd.shippingAddress || 'No Street Address',
                city: '',
                state: '',
                zipCode: '',
                country: 'United States'
              },
              paymentMethod: 'card',
              status: beOrd.status.toLowerCase() === 'pending' ? 'ordered' : beOrd.status.toLowerCase(),
              date: formattedDate,
              trackingNumber: beOrd.trackingNumber || `TRK-${Math.floor(100000 + Math.random() * 900000)}`
            };
            setOrder(mappedOrder);
            return;
          }
        } catch (err) {
          console.error('Failed to get order from API, falling back to local', err);
        }
      }

      // Fallback
      const orders = getAllStoredOrders();
      const match = orders.find(
        (o) =>
          o.id.toLowerCase() === orderId.trim().toLowerCase() ||
          o.trackingNumber.toLowerCase() === orderId.trim().toLowerCase()
      );
      setOrder(match || null);
    };

    loadOrder();
  }, [orderId]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setSearchParams({ id: trackingInput.trim() });
    }
  };

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return 0;
      case 'packaging': return 1;
      case 'shipped': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  const steps = [
    { title: 'Order Placed', desc: 'Order approved and registered' },
    { title: 'Packaging', desc: 'Sellers wrapping item packages' },
    { title: 'Shipped', desc: 'Departed from dispatch warehouse center' },
    { title: 'Out For Delivery', desc: 'Package loaded on delivery truck' },
    { title: 'Delivered', desc: 'Item package dropped at residence door' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Order Delivery Tracking</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Check dispatch stages and location reports for packages.</p>
      </div>

      {/* Manual Track Form */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>Track via Order ID or Tracking Number</h3>
        <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            placeholder="e.g. ord-123456 or TRK-123456"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="input-field"
            style={{ flex: 1, height: '40px' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', height: '40px' }}>
            <span>Track Order</span>
          </button>
        </form>
      </div>

      {order ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Status info bar */}
          <div className="card" style={{ padding: '28px', backgroundColor: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="track-info-grid">
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>SHIPPED VIA</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>FedEx Express Logistics</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>TRACKING NUMBER</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', color: 'var(--primary)' }}>{order.trackingNumber}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>ESTIMATED ARRIVAL</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                  {order.status === 'delivered' ? 'Package Delivered' : 'Within 2-3 Business Days'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>ORDER REFERENCE</span>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>{order.id}</p>
              </div>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="card" style={{ padding: '40px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
              {/* Stepper Line background */}
              <div style={{ position: 'absolute', left: '20px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }} />

              {steps.map((st, idx) => {
                const currentIdx = getStepIndex(order.status);
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: '20px', zIndex: 1, position: 'relative' }}>
                    {/* Circle icon indicator */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted || isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                        border: '2px solid',
                        borderColor: isCompleted || isActive ? 'var(--primary)' : 'var(--border-color)',
                        color: isCompleted || isActive ? '#ffffff' : 'var(--text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isActive ? '0 0 0 4px rgba(99, 102, 241, 0.15)' : 'none',
                        flexShrink: 0
                      }}
                    >
                      {isCompleted ? (
                        <Icon name="check" size={18} />
                      ) : isActive ? (
                        <Icon name="clock" size={18} />
                      ) : (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{idx + 1}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600, color: isActive || isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {st.title}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package details */}
          <div className="card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>Items in this delivery</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <img src={item.image} alt="" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Quantity: {item.quantity} x Price: ₹{item.price}</p>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        orderId && (
          <div style={{ padding: '64px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
            <Icon name="alert-circle" size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Order Registry Fails</h3>
            <p style={{ fontSize: '0.9rem' }}>We couldn\'t find any active delivery packages registered under "{orderId}". Check code and try again.</p>
          </div>
        )
      )}
      
      <style>{`
        @media (max-width: 640px) {
          .track-info-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
