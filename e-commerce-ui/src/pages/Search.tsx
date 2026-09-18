import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getStoredProducts, type Product } from '../utils/mockData';
import { Icon } from '../components/ui/Icon';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const products = getStoredProducts();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    setSearchInput(query);
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.category.toLowerCase().includes(lowerQuery)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle auto-suggestions while typing
  useEffect(() => {
    if (searchInput.trim().length > 1) {
      const lowerInput = searchInput.toLowerCase();
      const matches = products
        .filter((p) => p.name.toLowerCase().includes(lowerInput))
        .map((p) => p.name)
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const selectSuggestion = (val: string) => {
    setSearchInput(val);
    setSearchParams({ q: val });
    setSuggestions([]);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', textAlign: 'left' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Search Creations</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Find specific products in our global database.</p>
      </div>

      {/* Search Input Container */}
      <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Type to search headphones, smartwatches, leather..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input-field"
              style={{ width: '100%', height: '48px', paddingLeft: '44px', fontSize: '1rem', borderRadius: 'var(--radius-md)' }}
            />
            <Icon name="search" size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', height: '48px' }}>
            Search
          </button>
        </form>

        {/* Suggestion Dropdown */}
        {suggestions.length > 0 && (
          <div style={{ position: 'absolute', top: '52px', left: 0, right: 0, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden' }}>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => selectSuggestion(sug)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem' }}
                className="dropdown-item"
              >
                <Icon name="search" size={14} style={{ color: 'var(--text-light)' }} />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div>
        {query && (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px', color: 'var(--text-secondary)' }}>
            {results.length} {results.length === 1 ? 'result' : 'results'} found for "{query}"
          </h2>
        )}

        {results.length > 0 ? (
          <div className="grid-cols-4">
            {results.map((prod) => {
              const isWish = isInWishlist(prod.id);
              return (
                <Link key={prod.id} to={`/products/${prod.id}`} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                  <button onClick={(e) => handleToggleWishlist(e, prod)} style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWish ? 'var(--danger)' : 'var(--text-muted)' }}>
                    <Icon name="heart" size={18} fill={isWish ? 'var(--danger)' : 'none'} />
                  </button>
                  <div style={{ overflow: 'hidden', height: '200px', backgroundColor: 'var(--bg-tertiary)' }}>
                    <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--primary)' }}>{prod.category}</span>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{prod.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="star" size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{prod.rating}</span>
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
          query && (
            <div style={{ padding: '64px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', maxWidth: '600px', margin: '40px auto' }}>
              <Icon name="alert-circle" size={48} style={{ marginBottom: '16px', color: 'var(--text-light)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No Products Found</h3>
              <p style={{ fontSize: '0.9rem' }}>We couldn\'t find any items matching "{query}". Please double-check spelling or try searching generic terms.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Search;
