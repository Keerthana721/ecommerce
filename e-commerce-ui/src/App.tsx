import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';

// Layout Wrapper
import { Layout } from './components/layout/Layout';

// Lazy Loaded Pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ProductListing = React.lazy(() => import('./pages/ProductListing'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Search = React.lazy(() => import('./pages/Search'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AddressManagement = React.lazy(() => import('./pages/AddressManagement'));
const Payment = React.lazy(() => import('./pages/Payment'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard'));
const ConsumerDashboard = React.lazy(() => import('./pages/consumerDashboard'));

const Contact = React.lazy(() => import('./pages/Contact'));

// Page Fallback Loading Spinner
const PageLoader: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '16px' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Loading section components...</span>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <ToastProvider>
                <BrowserRouter>
                  <Layout>
                    <React.Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/products" element={<ProductListing />} />
                        <Route path="/products/:id" element={<ProductDetails />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/address-management" element={<AddressManagement />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/order-tracking" element={<OrderTracking />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/seller" element={<SellerDashboard />} />
                        <Route path="/consumer" element={<ConsumerDashboard />} />
                        <Route path="/contact" element={<Contact />} />
                      </Routes>
                    </React.Suspense>
                  </Layout>
                </BrowserRouter>
              </ToastProvider>
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
