import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WishlistContext = createContext(null);

const WISHLIST_STORAGE_KEY = '@GisenyiGadgets_wishlist';

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    if (!loading) {
      saveWishlist(wishlistItems);
    }
  }, [wishlistItems, loading]);

  const loadWishlist = async () => {
    try {
      const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) setWishlistItems(JSON.parse(stored));
    } catch (err) {
      console.warn('Wishlist load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveWishlist = async (items) => {
    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Wishlist save error:', err);
    }
  };

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, { ...product, savedAt: new Date().toISOString() }];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const value = {
    wishlistItems,
    loading,
    totalWishlistItems: wishlistItems.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
