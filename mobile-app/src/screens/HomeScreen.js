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
  { id: '1', name: 'Electronics', icon: '💻', slug: 'electronics' },
  { id: '2', name: 'Phone Cases', icon: '📱', slug: 'phone-cases' },
  { id: '3', name: 'Clothes',     icon: '👕', slug: 'clothes' },
  { id: '4', name: 'More',        icon: '...', slug: 'more' },
];

const BANNERS = [
  { id: 1, title: 'Big Sale Up to\n40% OFF', subtitle: 'On all electronics and accessories', color: '#0F172A', emoji: '🎧', buttonText: 'Shop Now' },
];

export default function HomeScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(DEMO_PRODUCTS);
  const [newArrivals, setNewArrivals] = useState(DEMO_PRODUCTS);
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
      // keep demo data
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const ProductCard = ({ product, style }) => {
    const wishlisted = isInWishlist(product.id);
    return (
      <TouchableOpacity
        style={[styles.productCard, style]}
        onPress={() => navigation.navigate('ProductDetails', { product })}
        activeOpacity={0.85}
      >
        <View style={styles.productImageWrap}>
          {product.images?.[0]
            ? <Image source={{ uri: product.images[0] }} style={styles.productImage} resizeMode="contain" />
            : <View style={[styles.productImage, styles.imagePlaceholder]}><ShoppingBag size={32} color={COLORS.textMuted} /></View>
          }
          <TouchableOpacity style={styles.heartBtn} onPress={() => toggleWishlist(product)}>
            <Heart size={16} color={wishlisted ? COLORS.error : '#666'} fill={wishlisted ? COLORS.error : 'none'} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={11} color="#FBBC04" fill="#FBBC04" />
            <Text style={styles.ratingText}>{product.rating}</Text>
          </View>
          <Text style={styles.productPrice}>{fmt(product.price)}</Text>
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
            <Text style={styles.tagline}>What are you looking for today?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}><Bell size={22} color={COLORS.textPrimary} /></TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput placeholder="Search products..." placeholderTextColor={COLORS.textMuted} style={styles.searchInput} />
        </View>

        {/* Banners */}
        <View style={styles.bannerContainer}>
          {BANNERS.map((b) => (
            <View key={b.id} style={[styles.banner, { backgroundColor: b.color }]}>
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{b.title}</Text>
                <TouchableOpacity style={styles.bannerButton}><Text style={styles.bannerButtonText}>{b.buttonText}</Text></TouchableOpacity>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300' }} style={styles.bannerImage} />
            </View>
          ))}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <View style={styles.catRow}>
          {categories.map((c) => (
            <TouchableOpacity key={c.id} style={styles.catItem}>
              <View style={styles.catIconWrap}><Text style={styles.catIcon}>{c.icon}</Text></View>
              <Text style={styles.catName}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {DEMO_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} style={styles.featuredCard} />
          ))}
        </ScrollView>

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, paddingBottom: SIZES.sm,
  },
  greeting: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary },
  tagline: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginTop: 2 },
  notifBtn: { width: 44, height: 44, backgroundColor: COLORS.cardBg, borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm, borderWeight: 1, borderColor: '#eee' },
  
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F5F5F5', borderRadius: SIZES.radiusMd,
    marginHorizontal: SIZES.lg, marginVertical: SIZES.md,
    paddingHorizontal: SIZES.md, height: 48,
  },
  searchInput: { flex: 1, fontSize: SIZES.fontSm, color: COLORS.textPrimary, outlineStyle: 'none' },

  bannerContainer: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  banner: {
    height: 160, borderRadius: SIZES.radiusLg, padding: SIZES.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    ...SHADOWS.md, overflow: 'hidden',
  },
  bannerContent: { flex: 1, justifyContent: 'center', gap: SIZES.md },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 28 },
  bannerButton: { alignSelf: 'flex-start', backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusSm, paddingVertical: 8, paddingHorizontal: 16 },
  bannerButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bannerImage: { width: 120, height: 120, borderRadius: 60 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.lg, marginBottom: SIZES.md },
  sectionTitle: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: SIZES.fontSm, color: COLORS.primaryBlue, fontWeight: '600' },

  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  catItem: { alignItems: 'center', gap: SIZES.sm },
  catIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  catIcon: { fontSize: 24 },
  catName: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },

  hScroll: { paddingHorizontal: SIZES.lg, gap: SIZES.md, paddingBottom: SIZES.md },
  featuredCard: { width: 160 },
  
  productCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.sm, ...SHADOWS.sm, borderWeight: 1, borderColor: '#F0F0F0' },
  productImageWrap: { position: 'relative', marginBottom: SIZES.sm },
  productImage: { width: '100%', height: 120 },
  imagePlaceholder: { backgroundColor: COLORS.surfaceBg, justifyContent: 'center', alignItems: 'center' },
  heartBtn: { position: 'absolute', top: 0, right: 0, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  productInfo: { gap: 4 },
  productName: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  productPrice: { fontSize: SIZES.fontMd, fontWeight: '800', color: COLORS.primaryBlue },
});
