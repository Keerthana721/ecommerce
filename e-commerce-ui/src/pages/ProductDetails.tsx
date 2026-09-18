import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Product, type Review } from '../utils/mockData';
import { api, enrichBackendProduct } from '../utils/apis/api';
import { Icon } from '../components/ui/Icon';
import { SkeletonDetails } from '../components/ui/Skeleton';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      if (id) {
        try {
          const beProd = await api.products.get(id);
          if (beProd) {
            const enriched = enrichBackendProduct(beProd);
            
            // Query InventoryService for available stock
            try {
              const invRes = await api.inventory.get(beProd.id);
              if (invRes && invRes.success && invRes.data) {
                enriched.stock = invRes.data.availableQuantity;
              }
            } catch (invErr) {
              console.error('Failed to load live stock from inventory service', invErr);
            }

            setProduct(enriched);
            setActiveImage(enriched.images[0]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to load product from API', err);
        }
      }
      setLoading(false);
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <SkeletonDetails />;
  }

  if (!product) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <Icon name="alert-circle" size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>The product you are looking for does not exist or has been removed from catalog database.</p>
        <Link to="/products" className="btn btn-primary">
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);

  const handleQtyChange = (val: number) => {
    const nextVal = Math.max(1, Math.min(val, product.stock));
    setQuantity(nextVal);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast(`Added ${quantity} x "${product.name}" to cart!`, 'success');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    showToast(
      !isWish ? `Added "${product.name}" to wishlist!` : `Removed "${product.name}" from wishlist!`,
      !isWish ? 'success' : 'info'
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please type a comment for your review.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulating API write

    const newReview: Review = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      author: user?.name || 'Anonymous Guest',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [newReview, ...product.reviews];
    
    // Recalculate average rating
    const avgRating = parseFloat(
      (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
    );

    const updatedProduct = {
      ...product,
      reviews: updatedReviews,
      reviewsCount: updatedReviews.length,
      rating: avgRating
    };

    setProduct(updatedProduct);
    setReviewComment('');
    setReviewRating(5);
    setIsSubmittingReview(false);
    showToast('Review submitted successfully! Thank you.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '56px', textAlign: 'left' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link to="/">Home</Link>
        <Icon name="chevron-right" size={14} />
        <Link to="/products">Catalog</Link>
        <Icon name="chevron-right" size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.name}</span>
      </div>

      {/* Main product columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '48px' }} className="details-grid">
        {/* Gallery Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ height: '480px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <img src={activeImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImage(img)} style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid transparent', borderColor: activeImage === img ? 'var(--primary)' : 'transparent', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Tag & Rating row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-primary" style={{ padding: '4px 12px' }}>{product.category}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', color: 'var(--warning)' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={16} fill={i < Math.floor(product.rating) ? 'var(--warning)' : 'none'} style={{ color: i < Math.floor(product.rating) ? 'var(--warning)' : 'var(--text-light)' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{product.rating}</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({product.reviewsCount} reviews)</span>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginBottom: '12px' }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>₹{product.price}</span>
              {product.originalPrice && (
                <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{product.originalPrice}</span>
              )}
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {product.description}
          </p>

          {/* Stock Alert */}
          <div>
            {product.stock > 0 ? (
              product.stock <= 10 ? (
                <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="alert-circle" size={14} />
                  <span>Only {product.stock} items left in stock - order soon!</span>
                </span>
              ) : (
                <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="check-circle" size={14} />
                  <span>In Stock (Ready to Ship)</span>
                </span>
              )
            ) : (
              <span style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon name="close" size={14} />
                <span>Out of Stock</span>
              </span>
            )}
          </div>

          {/* Purchase section */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '4px', backgroundColor: 'var(--bg-tertiary)' }}>
                  <button onClick={() => handleQtyChange(quantity - 1)} className="btn-ghost" style={{ padding: '6px 12px', cursor: 'pointer' }} aria-label="Decrease quantity">
                    <Icon name="minus" size={14} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                  <button onClick={() => handleQtyChange(quantity + 1)} className="btn-ghost" style={{ padding: '6px 12px', cursor: 'pointer' }} aria-label="Increase quantity">
                    <Icon name="plus" size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button onClick={handleAddToCart} className="btn btn-primary btn-lg" style={{ flex: 1, height: '48px' }}>
                  <Icon name="cart" size={18} />
                  <span>Add to Shopping Cart</span>
                </button>
                <button onClick={handleToggleWishlist} className="btn btn-secondary btn-lg" style={{ width: '56px', height: '48px', padding: 0, color: isWish ? 'var(--danger)' : 'var(--text-secondary)' }} aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}>
                  <Icon name="heart" size={20} fill={isWish ? 'var(--danger)' : 'none'} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs section */}
      <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '24px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('desc')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'desc' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'desc' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'desc' ? 600 : 500 }}>
            Description
          </button>
          <button onClick={() => setActiveTab('specs')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'specs' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'specs' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'specs' ? 600 : 500 }}>
            Specifications
          </button>
          <button onClick={() => setActiveTab('reviews')} style={{ padding: '12px 8px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'reviews' ? 600 : 500 }}>
            Customer Reviews ({product.reviewsCount})
          </button>
        </div>

        {activeTab === 'desc' && (
          <div style={{ maxWidth: '720px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <p>{product.description}</p>
            <p style={{ marginTop: '16px' }}>Manufactured under strict environmental standards using recyclable packaging materials. Comes with a 2-year warranty card and standard quick start instruction booklets.</p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div style={{ maxWidth: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <tbody>
                {product.specs.map((sp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)', width: '200px', backgroundColor: 'var(--bg-tertiary)' }}>{sp.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-primary)' }}>{sp.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '48px' }} className="reviews-tab-grid">
            {/* Reviews display list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>What Clients Say</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {product.reviews.map((rev) => (
                  <div key={rev.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={rev.avatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{rev.author}</h5>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{rev.date}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', color: 'var(--warning)', gap: '2px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Icon key={i} name="star" size={14} fill={i < rev.rating ? 'var(--warning)' : 'none'} style={{ color: i < rev.rating ? 'var(--warning)' : 'var(--text-light)' }} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{rev.comment}</p>
                  </div>
                ))}

                {product.reviews.length === 0 && (
                  <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            </div>

            {/* Review form */}
            <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Write a Review</h3>
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="label">Rating:</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', padding: '2px' }}
                        aria-label={`Rate ${star} Stars`}
                      >
                        <Icon name="star" size={22} fill={star <= reviewRating ? 'var(--warning)' : 'none'} style={{ color: star <= reviewRating ? 'var(--warning)' : 'var(--text-light)' }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="review-comment-textarea">Your Review Message</label>
                  <textarea
                    id="review-comment-textarea"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you liked or disliked about this product..."
                    className="input-field"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px' }} disabled={isSubmittingReview}>
                  {isSubmittingReview ? <span>Submitting...</span> : <span>Submit Review</span>}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

      <style>{`
        @media (max-width: 768px) {
          .details-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .reviews-tab-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
