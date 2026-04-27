import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

const WishlistContext = createContext(null);
const WISHLIST_CACHE_KEY = '@GisenyiGadgets_wishlist';

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Track auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data?.session?.user?.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  // Load wishlist: from Supabase when logged in, from AsyncStorage when guest
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      if (userId) {
        // Fetch from DB with full product details
        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            id,
            product_id,
            created_at,
            products (
              id, name, price, compare_price, images, brand, rating, review_count, stock
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const items = (data || [])
          .filter((w) => w.products)
          .map((w) => ({ ...w.products, wishlistRowId: w.id, savedAt: w.created_at }));

        setWishlistItems(items);
        // Keep a local cache too
        await AsyncStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify(items));
      } else {
        // Guest: load from local cache
        const stored = await AsyncStorage.getItem(WISHLIST_CACHE_KEY);
        if (stored) setWishlistItems(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Wishlist load error:', err.message);
      // Last resort: try local cache
      try {
        const stored = await AsyncStorage.getItem(WISHLIST_CACHE_KEY);
        if (stored) setWishlistItems(JSON.parse(stored));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  // Add to wishlist
  const addToWishlist = async (product) => {
    if (wishlistItems.some((item) => item.id === product.id)) return;

    // Optimistic update
    const newItem = { ...product, savedAt: new Date().toISOString() };
    setWishlistItems((prev) => [newItem, ...prev]);

    if (userId) {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({ user_id: userId, product_id: product.id })
        .select('id')
        .single();

      if (!error && data) {
        // Attach the DB row id to the item for future deletion
        setWishlistItems((prev) =>
          prev.map((item) => item.id === product.id ? { ...item, wishlistRowId: data.id } : item)
        );
      } else if (error) {
        // Rollback
        setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
        console.warn('Wishlist add error:', error.message);
      }
    } else {
      // Guest: persist to cache
      const updated = [newItem, ...wishlistItems];
      await AsyncStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify(updated));
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    const item = wishlistItems.find((i) => i.id === productId);
    setWishlistItems((prev) => prev.filter((i) => i.id !== productId));

    if (userId && item?.wishlistRowId) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', item.wishlistRowId);

      if (error) {
        // Rollback
        setWishlistItems((prev) => [item, ...prev]);
        console.warn('Wishlist remove error:', error.message);
      }
    } else if (!userId) {
      const updated = wishlistItems.filter((i) => i.id !== productId);
      await AsyncStorage.setItem(WISHLIST_CACHE_KEY, JSON.stringify(updated));
    }
  };

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId) => wishlistItems.some((item) => item.id === productId);

  const clearWishlist = () => {
    setWishlistItems([]);
    AsyncStorage.removeItem(WISHLIST_CACHE_KEY);
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
    refreshWishlist: loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
