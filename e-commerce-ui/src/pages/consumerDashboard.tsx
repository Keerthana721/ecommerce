import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { getStoredOrders, PRODUCTS, type Order } from '../utils/mockData';
import { Icon } from '../components/ui/Icon';
import userApi from '../utils/apis/userApi';

const ConsumerDashboard: React.FC = () => {
  const { user } = useAuth();               // Current logged‑in user
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  // --------------------
  // 1️⃣ Load data on mount / when `user` changes
  // --------------------
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      // 2️⃣ Optional “online” check – you already have it in the repo
      const online = await userApi.status.check();

      if (online) {
        try {
          // 3️⃣ Call the backend endpoint
          const beOrders = await userApi.orders.listByUser(user.id);

          // 4️⃣ Transform the raw payload into UI‑friendly shape
          const mapped: Order[] = beOrders.map((o: any) => ({
            id: o.id.toString(),
            userId: o.userId.toString(),
            items: o.items.map((it: any) => ({
              productId: it.productId.toString(),
              name: it.productName,
              image:
                PRODUCTS.find(p => p.id === `prod-${it.productId}`)?.images[0] ??
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
              price: parseFloat(it.price),
              quantity: it.quantity,
            })),
            subtotal: o.totalAmount,
            discount: 0,
            tax: o.totalAmount * 0.08,
            shipping: o.totalAmount > 150 ? 0 : 9.99,
            total: o.totalAmount,
            address: {
              name: user.name,
              street: o.shippingAddress ?? 'No Street Address',
              city: '',
              state: '',
              zipCode: '',
              country: 'United States',
            },
            paymentMethod: 'card',
            status:
              o.status.toLowerCase() === 'pending' ? 'ordered' : o.status.toLowerCase(),
            date: o.createdAt?.split('T')[0] ?? new Date().toISOString().split('T')[0],
            trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`
          }));
          setOrders(mapped);
        } catch (err) {
          console.error('❌ API error → fallback to mock data', err);
          // Optional: fall back to static mock data if the API fails
        //   setOrders(getStoredOrders(user.id));
          setError('Failed to load live data – showing cached orders.');
        }
      } else {
        // Offline – use the local mock store directly
        // setOrders(getStoredOrders(user.id));
        setError('Offline – displaying cached orders.');
      }

      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  // --------------------
  // 2️⃣ Render UI based on fetch state
  // --------------------
  if (loading) {
    return <p>Loading your orders…</p>;
  }

  if (error) {
    // A nice, non‑intrusive banner
    return (
      <div style={{ marginBottom: '1rem', color: 'var(--danger)' }}>
        {error}
      </div>
    );
  }

  // --------------------
  // 3️⃣ UI – map `orders` → JSX (same pattern you already have in Orders.tsx)
  // --------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)' }}>
        My Orders
      </h1>

      {orders.map(ord => (
        <div key={ord.id} className="card" style={{ padding: '24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ORDER DATE
              </span>
              <p>{ord.date}</p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                TOTAL
              </span>
              <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                ₹{ord.total.toFixed(2)}
              </p>
            </div>
            <Link
              to={`/order-tracking?id=${ord.id}`}
              className="btn btn-outline btn-sm"
            >
              <Icon name="truck" size={14} />
              Track Delivery
            </Link>
          </div>

          {/* Product thumbnails */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            {ord.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: '56px',
                  height: '56px',
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-tertiary)',
                  position: 'relative'
                }}
                title={item.name}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {item.quantity > 1 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'rgba(15,23,42,0.8)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 4px',
                      borderTopLeftRadius: 'var(--radius-sm)'
                    }}
                  >
                    x{item.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConsumerDashboard;