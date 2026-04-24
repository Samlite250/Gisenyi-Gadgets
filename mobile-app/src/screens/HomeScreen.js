import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Heart, Star, ChevronRight, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

// ─── Demo data fallback ───────────────────────────────────────
const DEMO_CATEGORIES = [
  { id: '1', name: 'Phones', icon: '📱', slug: 'smartphones' },
  { id: '2', name: 'Laptops', icon: '💻', slug: 'laptops' },
  { id: '3', name: 'Audio', icon: '🎧', slug: 'headphones' },
  { id: '4', name: 'Watches', icon: '⌚', slug: 'smartwatches' },
  { id: '5', name: 'Tablets', icon: '📟', slug: 'tablets' },
  { id: '6', name: 'Gaming', icon: '🎮', slug: 'gaming' },
];

const DEMO_PRODUCTS = [
  { id: 'p1', name: 'Samsung Galaxy S24 Ultra', price: 850000, compare_price: 950000, rating: 4.8, review_count: 124, brand: 'Samsung', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500'], colors: ['Titanium Black', 'Titanium Gray'], storage_options: ['256GB', '512GB'], stock: 12 },
  { id: 'p2', name: 'iPhone 15 Pro Max', price: 1200000, compare_price: 1350000, rating: 4.9, review_count: 89, brand: 'Apple', images: ['https://images.unsplash.com/photo-1695048133142-1a20484429b6?q=80&w=500'], colors: ['Natural Titanium', 'Blue'], storage_options: ['256GB', '512GB', '1TB'], stock: 8 },
  { id: 'p3', name: 'AirPods Pro (3rd Gen)', price: 120000, compare_price: 150000, rating: 4.7, review_count: 201, brand: 'Apple', images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=500'], colors: ['White'], storage_options: [], stock: 25 },
  { id: 'p4', name: 'MacBook Air M3', price: 1450000, rating: 4.9, review_count: 67, brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500'], colors: ['Space Gray', 'Silver', 'Starlight'], storage_options: ['256GB', '512GB'], stock: 5 },
  { id: 'p5', name: 'Sony WH-1000XM5', price: 195000, compare_price: 220000, rating: 4.8, review_count: 156, brand: 'Sony', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500'], colors: ['Black', 'Silver'], storage_options: [], stock: 18 },
  { id: 'p6', name: 'iPad Pro 12.9"', price: 980000, compare_price: 1100000, rating: 4.7, review_count: 43, brand: 'Apple', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500'], colors: ['Space Gray', 'Silver'], storage_options: ['128GB', '256GB', '512GB'], stock: 7 },
];

const BANNERS = [
  { id: 1, title: 'New Arrivals', subtitle: 'Galaxy S24 Ultra is here', color: COLORS.primaryBlue, emoji: '📱' },
  { id: 2, title: 'Up to 20% Off', subtitle: 'On all Apple products', color: '#7C3AED', emoji: '🍎' },
  { id: 3, title: 'Free Shipping', subtitle: 'Orders over RWF 50,000', color: COLORS.primaryGreen, emoji: '🚚' },
];

export default function HomeScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(DEMO_PRODUCTS);
  const [newArrivals, setNewArrivals] = useState(DEMO_PRODUCTS.slice(3));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  const displayName = profile?.full_name?.split(' ')[0]
    || user?.user_metadata?.full_name?.split(' ')[0]
    || 'there';

  const fetchData = useCallback(async () => {
    try {
      const [{ data: cats }, { data: products }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
      ]);
      if (cats?.length) setCategories(cats);
      if (products?.length) {
        setFeaturedProducts(products.filter((p) => p.is_featured));
        setNewArrivals(products.slice(0, 6));
      }
    } catch (err) {
      // keep demo data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const ProductCard = ({ product, style }) => {
    const discount = product.compare_price
      ? Math.round((1 - product.price / product.compare_price) * 100) : 0;
    const wishlisted = isInWishlist(product.id);

    return (
      <TouchableOpacity
        style={[styles.productCard, style]}
        onPress={() => navigation.navigate('ProductDetails', { product })}
        activeOpacity={0.85}
      >
        <View style={styles.productImageWrap}>
          {product.images?.[0]
            ? <Image source={{ uri: product.images[0] }} style={styles.productImage} resizeMode="cover" />
            : <View style={[styles.productImage, styles.imagePlaceholder]}>
                <ShoppingBag size={32} color={COLORS.textMuted} />
              </View>
          }
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={() => toggleWishlist(product)}
          >
            <Heart
              size={16}
              color={wishlisted ? COLORS.error : COLORS.textSecondary}
              fill={wishlisted ? COLORS.error : 'none'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          {product.brand && <Text style={styles.productBrand}>{product.brand}</Text>}
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={11} color="#FBBC04" fill="#FBBC04" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.review_count})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{fmt(product.price)}</Text>
            {product.compare_price && (
              <Text style={styles.comparePrice}>{fmt(product.compare_price)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primaryBlue} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
            <Text style={styles.tagline}>Shop Smart. Live Better.</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Bell size={22} color={COLORS.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Search size={18} color={COLORS.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search phones, laptops, audio...</Text>
        </TouchableOpacity>

        {/* Banners */}
        <ScrollView
          horizontal pagingEnabled showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerScroll}
          onMomentumScrollEnd={(e) =>
            setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / (310 + SIZES.sm)))
          }
        >
          {BANNERS.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.banner, { backgroundColor: b.color }]}
              activeOpacity={0.9}
            >
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>{b.title}</Text>
                <Text style={styles.bannerSub}>{b.subtitle}</Text>
                <View style={styles.bannerBtn}>
                  <Text style={styles.bannerBtnText}>Shop Now →</Text>
                </View>
              </View>
              <Text style={styles.bannerEmoji}>{b.emoji}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.bannerDots}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[styles.dot, activeBanner === i && styles.dotActive]} />
          ))}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          <TouchableOpacity
            style={[styles.catChip, activeCategory === 'all' && styles.catChipActive]}
            onPress={() => setActiveCategory('all')}
          >
            <Text style={[styles.catText, activeCategory === 'all' && styles.catTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, activeCategory === c.slug && styles.catChipActive]}
              onPress={() => setActiveCategory(c.slug)}
            >
              <Text style={styles.catEmoji}>{c.icon}</Text>
              <Text style={[styles.catText, activeCategory === c.slug && styles.catTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {(featuredProducts.length ? featuredProducts : DEMO_PRODUCTS).map((p) => (
            <ProductCard key={p.id} product={p} style={styles.featuredCard} />
          ))}
        </ScrollView>

        {/* New Arrivals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridWrap}>
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} style={styles.gridCard} />
          ))}
        </View>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_W = 180;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SIZES.lg, paddingTop: SIZES.sm, paddingBottom: SIZES.md,
  },
  greeting: { fontSize: SIZES.fontXl, fontWeight: '800', color: COLORS.textPrimary },
  tagline: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: { width: 42, height: 42, backgroundColor: COLORS.cardBg, borderRadius: 21, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.cardBg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg,
    marginHorizontal: SIZES.lg, marginBottom: SIZES.md,
    padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border,
  },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: SIZES.fontSm, flex: 1 },
  bannerScroll: { paddingLeft: SIZES.lg, gap: SIZES.sm, paddingRight: SIZES.sm },
  banner: {
    width: 310, height: 150, borderRadius: SIZES.radiusXl, padding: SIZES.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    ...SHADOWS.md, overflow: 'hidden',
  },
  bannerText: { flex: 1, gap: SIZES.xs },
  bannerTitle: { fontSize: SIZES.fontXl, fontWeight: '800', color: '#fff' },
  bannerSub: { fontSize: SIZES.fontSm, color: 'rgba(255,255,255,0.85)' },
  bannerBtn: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: SIZES.radiusFull, paddingVertical: 4, paddingHorizontal: SIZES.sm, marginTop: SIZES.xs },
  bannerBtnText: { color: '#fff', fontSize: SIZES.fontXs, fontWeight: '700' },
  bannerEmoji: { fontSize: 52, marginLeft: SIZES.sm },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: SIZES.xs, marginVertical: SIZES.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.primaryBlue, width: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.lg, marginBottom: SIZES.sm, marginTop: SIZES.sm },
  sectionTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: SIZES.fontSm, color: COLORS.primaryBlue, fontWeight: '600' },
  catList: { paddingHorizontal: SIZES.lg, gap: SIZES.sm, paddingBottom: SIZES.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs, paddingVertical: SIZES.xs, paddingHorizontal: SIZES.md, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusFull, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue },
  catEmoji: { fontSize: 16 },
  catText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  hScroll: { paddingHorizontal: SIZES.lg, gap: SIZES.sm, paddingBottom: SIZES.sm },
  featuredCard: { width: CARD_W },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SIZES.lg, gap: SIZES.sm },
  gridCard: { width: '48.2%' },
  productCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, overflow: 'hidden', ...SHADOWS.sm },
  productImageWrap: { position: 'relative' },
  productImage: { width: '100%', height: 140 },
  imagePlaceholder: { backgroundColor: COLORS.surfaceBg, justifyContent: 'center', alignItems: 'center' },
  discountBadge: { position: 'absolute', top: SIZES.xs, left: SIZES.xs, backgroundColor: COLORS.error, borderRadius: SIZES.radiusFull, paddingVertical: 2, paddingHorizontal: SIZES.xs },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  heartBtn: { position: 'absolute', top: SIZES.xs, right: SIZES.xs, width: 30, height: 30, backgroundColor: 'rgba(15,23,42,0.7)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  productInfo: { padding: SIZES.sm, gap: 2 },
  productBrand: { fontSize: 10, fontWeight: '700', color: COLORS.primaryBlue, textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.textPrimary, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  ratingText: { fontSize: 11, color: '#FBBC04', fontWeight: '700' },
  reviewCount: { fontSize: 10, color: COLORS.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: SIZES.xs, marginTop: 2 },
  productPrice: { fontSize: SIZES.fontSm, fontWeight: '800', color: COLORS.textPrimary },
  comparePrice: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
});
