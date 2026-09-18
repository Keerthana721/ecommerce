import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CATEGORIES, type Product } from '../utils/mockData';
import { api, enrichBackendProduct } from '../utils/apis/api';
import { Icon } from '../components/ui/Icon';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [maxPrice, setMaxPrice] = useState(300);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [isGridView, setIsGridView] = useState(true);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Sync category param
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Fetch the catalog from the backend.
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const beProds = await api.products.list();
        setProducts(beProds.map(enrichBackendProduct));
      } catch (err) {
        console.error('Failed to load products from API', err);
        setProducts([]);
      }
      setLoading(false);
    };

    loadProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Stock Filter
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Default / Featured
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, maxPrice, minRating, onlyInStock, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setMaxPrice(300);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(product, 1);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    toggleWishlist(product);
    const added = !isInWishlist(product.id);
    showToast(
      added ? `Added "${product.name}" to wishlist!` : `Removed "${product.name}" from wishlist!`,
      added ? 'success' : 'info'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Store Catalog</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Explore our range of premium selections across diverse categories.</p>
      </div>

      {/* Control bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Showing <strong>{filteredProducts.length}</strong> items
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
              style={{ padding: '6px 12px', height: '36px', fontSize: '0.85rem' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Grid vs List View */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px', backgroundColor: 'var(--bg-tertiary)' }}>
            <button onClick={() => setIsGridView(true)} className="btn-ghost" style={{ padding: '6px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: isGridView ? 'var(--bg-secondary)' : 'transparent', color: isGridView ? 'var(--primary)' : 'var(--text-secondary)' }} aria-label="Grid view">
              <Icon name="grid" size={16} />
            </button>
            <button onClick={() => setIsGridView(false)} className="btn-ghost" style={{ padding: '6px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: !isGridView ? 'var(--bg-secondary)' : 'transparent', color: !isGridView ? 'var(--primary)' : 'var(--text-secondary)' }} aria-label="List view">
              <Icon name="list" size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }} className="catalog-grid">
        {/* Filters Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Departments</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => { setSelectedCategory('all'); setSearchParams({}); }} style={{ display: 'flex', justifyContent: 'space-between', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: selectedCategory === 'all' ? 600 : 400, color: selectedCategory === 'all' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                <span>All Departments</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); setSearchParams({ category: cat.id }); }} style={{ display: 'flex', justifyContent: 'space-between', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: selectedCategory === cat.id ? 600 : 400, color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Max Price</h4>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>

          {/* Rating Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Minimum Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[4, 3, 2].map((stars) => (
                <label key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input type="radio" name="rating-filter" checked={minRating === stars} onChange={() => setMinRating(stars)} style={{ accentColor: 'var(--primary)' }} />
                  <div style={{ display: 'flex', gap: '2px', color: 'var(--warning)' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Icon key={i} name="star" size={14} fill={i < stars ? 'var(--warning)' : 'none'} style={{ color: i < stars ? 'var(--warning)' : 'var(--text-light)' }} />
                    ))}
                  </div>
                  <span>& Up</span>
                </label>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="radio" name="rating-filter" checked={minRating === 0} onChange={() => setMinRating(0)} style={{ accentColor: 'var(--primary)' }} />
                <span>Any Rating</span>
              </label>
            </div>
          </div>

          {/* Availability Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="stock-toggle"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="stock-toggle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500 }}>
              Only In Stock Items
            </label>
          </div>

          {/* Reset Filters */}
          <button onClick={handleClearFilters} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <Icon name="close" size={14} />
            <span>Reset Filters</span>
          </button>
        </aside>

        {/* Product Cards Container */}
        <main>
          {loading ? (
            <div className="grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            isGridView ? (
              <div className="grid-cols-4">
                {filteredProducts.map((prod) => {
                  const isWish = isInWishlist(prod.id);
                  return (
                    <Link key={prod.id} to={`/products/${prod.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                      <button onClick={(e) => handleToggleWishlist(e, prod)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWish ? 'var(--danger)' : 'var(--text-muted)' }} aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}>
                        <Icon name="heart" size={18} fill={isWish ? 'var(--danger)' : 'none'} />
                      </button>
                      <div style={{ overflow: 'hidden', height: '180px', backgroundColor: 'var(--bg-tertiary)' }}>
                        <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>{prod.category}</span>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{prod.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="star" size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{prod.rating}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({prod.reviewsCount})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>₹{prod.price}</span>
                          <button onClick={(e) => handleAddToCart(e, prod)} className="btn btn-primary btn-sm">
                            <Icon name="plus" size={14} />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              // List View Layout
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {filteredProducts.map((prod) => {
                  const isWish = isInWishlist(prod.id);
                  return (
                    <Link key={prod.id} to={`/products/${prod.id}`} className="card list-card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ height: '100%', minHeight: '160px', backgroundColor: 'var(--bg-tertiary)' }}>
                        <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>{prod.category}</span>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '2px' }}>{prod.name}</h3>
                          </div>
                          <button onClick={(e) => handleToggleWishlist(e, prod)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWish ? 'var(--danger)' : 'var(--text-muted)' }} aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}>
                            <Icon name="heart" size={18} fill={isWish ? 'var(--danger)' : 'none'} />
                          </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {prod.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: 700 }}>₹{prod.price}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="star" size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{prod.rating}</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({prod.reviewsCount} reviews)</span>
                          </div>
                          <button onClick={(e) => handleAddToCart(e, prod)} className="btn btn-primary" style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}>
                            <Icon name="cart" size={16} />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )
          ) : (
            <div style={{ padding: '64px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
              <Icon name="alert-circle" size={48} style={{ marginBottom: '16px', color: 'var(--text-light)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No Products Match Your Filters</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Try loosening your price constraints or department filters.</p>
              <button onClick={handleClearFilters} className="btn btn-primary">
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .catalog-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .list-card { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductListing;
