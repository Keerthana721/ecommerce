import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { saveOrder, type Order } from '../utils/mockData';
import { api } from '../utils/apis/api';
import { Icon } from '../components/ui/Icon';

const Payment: React.FC = () => {
  const { user } = useAuth();
  const { cart, subtotal, discount, shipping, tax, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [checkoutInfo, setCheckoutInfo] = useState<any>(null);
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Google Pay & Error states
  const [gpayUpi, setGpayUpi] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  const [processing, setProcessing] = useState(false);
  const [stepText, setStepText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const stored = sessionStorage.getItem('ec_checkout_data');
    if (!stored) {
      showToast('No active checkout session. Returning to Cart.', 'error');
      navigate('/cart');
      return;
    }
    setCheckoutInfo(JSON.parse(stored));
  }, [user, navigate]);

  if (!user || !checkoutInfo) return null;

  const handleCardFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const groups = rawVal.match(/.{1,4}/g);
    if (groups) {
      setCardNumber(groups.slice(0, 4).join(' '));
    } else {
      setCardNumber('');
    }
  };

  const handleExpiryFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length > 2) {
      setExpiry(`${rawVal.slice(0, 2)}/${rawVal.slice(2, 4)}`);
    } else {
      setExpiry(rawVal);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentComplete = async (method: string, transactionId?: string) => {
    setProcessing(true);
    setPaymentError(null);

    if (simulateFailure) {
      setStepText('Securing connection gateway...');
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setStepText('Authorizing transaction parameters...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStepText('Gateway reporting transaction status...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setProcessing(false);
      setPaymentError('Gateway Error: 402 - Payment Transaction Declined. Insufficient Account Balance or UPI PIN verification failed.');
      showToast('Payment transaction failed. Please check balance and try again.', 'error');
      return;
    }

    setStepText('Securing connection gateway...');
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setStepText('Verifying payment authentication...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStepText('Submitting order record...');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Try to save order via backend microservices
    const online = await api.status.check();
    if (online) {
      try {
        const addressStr = `${checkoutInfo.address.street}, ${checkoutInfo.address.city}, ${checkoutInfo.address.state} ${checkoutInfo.address.zipCode}, ${checkoutInfo.address.country}`;
        const res = await api.orders.create(user.id, {
          items: cart.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          totalAmount: total,
          shippingAddress: addressStr
        });

        if (res && res.success && res.data) {
          clearCart();
          sessionStorage.removeItem('ec_checkout_data');
          setProcessing(false);
          showToast('Payment processed successfully! Thank you.', 'success');
          navigate(`/order-tracking?id=${res.data.id}`);
          return;
        }
      } catch (err) {
        console.error('Failed to write order to backend API, falling back to local', err);
      }
    }

    // Fallback: Generate real Order in LocalStorage
    const trackingNum = `TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        image: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity
      })),
      subtotal,
      discount,
      tax,
      shipping,
      total,
      address: checkoutInfo.address,
      paymentMethod: method,
      status: 'ordered',
      date: new Date().toISOString().split('T')[0],
      trackingNumber: trackingNum
    };

    saveOrder(newOrder);
    clearCart();
    sessionStorage.removeItem('ec_checkout_data');
    setProcessing(false);

    showToast(`Payment processed successfully! Gateway Ref: ${transactionId || 'TXN-' + Math.floor(100000 + Math.random() * 900000)}`, 'success');
    navigate(`/order-tracking?id=${newOrder.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (checkoutInfo.paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16 || expiry.length !== 5 || cvv.length !== 3 || !cardName) {
        showToast('Please check card details validity.', 'error');
        return;
      }
      await handlePaymentComplete('card');
    } else if (checkoutInfo.paymentMethod === 'gpay') {
      if (!gpayUpi.includes('@')) {
        showToast('Please enter a valid Google Pay UPI VPA (e.g. name@okaxis).', 'error');
        return;
      }
      await handlePaymentComplete('gpay', 'GPAY-' + Math.floor(100000 + Math.random() * 900000));
    } else if (checkoutInfo.paymentMethod === 'razorpay') {
      setProcessing(true);
      setStepText('Connecting to Razorpay Secure Gateway...');

      // Try to save order via backend microservices first to get orderId
      const online = await api.status.check();
      let backendOrderId: number | null = null;
      const addressStr = `${checkoutInfo.address.street}, ${checkoutInfo.address.city}, ${checkoutInfo.address.state} ${checkoutInfo.address.zipCode}, ${checkoutInfo.address.country}`;
      
      if (online) {
        try {
          setStepText('Creating order on backend...');
          const res = await api.orders.create(user.id, {
            items: cart.map((item) => ({
              productId: item.product.id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity
            })),
            totalAmount: total,
            shippingAddress: addressStr
          });
          if (res && res.success && res.data) {
            backendOrderId = res.data.id;
          }
        } catch (err) {
          console.error('Failed to create order on backend', err);
        }
      }

      let razorpayOrderId = '';
      let keyId = 'rzp_test_ILgs4bpZ48eFC7'; // Fallback key
      if (backendOrderId) {
        try {
          setStepText('Initializing Razorpay transaction...');
          const rpRes = await api.payments.createRazorpayOrder(backendOrderId, total);
          if (rpRes && rpRes.success && rpRes.data) {
            razorpayOrderId = rpRes.data.razorpayOrderId;
            keyId = rpRes.data.keyId;
          }
        } catch (rpErr) {
          console.error('Failed to initialize Razorpay order on backend', rpErr);
        }
      }
      
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Razorpay Gateway failed to load. Falling back to local simulator.', 'info');
        await handlePaymentComplete('razorpay');
        return;
      }

      const options = {
        key: keyId,
        amount: Math.round(total * 100), // in paise
        currency: 'INR',
        name: 'E-Commerce Market',
        description: 'Secure Order Checkout Payment',
        order_id: razorpayOrderId || undefined,
        handler: async function (response: any) {
          if (backendOrderId && razorpayOrderId) {
            try {
              setProcessing(true);
              setStepText('Verifying payment signature...');
              const verifyRes = await api.payments.verifyRazorpayPayment(
                razorpayOrderId,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              if (verifyRes && verifyRes.success) {
                clearCart();
                sessionStorage.removeItem('ec_checkout_data');
                setProcessing(false);
                showToast('Razorpay payment verified and order completed!', 'success');
                navigate(`/order-tracking?id=${backendOrderId}`);
                return;
              } else {
                setProcessing(false);
                setPaymentError('Razorpay Signature Verification Failed: Transaction was rejected by backend security filters.');
                showToast('Payment verification failed.', 'error');
                return;
              }
            } catch (vErr) {
              console.error('Verification call crashed', vErr);
            }
          }
          handlePaymentComplete('razorpay', response.razorpay_payment_id);
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1' // primary indigo
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
            showToast('Payment verification cancelled by user.', 'info');
          }
        }
      };

      try {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (rzpErr: any) {
        console.error('Razorpay initialization failed, falling back to simulator', rzpErr);
        showToast('Razorpay Sandbox failed to load. Launching local payment simulator.', 'info');
        await handlePaymentComplete('razorpay');
      }
    } else {
      await handlePaymentComplete('cod');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', textAlign: 'left' }}>
      <div className="card" style={{ padding: '36px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Secure Payment</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'center' }}>
          Completing purchase order for <strong style={{ color: 'var(--primary)' }}>₹{total.toFixed(2)}</strong>.
        </p>

        {paymentError && (
          <div className="card" style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Icon name="alert-circle" size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Payment Processing Error</strong>
                <p style={{ fontSize: '0.85rem', marginTop: '2px', color: 'var(--text-secondary)' }}>{paymentError}</p>
              </div>
            </div>
            <button type="button" onClick={() => setPaymentError(null)} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.75rem', padding: '4px 10px', height: '28px' }}>
              Dismiss & Retry
            </button>
          </div>
        )}

        {processing ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '20px' }}>
            {/* Shimmering Pulse loading indicator */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'shimmer 1s infinite alternate' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'shimmer 1s infinite alternate 0.2s' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', animation: 'shimmer 1s infinite alternate 0.4s' }} />
            </div>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--primary)' }}>{stepText}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Please do not refresh this window page.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {checkoutInfo.paymentMethod === 'card' ? (
              <>
                <div className="form-group">
                  <label className="label" htmlFor="card-name-input">Cardholder Name</label>
                  <input
                    id="card-name-input"
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="e.g. Liam Foster"
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="card-num-input">Card Number</label>
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <input
                      id="card-num-input"
                      type="text"
                      value={cardNumber}
                      onChange={handleCardFormat}
                      placeholder="4000 1234 5678 9010"
                      className="input-field"
                      style={{ width: '100%', paddingRight: '40px' }}
                      required
                    />
                    <Icon name="credit-card" size={20} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="label" htmlFor="card-expiry-input">Expiration Date</label>
                    <input
                      id="card-expiry-input"
                      type="text"
                      value={expiry}
                      onChange={handleExpiryFormat}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="card-cvv-input">Security CVV</label>
                    <input
                      id="card-cvv-input"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="***"
                      maxLength={3}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </>
            ) : checkoutInfo.paymentMethod === 'razorpay' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <Icon name="credit-card" size={40} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Pay via Razorpay Gateway</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deduct transaction value securely using UPI, cards, net banking, or wallets.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <input
                    id="simulate-fail-check-rzp"
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="simulate-fail-check-rzp" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    Simulate Payment Gateway Failure (Error Testing)
                  </label>
                </div>
              </div>
            ) : checkoutInfo.paymentMethod === 'gpay' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(66, 133, 244, 0.1)', color: '#4285F4', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>G</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Google Pay (GPay UPI)</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>Pay directly using your Google Pay virtual payment address (VPA).</p>
                  
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label className="label" htmlFor="gpay-upi-input">UPI Virtual Address (VPA)</label>
                    <input
                      id="gpay-upi-input"
                      type="text"
                      value={gpayUpi}
                      onChange={(e) => setGpayUpi(e.target.value)}
                      placeholder="e.g. user@okaxis"
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                  <input
                    id="simulate-fail-check-gpay"
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="simulate-fail-check-gpay" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    Simulate Payment Gateway Failure (Error Testing)
                  </label>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)', margin: '12px 0' }}>
                <Icon name="truck" size={40} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Confirm Cash Order</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Authorize placing order immediately. Payment will be collected in cash upon package dropoff.</p>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', height: '48px', marginTop: '12px' }}>
              <Icon name="shield-check" size={18} />
              <span>Authorize Payment & Submit Order</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Payment;
