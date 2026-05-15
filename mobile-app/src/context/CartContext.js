import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const CartContext = createContext(null);

const CART_STORAGE_KEY = '@GisenyiGadgets_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [activePromo, setActivePromo] = useState(null);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Persist cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveCart(cartItems);
    }
  }, [cartItems, loading]);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (stored) setCartItems(JSON.parse(stored));
    } catch (err) {
      console.warn('Cart load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Cart save error:', err);
    }
  };

  const addToCart = (product, quantity = 1, selectedColor = null, selectedStorage = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedStorage === selectedStorage
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Add new item
      return [
        ...prev,
        {
          ...product,
          quantity,
          selectedColor,
          selectedStorage,
          cartItemId: `${product.id}_${Date.now()}`,
        },
      ];
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setPromoDiscount(0);
    setActivePromo(null);
  };

  const applyPromoCode = async (code) => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return { success: false, message: 'Enter a promo code.' };

    try {
      // Validate server-side via platform_settings table
      const { data, error } = await supabase
        .from('promo_codes')
        .select('discount_type, discount_value, is_active')
        .eq('code', cleanCode)
        .single();

      if (error || !data || !data.is_active) {
        return { success: false, message: 'Invalid or expired promo code.' };
      }

      let discount = 0;
      if (data.discount_type === 'percent') {
        discount = Math.round(subtotal * (data.discount_value / 100));
      } else {
        discount = data.discount_value;
      }
      discount = Math.min(discount, subtotal); // never exceed subtotal
      setPromoDiscount(discount);
      setActivePromo(cleanCode);
      const msg = data.discount_type === 'percent'
        ? `${data.discount_value}% Discount Applied!`
        : `RWF ${Number(data.discount_value).toLocaleString()} Discount Applied!`;
      return { success: true, message: msg };
    } catch {
      return { success: false, message: 'Could not validate code. Try again.' };
    }
  };

  const isInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find((item) => item.id === productId);
  };

  // Computed values
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee = subtotal > 50000 ? 0 : 2000; // Free shipping over RWF 50,000
  const total = Math.max(0, subtotal + shippingFee - promoDiscount);

  const value = {
    cartItems,
    loading,
    totalItems,
    subtotal,
    shippingFee,
    total,
    promoDiscount,
    activePromo,
    applyPromoCode,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
