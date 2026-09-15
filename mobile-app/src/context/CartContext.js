import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { cartLogger } from '../utils/logger';

const CartContext = createContext(null);

const CART_STORAGE_KEY = '@GisenyiGadgets_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [activePromo, setActivePromo] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', product: null });
  const toastTimer = useRef(null);

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
      cartLogger.error('Failed to load cart from storage', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      cartLogger.error('Failed to save cart to storage', err);
    }
  };

  const showToast = (message, product = null) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, product });
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const hideToast = () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast((prev) => ({ ...prev, visible: false }));
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

    showToast('Item added to cart!', product);
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

    const currentSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const applyDiscount = (discountData) => {
      let discount = 0;
      if (discountData.discount_type === 'percent') {
        discount = Math.round(currentSubtotal * (discountData.discount_value / 100));
      } else {
        discount = discountData.discount_value;
      }
      discount = Math.min(discount, currentSubtotal); // never exceed subtotal
      setPromoDiscount(discount);
      setActivePromo(cleanCode);
      const msg = discountData.discount_type === 'percent'
        ? `${discountData.discount_value}% Discount Applied!`
        : `RWF ${Number(discountData.discount_value).toLocaleString()} Discount Applied!`;
      return { success: true, message: msg };
    };

    try {
      // Validate server-side via platform_settings table
      const { data, error } = await supabase
        .from('promo_codes')
        .select('discount_type, discount_value, is_active')
        .eq('code', cleanCode)
        .single();

      if (error || !data || !data.is_active) {
        // Fallback local static logic if no DB Match
        const STATIC_PROMOS = {
          'WELCOME10': { discount_type: 'percent', discount_value: 10 },
          'SAVE2000': { discount_type: 'fixed', discount_value: 2000 },
          'GISENYI': { discount_type: 'percent', discount_value: 15 }
        };

        if (STATIC_PROMOS[cleanCode]) {
          return applyDiscount(STATIC_PROMOS[cleanCode]);
        }
        return { success: false, message: 'Invalid or expired promo code.' };
      }

      return applyDiscount(data);
    } catch {
      return { success: false, message: 'Could not validate code. Try again.' };
    }
  };

  const removePromoCode = () => {
    setPromoDiscount(0);
    setActivePromo(null);
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
    toast,
    showToast,
    hideToast,
    applyPromoCode,
    removePromoCode,
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
