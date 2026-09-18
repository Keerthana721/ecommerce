import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStoredProducts, saveStoredProducts, getAllStoredOrders, updateOrderStatus, type Product, type Order } from '../utils/mockData';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import userApi from '../utils/apis/userApi';

interface DashboardStats {
  gmv: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  // const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({ gmv: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: 'CONSUMER' | 'MANAGER' | 'ADMIN'; date: string }>>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'users' | 'orders' | 'payments'>('stats');
  const [orders, setOrders] = useState<Order[]>([]);

  // Edit Product Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

useEffect(() => {
  const loadDashboard = async () => {
    try {
      const list = getStoredProducts();
      setProducts(list);

      const ordersList = getAllStoredOrders();
      setOrders(ordersList);

      const computedGmv = ordersList.reduce(
        (sum, order) => sum + order.total,
        0
      );

      const response = await userApi.getAllUsers();

      let totalUsers = 0;

      if (response.success) {
        setUsers(response.data);
        totalUsers = response.data.length;
      }

      setStats({
        gmv: 4325.5 + computedGmv,
        totalOrders: 14 + ordersList.length,
        totalProducts: list.length,
        totalUsers: totalUsers,
      });

    } catch (error) {
      console.error("Failed to load dashboard:", error);
    }
  };

  loadDashboard();
}, []);

  const handleUpdateStatus = (orderId: string, nextStatus: Order['status']) => {
    updateOrderStatus(orderId, nextStatus);
    const updated = getAllStoredOrders();
    setOrders(updated);

    const computedGmv = updated.reduce((sum, o) => sum + o.total, 0);
    setStats(prev => ({
      ...prev,
      gmv: 4325.50 + computedGmv,
      totalOrders: 14 + updated.length
    }));

    showToast(`Order status updated to "${nextStatus.replace(/_/g, ' ')}"!`, 'success');
  };

  if (!user || user.role !== 'ADMIN') return null;

  // Optimistic delete product
  const handleDeleteProduct = (prodId: string) => {
    if (confirm('Are you sure you want to delete this product from catalog?')) {
      const updatedList = products.filter((p) => p.id !== prodId);
      setProducts(updatedList);
      saveStoredProducts(updatedList);
      showToast('Product deleted from catalog directory.', 'info');
    }
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveProductChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPrice = parseFloat(editPrice);
    const parsedStock = parseInt(editStock);

    if (isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedStock) || parsedStock < 0) {
      showToast('Please insert valid price and stock values.', 'error');
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      price: parsedPrice,
      stock: parsedStock
    };

    const updatedList = products.map((p) => (p.id === editingProduct.id ? updatedProduct : p));
    setProducts(updatedList);
    saveStoredProducts(updatedList);
    setIsEditModalOpen(false);
    showToast('Product settings updated successfully!', 'success');
  };

  // User Actions
  const handleToggleUserRole = (userId: string) => {
    const list = users.map((u) => {
      if (u.id === userId) {
        const nextRole = u.role === 'CONSUMER' ? 'MANAGER' : u.role === 'MANAGER' ? 'ADMIN' : 'CONSUMER';
        showToast(`Updated user role to ${nextRole}.`, 'success');
        return { ...u, role: nextRole as any };
      }
      return u;
    });
    setUsers(list);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'usr-adm-03') {
      showToast('Cannot delete root administrator account.', 'error');
      return;
    }
    if (confirm('Are you sure you want to suspend this user account?')) {
      setUsers(users.filter((u) => u.id !== userId));
      showToast('User account suspended from directory.', 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Admin Dashboard Console</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage catalog inventory database, user accounts, and financial performance reports.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '24px' }}>
        <button onClick={() => setActiveTab('stats')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'stats' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'stats' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'stats' ? 600 : 500 }}>
          Overview & Charts
        </button>
        <button onClick={() => setActiveTab('products')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'products' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'products' ? 600 : 500 }}>
          Catalog Manager ({products.length})
        </button>
        <button onClick={() => setActiveTab('users')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'users' ? 600 : 500 }}>
          User Directory ({users.length})
        </button>
        <button onClick={() => setActiveTab('orders')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'orders' ? 600 : 500 }}>
          Order Approvals ({orders.length})
        </button>
        <button onClick={() => setActiveTab('payments')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'payments' ? 600 : 500 }}>
          Payment Ledger ({orders.length})
        </button>
      </div>

      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}><Icon name="dollar-sign" size={24} /></div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>GROSS MERCHANDISE VALUE</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>₹{stats.gmv.toFixed(2)}</h3>
              </div>
            </div>
            <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}><Icon name="check-circle" size={24} /></div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOTAL SALES COMPLETED</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{stats.totalOrders}</h3>
              </div>
            </div>
            <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)' }}><Icon name="package" size={24} /></div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ACTIVE PRODUCTS</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{stats.totalProducts}</h3>
              </div>
            </div>
            <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}><Icon name="user" size={24} /></div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>REGISTERED USERS</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2px' }}>{stats.totalUsers}</h3>
              </div>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Quarterly Revenue Growth Report</h3>
            <div style={{ position: 'relative', height: '240px', width: '100%' }}>
              <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />

                {/* Area under line */}
                <path d="M 0 160 L 100 120 L 200 130 L 300 90 L 400 70 L 500 40 L 500 200 L 0 200 Z" fill="url(#chartGrad)" />
                {/* Trend line */}
                <path d="M 0 160 L 100 120 L 200 130 L 300 90 L 400 70 L 500 40" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />

                {/* Data points */}
                <circle cx="0" cy="160" r="5" fill="var(--primary)" />
                <circle cx="100" cy="120" r="5" fill="var(--primary)" />
                <circle cx="200" cy="130" r="5" fill="var(--primary)" />
                <circle cx="300" cy="90" r="5" fill="var(--primary)" />
                <circle cx="400" cy="70" r="5" fill="var(--primary)" />
                <circle cx="500" cy="40" r="5" fill="var(--primary)" />

                {/* X labels */}
                <text x="0" y="190" fill="var(--text-light)" fontSize="10" textAnchor="middle">Jan</text>
                <text x="100" y="190" fill="var(--text-light)" fontSize="10" textAnchor="middle">Feb</text>
                <text x="200" y="190" fill="var(--text-light)" fontSize="10" textAnchor="middle">Mar</text>
                <text x="300" y="190" fill="var(--text-light)" fontSize="10" textAnchor="middle">Apr</text>
                <text x="400" y="190" fill="var(--text-light)" fontSize="10" textAnchor="middle">May</text>
                <text x="500" y="190" fill="var(--text-light)" fontSize="10" textAnchor="middle">Jun</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>Product Details</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Stock Levels</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={prod.images[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{prod.name}</span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {prod.id}</p>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textTransform: 'capitalize' }}>{prod.category}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>₹{prod.price.toFixed(2)}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ color: prod.stock <= 10 ? 'var(--warning)' : 'inherit', fontWeight: prod.stock <= 10 ? 600 : 400 }}>
                      {prod.stock} units
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button onClick={() => handleOpenEditModal(prod)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }} aria-label="Edit product price and stock">
                        <Icon name="edit" size={14} />
                      </button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '6px' }} aria-label="Delete product">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '16px', textAlign: 'left' }}>User Details</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Email Address</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Registered Date</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>System Role</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '16px' }}>{u.date}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'MANAGER' ? 'badge-primary' : 'badge-success'}`}>

                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button onClick={() => handleToggleUserRole(u.id)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                        Toggle Role
                      </button>
                      <button onClick={() => handleDeleteUser(u.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '6px' }} aria-label="Suspend user">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Lifecycle Explanation Card */}
          <div className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--primary)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>
              <Icon name="shield-check" size={18} />
              <span>Order Lifecycle & Status Approval Policies</span>
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Who Approves Orders?</strong> The administration team (<strong>Keerthana, Dhiya, Deepak, and Diyora</strong>) has sole authority to verify payments, allocate stock, and dispatch order statuses.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '12px', fontSize: '0.8rem' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                <strong>1. ordered</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Customer submitted transaction.</p>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                <strong>2. packaging</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Admin packed parcel in warehouse.</p>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                <strong>3. shipped</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Handed to India Post / DTDC courier.</p>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                <strong>4. out_for_delivery</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Local courier agent dispatching.</p>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                <strong>5. delivered</strong>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Fulfillment successfully completed.</p>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Items</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', fontWeight: 600, fontFamily: 'monospace' }}>{ord.id}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{ord.date}</td>
                    <td style={{ padding: '16px' }}>{ord.items.length} items</td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>₹{ord.total.toFixed(2)}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge ${ord.status === 'ordered' ? 'badge-info' :
                          ord.status === 'packaging' ? 'badge-primary' :
                            ord.status === 'shipped' ? 'badge-warning' :
                              ord.status === 'out_for_delivery' ? 'badge-secondary' : 'badge-success'
                        }`} style={{ textTransform: 'capitalize' }}>
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {ord.status === 'ordered' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'packaging')} className="btn btn-primary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                            Approve & Pack
                          </button>
                        )}
                        {ord.status === 'packaging' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'shipped')} className="btn btn-warning btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem', color: '#000000' }}>
                            Dispatch Ship
                          </button>
                        )}
                        {ord.status === 'shipped' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'out_for_delivery')} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                            Out for Delivery
                          </button>
                        )}
                        {ord.status === 'out_for_delivery' && (
                          <button onClick={() => handleUpdateStatus(ord.id, 'delivered')} className="btn btn-success btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                            Confirm Delivery
                          </button>
                        )}
                        {ord.status === 'delivered' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fulfillment Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No active customer orders placed in the system directory yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Card */}
          <div className="card" style={{ padding: '20px', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--success)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600, color: 'var(--success)', marginBottom: '8px' }}>
              <Icon name="shield-check" size={18} />
              <span>Payment Registry Ledger</span>
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Verify transaction statuses, gateway references, and billing details processed through the payment API layer.
            </p>
          </div>

          {/* Payments Table */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Transaction Ref</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Customer ID</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Payment Method</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '16px', textAlign: 'center' }}>Gateway Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px', fontWeight: 600, fontFamily: 'monospace' }}>TXN-{ord.id.substring(4)}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{ord.date}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{ord.userId}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Icon name="credit-card" size={12} />
                        <span>{ord.paymentMethod}</span>
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 600 }}>₹{ord.total.toFixed(2)}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-success' : 'badge-info'
                        }`} style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {ord.status === 'delivered' ? 'settled' : 'cleared'}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No payment transactions recorded in the gateway registry yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Product Inventory">
        {editingProduct && (
          <form onSubmit={handleSaveProductChanges} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <img src={editingProduct.images[0]} alt="" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
              <div>
                <span style={{ fontWeight: 600 }}>{editingProduct.name}</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {editingProduct.id}</p>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="edit-product-price">Product Price (₹)</label>
              <input id="edit-product-price" type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="input-field" required />
            </div>

            <div className="form-group">
              <label className="label" htmlFor="edit-product-stock">Stock Units</label>
              <input id="edit-product-stock" type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="input-field" required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '44px', marginTop: '8px' }}>
              <Icon name="check" size={16} />
              <span>Save Inventory Changes</span>
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
