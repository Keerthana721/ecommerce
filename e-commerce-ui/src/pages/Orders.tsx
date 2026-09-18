import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStoredOrders, PRODUCTS, type Order } from '../utils/mockData';
import { api } from '../utils/apis/api';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Invoice state variables
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleViewInvoice = async (orderId: string) => {
    setLoadingInvoice(true);
    setIsInvoiceModalOpen(true);
    const online = await api.status.check();
    if (online) {
      try {
        const res = await api.invoices.getByOrder(orderId);
        if (res && res.success && res.data) {
          setActiveInvoice(res.data);
          setLoadingInvoice(false);
          return;
        }
      } catch (err) {
        console.error('Failed to load invoice from API, falling back to local simulation', err);
      }
    }
    
    // Fallback: Generate mock invoice details matching this order on-the-fly
    const matchedOrder = orders.find((o) => o.id === orderId);
    setActiveInvoice({
      id: Math.floor(10000 + Math.random() * 90000),
      orderId: Number(orderId) || 101,
      invoiceNumber: `INV-2026-F${orderId.slice(-4)}`,
      totalAmount: matchedOrder ? matchedOrder.total : 150.00,
      status: 'PAID',
      issuedDate: matchedOrder ? new Date(matchedOrder.date).toISOString() : new Date().toISOString(),
      dueDate: matchedOrder ? new Date(new Date(matchedOrder.date).getTime() + 14 * 86400000).toISOString() : new Date().toISOString()
    });
    setLoadingInvoice(false);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      const online = await api.status.check();
      if (online) {
        try {
          const beOrders = await api.orders.listByUser(user.id);
          const mapped: Order[] = beOrders.map((o: any) => {
            const formattedDate = o.createdAt ? o.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
            return {
              id: o.id.toString(),
              userId: o.userId.toString(),
              items: o.items.map((it: any) => {
                // Find image url from local asset catalog
                const matchImg = PRODUCTS.find((p) => p.id === `prod-${it.productId}` || p.id === it.productId.toString());
                return {
                  productId: it.productId.toString(),
                  name: it.productName,
                  image: matchImg ? matchImg.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
                  price: parseFloat(it.price),
                  quantity: it.quantity
                };
              }),
              subtotal: o.totalAmount,
              discount: 0,
              tax: o.totalAmount * 0.08,
              shipping: o.totalAmount > 150 ? 0 : 9.99,
              total: o.totalAmount,
              address: {
                name: user.name,
                street: o.shippingAddress || 'No Street Address',
                city: '',
                state: '',
                zipCode: '',
                country: 'United States'
              },
              paymentMethod: 'card',
              status: o.status.toLowerCase() === 'pending' ? 'ordered' : o.status.toLowerCase(),
              date: formattedDate,
              trackingNumber: `TRK-${Math.floor(100000 + Math.random() * 900000)}`
            };
          });
          setOrders(mapped);
          return;
        } catch (err) {
          console.error('Failed to load orders from API, falling back to local', err);
        }
      }
      // Fallback
      setOrders(getStoredOrders(user.id));
    };

    loadOrders();
  }, [user, navigate]);

  if (!user) return null;

  const toggleInvoice = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'ordered': return 'badge-primary';
      case 'packaging': return 'badge-warning';
      case 'shipped': return 'badge-warning';
      case 'out_for_delivery': return 'badge-warning';
      case 'delivered': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  const formatStatusText = (status: Order['status']) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Purchase Order History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track packaging states, view billing statements, and check delivery dates.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((ord) => {
          const isExpanded = expandedOrderId === ord.id;
          return (
            <div key={ord.id} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Order Header Summary Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>ORDER REGISTERED</span>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{ord.date}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>ORDER REFERENCE</span>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>{ord.id}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>TOTAL VALUE</span>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '2px', color: 'var(--primary)' }}>₹{ord.total.toFixed(2)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${getStatusColor(ord.status)}`} style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    {formatStatusText(ord.status)}
                  </span>
                  
                  <Link to={`/order-tracking?id=${ord.id}`} className="btn btn-outline btn-sm">
                    <Icon name="truck" size={14} />
                    <span>Track Delivery</span>
                  </Link>

                  <button onClick={() => toggleInvoice(ord.id)} className="btn btn-secondary btn-sm" aria-label="Toggle invoice detail view">
                    <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={14} />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              {/* Items preview images row */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                {ord.items.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }} title={item.name}>
                    <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {item.quantity > 1 && (
                      <span style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '1px 4px', borderTopLeftRadius: 'var(--radius-sm)' }}>
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Expanded Invoice details dropdown */}
              {isExpanded && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', borderTop: '1px dashed var(--border-color)', paddingTop: '20px', marginTop: '4px' }} className="invoice-grid">
                  {/* Shipping information details */}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>Delivery Address</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong>{ord.address.name}</strong>
                      <br />
                      {ord.address.street}
                      <br />
                      {ord.address.city}, {ord.address.state} {ord.address.zipCode}
                      <br />
                      {ord.address.country}
                    </p>
                    <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span>Payment Method: </span>
                      <strong style={{ textTransform: 'uppercase' }}>{ord.paymentMethod}</strong>
                    </div>
                  </div>

                  {/* Calculations details */}
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Invoice Statement</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal</span>
                        <span>₹{ord.subtotal.toFixed(2)}</span>
                      </div>
                      {ord.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                          <span>Discount Applied</span>
                          <span>-₹{ord.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Shipping</span>
                        <span>{ord.shipping === 0 ? 'FREE' : `₹${ord.shipping.toFixed(2)}`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Sales Tax (8%)</span>
                        <span>₹{ord.tax.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        <span>Grand Total Paid</span>
                        <span>₹{ord.total.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => handleViewInvoice(ord.id)}
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
                      >
                        <Icon name="search" size={12} />
                        <span>View Digital Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div style={{ padding: '80px 24px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            <Icon name="package" size={48} style={{ color: 'var(--text-light)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '8px' }}>No Orders Found</h2>
            <p style={{ fontSize: '0.9rem', marginBottom: '24px' }}>You haven\'t made any purchases yet on this platform.</p>
            <Link to="/products" className="btn btn-primary">
              <span>View Catalog Catalog</span>
            </Link>
          </div>
        )}
      </div>

      {/* Invoice Modal Overlay */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Official Tax Invoice">
        {loadingInvoice ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span className="spinner" style={{ marginBottom: '8px' }}></span>
            <p>Retrieving digital receipt metadata...</p>
          </div>
        ) : activeInvoice ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>DIYORA MARKET</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>GSTIN: 33AAAAA1111A1Z1</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>{activeInvoice.status}</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '6px' }}>{activeInvoice.invoiceNumber}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Customer Details:</p>
                <p style={{ marginTop: '4px' }}>{user.name}</p>
                <p>{user.email}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><span style={{ fontWeight: 600 }}>Billing Date:</span> {activeInvoice.issuedDate ? new Date(activeInvoice.issuedDate).toLocaleDateString() : 'N/A'}</p>
                <p style={{ marginTop: '2px' }}><span style={{ fontWeight: 600 }}>Payment Due:</span> {activeInvoice.dueDate ? new Date(activeInvoice.dueDate).toLocaleDateString() : 'Immediate'}</p>
                <p style={{ marginTop: '2px' }}><span style={{ fontWeight: 600 }}>Order Reference:</span> #{activeInvoice.orderId}</p>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <span>Subtotal Charged</span>
                <span>₹{activeInvoice.totalAmount.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Payment processed securely. Thank you for shopping with us!</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="btn btn-primary" onClick={() => setIsInvoiceModalOpen(false)}>Close Statement</button>
            </div>
          </div>
        ) : (
          <p style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>Failed to pull invoice data. Please try again.</p>
        )}
      </Modal>

      <style>{`
        @media (max-width: 640px) {
          .invoice-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Orders;
