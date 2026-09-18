import React from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, getStoredProducts } from '../utils/mockData';
import { Icon } from '../components/ui/Icon';

const Categories: React.FC = () => {
  const products = getStoredProducts();

  // Helper to dynamically calculate total items in category
  const countCategoryProducts = (catId: string) => {
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Store Departments</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Explore our range of premium selections across diverse categories.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {CATEGORIES.map((cat) => {
          const count = countCategoryProducts(cat.id);
          return (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '380px',
                position: 'relative'
              }}
            >
              {/* Count Overlay Badge */}
              <span
                className="badge badge-primary"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10,
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  padding: '4px 10px'
                }}
              >
                {count} {count === 1 ? 'Item' : 'Items'}
              </span>

              <div style={{ height: '240px', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
              </div>

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {cat.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginTop: 'auto', paddingTop: '10px' }}>
                  <span>Shop Category</span>
                  <Icon name="arrow-right" size={14} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
