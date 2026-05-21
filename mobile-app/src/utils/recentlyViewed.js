import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@GisenyiGadgets_recentlyViewed';
const MAX_ITEMS = 10;

/**
 * Add a product to recently viewed list
 * @param {Object} product - Product object with at least id, name, images, price
 */
export const addToRecentlyViewed = async (product) => {
  try {
    if (!product || !product.id) return;

    const existing = await getRecentlyViewed();

    // Remove if already exists (to move to front)
    const filtered = existing.filter(p => p.id !== product.id);

    // Add to front
    const updated = [
      {
        id: product.id,
        name: product.name,
        images: product.images,
        price: product.price,
        brand: product.brand,
        rating: product.rating,
        viewedAt: new Date().toISOString(),
      },
      ...filtered,
    ].slice(0, MAX_ITEMS); // Keep only last 10

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    // Silent fail - not critical
  }
};

/**
 * Get recently viewed products
 * @returns {Array} Array of recently viewed products
 */
export const getRecentlyViewed = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Clear recently viewed history
 */
export const clearRecentlyViewed = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Silent fail
  }
};
