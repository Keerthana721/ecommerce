import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import productApi, { enrichBackendProduct, type ProductPayload } from '../utils/apis/productApi';

interface SellerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  category: string;
  stock: number;
  images: string[];
}

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'MANAGER') {
      showToast('Unauthorized access. Seller role required.', 'error');
      navigate('/login?role=seller');
    }
  }, [navigate, showToast, user]);

  useEffect(() => {
    if (!user || user.role !== 'MANAGER') return;

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const products = await productApi.list();
        setSellerProducts(products.map(enrichBackendProduct));
      } catch (error) {
        console.error('Failed to load products from API', error);
        setSellerProducts([]);
        showToast('Unable to load products. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [showToast, user]);

  if (!user || user.role !== 'MANAGER') return null;

  const closeModal = () => setIsModalOpen(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setStock('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: SellerProduct) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category);
    setStock(String(product.stock));
    setImageUrl(product.images[0] || '');
    setIsModalOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (!name.trim() || !description.trim() || !category.trim() || !imageUrl.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isInteger(parsedStock) || parsedStock < 0) {
      showToast('Enter valid product details.', 'error');
      return;
    }

    const payload: ProductPayload = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      sku: editingProduct?.sku || `SKU-${Date.now()}`,
      category: category.trim(),
      quantity: parsedStock,
      imageUrl: imageUrl.trim(),
      isActive: true
    };

    setIsSaving(true);
    try {
      const response = editingProduct
        ? await productApi.update(editingProduct.id, payload)
        : await productApi.create(payload);
      if (response?.success === false) throw new Error(response.message || 'The product service rejected the request.');

      const saved = response ? enrichBackendProduct(response) : null;
      const product: SellerProduct = {
        id: saved?.id || editingProduct?.id || `new-${Date.now()}`,
        name: saved?.name || payload.name,
        description: saved?.description || payload.description,
        price: saved?.price ?? payload.price,
        sku: saved?.sku || payload.sku,
        category: saved?.category || payload.category,
        stock: saved?.stock ?? payload.quantity,
        images: saved?.images?.length ? saved.images : [payload.imageUrl]
      };

      setSellerProducts(current => editingProduct
        ? current.map(item => item.id === editingProduct.id ? product : item)
        : [product, ...current]);
      showToast(editingProduct ? 'Product updated successfully.' : 'Product created successfully.', 'success');
      closeModal();
    } catch (error: any) {
      console.error('Failed to save product', error);
      showToast(error?.response?.data?.message || error?.message || 'Unable to save product. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productApi.delete(id);
      setSellerProducts(current => current.filter(product => product.id !== id));
      showToast('Product deleted.', 'info');
    } catch (error: any) {
      console.error('Failed to delete product', error);
      showToast(error?.response?.data?.message || error?.message || 'Unable to delete product. Please try again.', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Seller Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your product inventory.</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ height: '44px' }}>
          <Icon name="plus" size={16} />
          <span>Register New Product</span>
        </button>
      </div>

      <div className="card" style={{ padding: '28px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '20px' }}>Your Product Listings</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product Details</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Stock</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}>Loading products…</td></tr>
              : sellerProducts.length === 0 ? <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}>No products found.</td></tr>
                : sellerProducts.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {product.images[0] && <img src={product.images[0]} alt="" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />}
                      <span style={{ fontWeight: 600 }}>{product.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{product.price}</td>
                    <td style={{ padding: '12px 16px' }}>{product.stock} units</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => openEditModal(product)} className="btn btn-secondary btn-sm" aria-label="Edit product"><Icon name="edit" size={12} /></button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} aria-label="Delete product"><Icon name="trash" size={12} /></button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Update Product' : 'Register New Product'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label className="form-group"><span className="label">Product Name</span><input value={name} onChange={event => setName(event.target.value)} className="input-field" required /></label>
          <label className="form-group"><span className="label">Description</span><textarea rows={3} value={description} onChange={event => setDescription(event.target.value)} className="input-field" required /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label className="form-group"><span className="label">Price (₹)</span><input type="number" min="0" step="0.01" value={price} onChange={event => setPrice(event.target.value)} className="input-field" required /></label>
            <label className="form-group"><span className="label">Stock Units</span><input type="number" min="0" step="1" value={stock} onChange={event => setStock(event.target.value)} className="input-field" required /></label>
          </div>
          <label className="form-group"><span className="label">Category</span><input value={category} onChange={event => setCategory(event.target.value)} className="input-field" required /></label>
          <label className="form-group"><span className="label">Product Image URL</span><input type="url" value={imageUrl} onChange={event => setImageUrl(event.target.value)} className="input-field" required /></label>
          <button type="submit" className="btn btn-primary" style={{ height: '44px' }} disabled={isSaving}><Icon name="check" size={16} /><span>{isSaving ? 'Saving…' : 'Save Product'}</span></button>
        </form>
      </Modal>
    </div>
  );
};

export default SellerDashboard;
