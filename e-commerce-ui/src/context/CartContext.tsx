import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Product, type PromoCode, PROMO_CODES } from '../utils/mockData';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: PromoCode | null;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCouponCode: () => void;
  cartTotalCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ec_cart');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<PromoCode | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ec_coupon');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('ec_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('ec_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('ec_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        // Enforce stock limits
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: maxQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCouponCode = (code: string) => {
    const coupon = PROMO_CODES.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      return { success: true, message: `Promo code "${coupon.code}" applied successfully!` };
    }
    return { success: false, message: 'Invalid promo code. Please check and try again.' };
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  // Calculations
  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  // Free shipping over ₹150 or flat free shipping coupon code
  const shipping = subtotal > 150 || subtotal === 0 || (appliedCoupon && appliedCoupon.code === 'FREESHIP50') ? 0 : 9.99;
  
  // 8% tax calculated after discount
  const tax = subtotal > 0 ? Math.max(0, (subtotal - discount) * 0.08) : 0;
  
  const total = Math.max(0, subtotal - discount + shipping + tax);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCouponCode,
        removeCouponCode,
        cartTotalCount,
        subtotal,
        discount,
        shipping,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
