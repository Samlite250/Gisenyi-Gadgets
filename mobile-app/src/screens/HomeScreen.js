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
  { id: 'c1', name: 'Smartphones', icon: '📱', slug: 'smartphones' },
  { id: 'c2', name: 'Laptops', icon: '💻', slug: 'laptops' },
  { id: 'c3', name: 'Headphones', icon: '🎧', slug: 'headphones' },
  { id: 'c4', name: 'Smartwatches', icon: '⌚', slug: 'smartwatches' },
  { id: 'c5', name: 'Tablets', icon: '📇', slug: 'tablets' },
  { id: 'c6', name: 'Cameras', icon: '📷', slug: 'cameras' },
];

const BANNERS = [
  { id: 1, title: 'Big Sale Up to\n40% OFF', subtitle: 'On all electronics', color: '#0F172A', emoji: '🎧', buttonText: 'Shop Now', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300' },
  { id: 2, title: 'Apple Days\nSave $200', subtitle: 'MacBooks & iPads', color: '#8B5CF6', emoji: '💻', buttonText: 'Explore', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300' },
  { id: 3, title: 'Smart Wear\nTrending', subtitle: 'Upgrade your style', color: '#EF4444', emoji: '⌚', buttonText: 'View Deals', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300' },
];

const DEMO_BRANDS = [
  { id: 'b1', name: 'Apple', icon: '🍎' },
  { id: 'b2', name: 'Samsung', icon: '📱' },
  { id: 'b3', name: 'Sony', icon: '🎧' },
  { id: 'b4', name: 'HP', icon: '💻' },
  { id: 'b5', name: 'Dell', icon: '🖥️' },
];

const DEMO_PRODUCTS = [
  // Smartphones (c1)
  { id: 'p1', name: 'iPhone 15 Pro', price: 1200000, rating: '4.9', category_id: 'c1', is_featured: true, images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=300'] },
  { id: 'p2', name: 'Samsung Galaxy S24 Ultra', price: 1300000, rating: '4.8', category_id: 'c1', is_featured: true, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=300'] },
  { id: 'p3', name: 'Google Pixel 8 Pro', price: 950000, rating: '4.7', category_id: 'c1', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=300'] },
  { id: 'p4', name: 'OnePlus 12', price: 850000, rating: '4.6', category_id: 'c1', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300'] },
  { id: 'p5', name: 'Nothing Phone (2)', price: 650000, rating: '4.5', category_id: 'c1', images: ['https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=300'] },

  // Laptops (c2)
  { id: 'p6', name: 'MacBook Pro M3 Max', price: 3500000, rating: '5.0', category_id: 'c2', is_featured: true, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300'] },
  { id: 'p7', name: 'Dell XPS 15', price: 2100000, rating: '4.8', category_id: 'c2', images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=300'] },
  { id: 'p8', name: 'Razer Blade 16', price: 3200000, rating: '4.9', category_id: 'c2', images: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=300'] },
  { id: 'p9', name: 'Asus ROG Zephyrus G14', price: 1800000, rating: '4.7', category_id: 'c2', images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300'] },
  { id: 'p10', name: 'HP Spectre x360', price: 1600000, rating: '4.6', category_id: 'c2', images: ['https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?q=80&w=300'] },

  // Headphones (c3)
  { id: 'p11', name: 'Sony WH-1000XM5', price: 380000, rating: '4.9', category_id: 'c3', is_featured: true, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300'] },
  { id: 'p12', name: 'AirPods Max', price: 550000, rating: '4.7', category_id: 'c3', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300'] },
  { id: 'p13', name: 'Bose QC Ultra', price: 420000, rating: '4.8', category_id: 'c3', images: ['https://images.unsplash.com/photo-1546435770-a3e426ff472b?q=80&w=300'] },
  { id: 'p14', name: 'Sennheiser Momentum 4', price: 350000, rating: '4.7', category_id: 'c3', images: ['https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=300'] },
  { id: 'p15', name: 'Beats Studio Pro', price: 280000, rating: '4.5', category_id: 'c3', images: ['https://images.unsplash.com/photo-1520170350707-b2da59970118?q=80&w=300'] },

  // Smartwatches (c4)
  { id: 'p16', name: 'Apple Watch Ultra 2', price: 850000, rating: '4.9', category_id: 'c4', is_featured: true, images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300'] },
  { id: 'p17', name: 'Galaxy Watch 6 Classic', price: 35000, rating: '4.7', category_id: 'c4', images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=300'] },
  { id: 'p18', name: 'Garmin Epix Gen 2', price: 950000, rating: '4.8', category_id: 'c4', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300'] },
  { id: 'p19', name: 'Pixel Watch 2', price: 320000, rating: '4.6', category_id: 'c4', images: ['https://images.unsplash.com/photo-1508685096489-7aac29bc7b39?q=80&w=300'] },
  { id: 'p20', name: 'HUAWEI Watch GT 4', price: 250000, rating: '4.5', category_id: 'c4', images: ['https://images.unsplash.com/photo-1434493789847-2f02dc603507?q=80&w=300'] },

  // Tablets (c5)
  { id: 'p21', name: 'iPad Pro 12.9" M2', price: 1200000, rating: '4.9', category_id: 'c5', is_featured: true, images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=300'] },
  { id: 'p22', name: 'Samsung Galaxy Tab S9 Ultra', price: 1100000, rating: '4.8', category_id: 'c5', images: ['https://images.unsplash.com/photo-1589739900243-4b123b7305ae?q=80&w=300'] },
  { id: 'p23', name: 'Microsoft Surface Pro 9', price: 950000, rating: '4.7', category_id: 'c5', images: ['https://images.unsplash.com/photo-1515248187930-8041c9a62888?q=80&w=300'] },
  { id: 'p24', name: 'Xiaomi Pad 6 Pro', price: 450000, rating: '4.6', category_id: 'c5', images: ['https://images.unsplash.com/photo-1542751110-9764648393fb?q=80&w=300'] },
  { id: 'p25', name: 'Lenovo Tab P12 Pro', price: 650000, rating: '4.5', category_id: 'c5', images: ['https://images.unsplash.com/photo-1527690789675-4ea7d8da4fe3?q=80&w=300'] },

  // Cameras (c6)
  { id: 'p26', name: 'Sony A7 IV', price: 2500000, rating: '4.9', category_id: 'c6', is_featured: true, images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=300'] },
  { id: 'p27', name: 'Fujifilm X-T5', price: 1800000, rating: '4.8', category_id: 'c6', images: ['https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=300'] },
  { id: 'p28', name: 'Canon EOS R6 Mark II', price: 2400000, rating: '4.9', category_id: 'c6', images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=300'] },
  { id: 'p29', name: 'Nikon Z8', price: 4200000, rating: '5.0', category_id: 'c6', images: ['https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=300'] },
  { id: 'p30', name: 'GoPro Hero 12', price: 450000, rating: '4.7', category_id: 'c6', images: ['https://images.unsplash.com/photo-1562184120-da3e884fbf34?q=80&w=300'] },
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
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput 
            placeholder="Search products..." 
            placeholderTextColor={COLORS.textMuted} 
            style={styles.searchInput}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>

        {/* Top Brands */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
          {DEMO_BRANDS.map((b) => (
            <TouchableOpacity key={b.id} style={styles.brandItem} onPress={() => navigation.navigate('Search', { query: b.name })}>
              <View style={styles.brandIconWrap}><Text style={styles.brandIcon}>{b.icon}</Text></View>
              <Text style={styles.brandName}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Banners */}
        <View style={styles.bannerContainerWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIZES.lg, gap: 16 }}>
            {BANNERS.map((b) => (
              <View key={b.id} style={[styles.banner, { backgroundColor: b.color }]}>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('Search')}><Text style={styles.bannerButtonText}>{b.buttonText}</Text></TouchableOpacity>
                </View>
                <Image source={{ uri: b.image }} style={styles.bannerImage} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.catRow}>
            {categories.map((c) => (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.catItem, activeCategory === c.id && { opacity: 0.8 }]}
                onPress={() => setActiveCategory(activeCategory === c.id ? 'all' : c.id)}
              >
                <View style={[styles.catIconWrap, activeCategory === c.id && { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue, borderWidth: 1 }]}>
                  <Text style={styles.catIcon}>{c.icon || '📱'}</Text>
                </View>
                <Text style={[styles.catName, activeCategory === c.id && { color: COLORS.primaryBlue, fontWeight: '700' }]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
             {activeCategory === 'all' ? 'Featured Products' : (categories.find(c => c.id === activeCategory)?.name || '') + ' Products'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {(featuredProducts.length > 0 ? featuredProducts : DEMO_PRODUCTS)
            .filter(p => activeCategory === 'all' || p.category_id === activeCategory)
            .map((p) => (
            <ProductCard key={p.id} product={p} style={styles.featuredCard} />
          ))}
        </ScrollView>

        {/* Flash Deal */}
        <TouchableOpacity style={styles.flashDealContainer} activeOpacity={0.9} onPress={() => navigation.navigate('ProductDetails', { product: DEMO_PRODUCTS[5] })}>
          <View style={styles.flashDealContent}>
            <View style={styles.flashHeader}>
              <Text style={styles.flashBadge}>⚡ FLASH DEAL</Text>
              <Text style={styles.flashTimer}>02 : 14 : 30</Text>
            </View>
            <Text style={styles.flashTitle}>Sony WH-1000XM5</Text>
            <View style={styles.priceRow}>
              <Text style={styles.flashPrice}>RWF 35,000</Text>
              <Text style={styles.flashOldPrice}>50,000</Text>
            </View>
          </View>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300' }} style={styles.flashImage} />
        </TouchableOpacity>

        {/* New Arrivals */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <View style={styles.newArrivalsList}>
          {(newArrivals.length > 0 ? newArrivals : DEMO_PRODUCTS.slice(4, 7)).map((p) => (
            <TouchableOpacity key={p.id} style={styles.listCard} onPress={() => navigation.navigate('ProductDetails', { product: p })}>
              <Image source={{ uri: p.images[0] }} style={styles.listImage} />
              <View style={styles.listInfo}>
                <Text style={styles.listName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.listRating}>⭐ {p.rating}</Text>
                <Text style={styles.listPrice}>{fmt(p.price)}</Text>
              </View>
              <TouchableOpacity style={styles.addCartBtnSmall} onPress={() => addToCart(p)}>
                <ShoppingBag size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: SIZES.xxl || 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, paddingBottom: SIZES.sm,
  },
  greeting: { fontSize: SIZES.fontMd, fontWeight: '800', color: '#1A1A1A' },
  tagline: { fontSize: SIZES.fontSm, color: '#666666', marginTop: 4 },
  notifBtn: { width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm, borderWidth: 1, borderColor: '#F0F0F0' },
  
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#FFFFFF', borderRadius: 16,
    marginHorizontal: SIZES.lg, marginVertical: SIZES.md,
    paddingHorizontal: SIZES.md, height: 52,
    ...SHADOWS.sm, borderWidth: 1, borderColor: '#F0F0F0'
  },
  searchInput: { flex: 1, fontSize: SIZES.fontSm, color: '#1A1A1A', outlineStyle: 'none' },

  bannerContainer: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  banner: {
    height: 170, borderRadius: 24, padding: SIZES.lg,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    ...SHADOWS.md, overflow: 'hidden',
  },
  bannerContent: { flex: 1, justifyContent: 'center', gap: 12 },
  bannerTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', lineHeight: 30, letterSpacing: -0.5 },
  bannerButton: { alignSelf: 'flex-start', backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18 },
  bannerButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  bannerImage: { width: 130, height: 130, borderRadius: 65, right: -10, position: 'relative' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: SIZES.lg, marginBottom: SIZES.md },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  seeAll: { fontSize: 13, color: '#3B82F6', fontWeight: '700' },

  catRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg, gap: 16 },
  catItem: { alignItems: 'center', gap: 8 },
  catIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm, borderWidth: 1, borderColor: '#F0F0F0' },
  catIcon: { fontSize: 26 },
  catName: { fontSize: 12, fontWeight: '600', color: '#666666' },

  hScroll: { paddingHorizontal: SIZES.lg, gap: 16, paddingBottom: SIZES.md },
  featuredCard: { width: 170 },
  
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, ...SHADOWS.md, borderWidth: 1, borderColor: '#F5F5F5' },
  productImageWrap: { position: 'relative', marginBottom: 12, backgroundColor: '#FAFAFA', borderRadius: 12, padding: 8 },
  productImage: { width: '100%', height: 130, borderRadius: 8 },
  imagePlaceholder: { backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
  heartBtn: { position: 'absolute', top: 6, right: 6, width: 32, height: 32, backgroundColor: '#FFFFFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm },
  productInfo: { gap: 6 },
  productName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, color: '#666666', fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#3B82F6', marginTop: 4 },

  brandRow: { paddingHorizontal: SIZES.lg, gap: 16, marginBottom: SIZES.lg },
  brandItem: { alignItems: 'center', gap: 6 },
  brandIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm, borderWidth: 1, borderColor: '#F0F0F0' },
  brandIcon: { fontSize: 24 },
  brandName: { fontSize: 12, fontWeight: '700', color: '#1A1A1A' },

  bannerContainerWrap: { marginBottom: SIZES.lg },
  bannerSubtitle: { fontSize: 12, color: '#E0E7FF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  flashDealContainer: { backgroundColor: '#FFF5F5', marginHorizontal: SIZES.lg, borderRadius: 20, padding: 16, flexDirection: 'row', ...SHADOWS.sm, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: SIZES.lg },
  flashDealContent: { flex: 1, justifyContent: 'center', gap: 6 },
  flashHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  flashBadge: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  flashTimer: { fontSize: 11, fontWeight: '800', color: '#EF4444' },
  flashTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashPrice: { fontSize: 15, fontWeight: '900', color: '#EF4444' },
  flashOldPrice: { fontSize: 12, color: '#999999', textDecorationLine: 'line-through', fontWeight: '600' },
  flashImage: { width: 90, height: 90, borderRadius: 12, alignSelf: 'center' },

  newArrivalsList: { paddingHorizontal: SIZES.lg, gap: 12 },
  listCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, alignItems: 'center', gap: 12, ...SHADOWS.sm, borderWidth: 1, borderColor: '#F5F5F5' },
  listImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#FAFAFA' },
  listInfo: { flex: 1, gap: 4 },
  listName: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  listRating: { fontSize: 12, color: '#666666', fontWeight: '700' },
  listPrice: { fontSize: 15, fontWeight: '900', color: '#3B82F6' },
  addCartBtnSmall: { width: 36, height: 36, backgroundColor: '#1A1A1A', borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
});
