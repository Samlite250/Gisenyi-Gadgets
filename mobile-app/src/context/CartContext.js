import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const applyPromoCode = (code) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'GADGET10') {
      const discount = Math.round(subtotal * 0.1);
      setPromoDiscount(discount);
      setActivePromo('GADGET10');
      return { success: true, message: '10% Discount Applied!' };
    }
    if (cleanCode === 'WELCOME20') {
      const discount = Math.round(subtotal * 0.2);
      setPromoDiscount(discount);
      setActivePromo('WELCOME20');
      return { success: true, message: '20% Welcome Discount Applied!' };
    }
    if (cleanCode === 'GISENYI') {
      const discount = 5000;
      setPromoDiscount(discount);
      setActivePromo('GISENYI');
      return { success: true, message: 'RWF 5,000 Discount Applied!' };
    }
    return { success: false, message: 'Invalid Promo Code' };
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
