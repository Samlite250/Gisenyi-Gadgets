import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, Search, ShoppingBag, Heart, 
  ChevronRight, Star, ArrowRight, MessageSquare,
  Smartphone, Laptop, Headphones, Watch, Gamepad2, 
  Cpu, Camera, Zap, MapPin, Tablet
} from 'lucide-react-native';
import FloatingSupport from '../components/FloatingSupport';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

import { DEMO_CATEGORIES, BANNERS, SPECIAL_OFFERS, DEMO_PRODUCTS } from '../constants/dummyData';

export default function HomeScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(DEMO_PRODUCTS);
  const [allProducts, setAllProducts] = useState(DEMO_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

  // Real countdown timer for flash deal (2 hours from now on first render)
  const deadlineRef = useRef(Date.now() + 2 * 60 * 60 * 1000);
  const [flashTimer, setFlashTimer] = useState('02 : 00 : 00');
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, deadlineRef.current - Date.now());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setFlashTimer(`${h} : ${m} : ${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const displayName = profile?.full_name?.split(' ')[0]
    || user?.user_metadata?.full_name?.split(' ')[0]
    || 'there';

  const fetchData = useCallback(async () => {
    try {
      const [{ data: cats }, { data: products }] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(20),
      ]);
      
      // Combine Supabase data with Dummy Data to ensure the app looks "full"
      // We prioritize Supabase items but append Dummy items if they don't exist
      if (cats?.length) {
        const mergedCats = [...cats];
        DEMO_CATEGORIES.forEach(dc => {
          if (!mergedCats.find(c => c.slug === dc.slug)) mergedCats.push(dc);
        });
        setCategories(mergedCats);
      }

      const dbProducts = products || [];
      // Filter out dummy products that might already be in DB (by name)
      const uniqueDummy = DEMO_PRODUCTS.filter(dp => !dbProducts.find(p => p.name === dp.name));
      const allProducts = [...dbProducts, ...uniqueDummy];

      setFeaturedProducts(allProducts.filter((p) => p.is_featured));
      setAllProducts(allProducts);
      
    } catch (err) {
      console.warn('Fetch error, using demo data only');
      setCategories(DEMO_CATEGORIES);
      setFeaturedProducts(DEMO_PRODUCTS.filter(p => p.is_featured));
      setAllProducts(DEMO_PRODUCTS);
    } finally {
      setRefreshing(false);
      setLoading(false);
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
            <View style={styles.starWrap}>
              <Star size={10} color="#FBBC04" fill="#FBBC04" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.productPriceSmall}>{fmt(product.price)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: '#E5E7EB' }]} />
          <View style={{ gap: 6 }}>
            <View style={{ width: 80, height: 12, backgroundColor: '#E5E7EB', borderRadius: 6 }} />
            <View style={{ width: 140, height: 20, backgroundColor: '#E5E7EB', borderRadius: 8 }} />
          </View>
        </View>
        <View style={[styles.searchBar, { backgroundColor: '#F3F4F6', borderWidth: 0 }]} />
        <ScrollView showsVerticalScrollIndicator={false} style={{ padding: SIZES.lg }}>
          <View style={{ width: 150, height: 24, backgroundColor: '#E5E7EB', borderRadius: 6, marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <View key={i} style={{ width: 140, height: 180, backgroundColor: '#F3F4F6', borderRadius: 20 }} />
            ))}
          </View>
          <View style={{ width: 150, height: 24, backgroundColor: '#E5E7EB', borderRadius: 6, marginVertical: 30 }} />
          <View style={{ height: 170, backgroundColor: '#F3F4F6', borderRadius: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primaryBlue} />}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Avatar + greeting */}
          <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
            <View style={styles.avatar}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.headerTextGroup}>
              <View style={styles.locationPill}>
                <MapPin size={10} color="#3B82F6" />
                <Text style={styles.locationText}>Gisenyi, RW</Text>
              </View>
              <Text style={styles.greeting}>Hello, {displayName}</Text>
              <Text style={styles.tagline}>Find your next tech obsession</Text>
            </View>
          </TouchableOpacity>
          {/* Notification bell */}
          <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={21} color='#1A1A1A' />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
          <Search size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            pointerEvents="none"
            editable={false}
          />
        </TouchableOpacity>

        {/* Special Offers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offerRow}>
          {SPECIAL_OFFERS.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              style={[styles.offerCard, { backgroundColor: offer.color }]}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Search', { category: offer.category })}
            >
              <View style={styles.offerImageHalf}>
                <Image source={{ uri: offer.image }} style={styles.offerImgFull} resizeMode="cover" />
              </View>
              <View style={styles.offerContentHalf}>
                <View style={styles.offerBadge}>
                  <Text style={styles.offerDiscount}>{offer.discount}</Text>
                </View>
                <Text style={styles.offerLabel}>{offer.label}</Text>
                <Text style={styles.offerTagline} numberOfLines={1}>{offer.tagline}</Text>
              </View>
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
          <TouchableOpacity onPress={() => navigation.navigate('Search', { category: activeCategory !== 'all' ? activeCategory : null })}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.catRow}>
            {categories.map((c) => {
              const isActive = activeCategory === c.id;
              
              // Map slug/id to respective Lucide icon
              const slug = c.slug?.toLowerCase() || c.id?.toLowerCase() || '';
              const Icon = {
                smartphones: Smartphone,
                phones: Smartphone,
                laptops: Laptop,
                tablets: Tablet,
                headphones: Headphones,
                audio: Headphones,
                smartwatches: Watch,
                watches: Watch,
                gaming: Gamepad2,
                accessories: Cpu,
                tech: Cpu,
                cameras: Camera,
                photo: Camera,
              }[slug] || ShoppingBag;

              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.catItem}
                  onPress={() => setActiveCategory(isActive ? 'all' : c.id)}
                >
                  <View style={[styles.catIconWrap, isActive && { backgroundColor: '#3B82F6', borderColor: '#3B82F6' }]}>
                    <Icon size={28} color={isActive ? '#fff' : '#4285F4'} strokeWidth={2.4} />
                  </View>
                  <Text style={[styles.catName, isActive && { color: '#3B82F6', fontWeight: '700' }]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory === 'all' ? 'Featured Products' : (categories.find(c => c.id === activeCategory)?.name || '') + ' Products'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search', { category: activeCategory !== 'all' ? activeCategory : null })}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {(() => {
            const allItems = featuredProducts.length > 0 ? featuredProducts : DEMO_PRODUCTS;
            const selectedCat = categories.find(c => c.id === activeCategory);

            // If specific category selected, show all items in that category
            if (activeCategory !== 'all') {
              return allItems
                .filter(p => p.category_id === activeCategory || (selectedCat && p.category_id === selectedCat.slug))
                .map((p) => <ProductCard key={p.id} product={p} style={styles.featuredCard} />);
            }
            // If 'all' is selected, show only items marked as featured
            return allItems
              .filter(p => p.is_featured)
              .map((p) => <ProductCard key={p.id} product={p} style={styles.featuredCard} />);
          })()}
        </ScrollView>

        {/* Flash Deal */}
        <TouchableOpacity style={styles.flashDealContainer} activeOpacity={0.9} onPress={() => navigation.navigate('ProductDetails', { product: DEMO_PRODUCTS[5] })}>
          <View style={styles.flashDealContent}>
            <View style={styles.flashHeader}>
              <View style={styles.flashBadgeWrap}>
                <Zap size={10} color="#fff" fill="#fff" />
                <Text style={styles.flashBadgeText}>FLASH DEAL</Text>
              </View>
              <Text style={styles.flashTimer}>{flashTimer}</Text>
            </View>
            <Text style={styles.flashTitle}>Sony WH-1000XM5</Text>
            <View style={styles.priceRow}>
              <Text style={styles.flashPrice}>RWF 35,000</Text>
              <Text style={styles.flashOldPrice}>50,000</Text>
            </View>
          </View>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=300' }} style={styles.flashImage} />
        </TouchableOpacity>

        {/* Live Support Help Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
        </View>
        <TouchableOpacity 
          style={styles.helpCard} 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ChatSupport')}
        >
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>24/7 Live Support</Text>
            <Text style={styles.helpSub}>Chat with our gadget experts now</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>We are online</Text>
            </View>
          </View>
          <View style={styles.helpIconBox}>
            <MessageSquare size={32} color={COLORS.primaryBlue} />
          </View>
        </TouchableOpacity>

        {/* Discovery Grid — 30+ Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discover Gadgets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <Text style={styles.seeAll}>View all 50+ items</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.discoveryGrid}>
          {allProducts.slice(0, 40).map((p) => (
            <TouchableOpacity 
              key={p.id} 
              style={styles.discoveryCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('ProductDetails', { product: p })}
            >
              <View style={styles.discoveryImageWrap}>
                <Image source={{ uri: p.images[0] }} style={styles.discoveryImage} resizeMode="contain" />
                <TouchableOpacity style={styles.discoveryHeart} onPress={() => toggleWishlist(p)}>
                  <Heart size={14} color={isInWishlist(p.id) ? COLORS.error : '#666'} fill={isInWishlist(p.id) ? COLORS.error : 'none'} />
                </TouchableOpacity>
                {p.compare_price > p.price && (
                  <View style={styles.discoveryBadge}>
                    <Text style={styles.discoveryBadgeText}>OFFER</Text>
                  </View>
                )}
              </View>
              <View style={styles.discoveryInfo}>
                <Text style={styles.discoveryName} numberOfLines={1}>{p.name}</Text>
                <View style={styles.discoveryMeta}>
                  <Text style={styles.discoveryPrice}>{fmt(p.price)}</Text>
                  <View style={styles.discoveryRating}>
                    <Star size={10} color="#FBBC04" fill="#FBBC04" />
                    <Text style={styles.discoveryRatingText}>{p.rating}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.discoveryAddBtn} onPress={() => addToCart(p)}>
                  <ShoppingBag size={14} color="#fff" />
                  <Text style={styles.discoveryAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: SIZES.xxl || 40 }} />
      </ScrollView>

      <FloatingSupport />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingTop: SIZES.md, paddingBottom: SIZES.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.md,
  },
  avatarText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  headerTextGroup: { gap: 2, flex: 1 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3,
    marginBottom: 2,
  },
  locationText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
  greeting: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.3 },
  tagline: { fontSize: 12, color: '#888888', fontWeight: '500' },
  notifBtn: {
    width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.sm, borderWidth: 1, borderColor: '#F0F0F0',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFFFFF',
  },

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

  catRow: { flexDirection: 'row', paddingHorizontal: SIZES.lg, paddingRight: 40, marginBottom: SIZES.lg, gap: 16 },
  catItem: { alignItems: 'center', gap: 10, width: 75 },
  catIconWrap: { width: 68, height: 68, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm, borderWidth: 1.5, borderColor: '#F8FAFC', overflow: 'hidden' },
  catIconImg: { width: 44, height: 44, borderRadius: 12 },
  catName: { fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center' },

  hScroll: { paddingHorizontal: SIZES.lg, gap: 16, paddingBottom: SIZES.md },
  featuredCard: { width: 170 },

  productCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 10, 
    ...SHADOWS.md, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.03)',
    marginVertical: 4
  },
  productImageWrap: { 
    position: 'relative', 
    marginBottom: 10, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 18, 
    padding: 6,
    overflow: 'hidden'
  },
  productImage: { width: '100%', height: 135, borderRadius: 14 },
  imagePlaceholder: { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  heartBtn: { 
    position: 'absolute', top: 8, right: 8, 
    width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.9)', 
    borderRadius: 15, justifyContent: 'center', alignItems: 'center', 
    ...SHADOWS.sm 
  },
  productInfo: { paddingHorizontal: 4, gap: 4 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1E293B', letterSpacing: -0.2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  starWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  priceBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  productPriceSmall: { fontSize: 12, fontWeight: '800', color: '#3B82F6' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#3B82F6', marginTop: 4 },

  offerRow: { paddingHorizontal: SIZES.lg, paddingRight: 40, gap: 16, marginBottom: SIZES.lg, paddingBottom: 4 },
  offerCard: {
    width: 160, height: 200, borderRadius: 28,
    ...SHADOWS.md, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  offerImageHalf: { width: '100%', height: '50%', backgroundColor: '#F8F9FA' },
  offerImgFull: { width: '100%', height: '100%' },
  offerContentHalf: { flex: 1, padding: 16, justifyContent: 'center', gap: 6 },
  offerBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 2,
  },
  offerDiscount: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.8 },
  offerLabel: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  offerTagline: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  helpCard: {
    marginHorizontal: SIZES.lg,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  helpContent: { flex: 1, gap: 4 },
  helpTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  helpSub: { fontSize: 13, color: COLORS.textSecondary },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primaryGreen },
  onlineText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryGreen },
  helpIconBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },

  bannerContainerWrap: { marginBottom: SIZES.lg },
  bannerSubtitle: { fontSize: 12, color: '#E0E7FF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

  flashDealContainer: { backgroundColor: '#FFF5F5', marginHorizontal: SIZES.lg, borderRadius: 20, padding: 16, flexDirection: 'row', ...SHADOWS.sm, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: SIZES.lg },
  flashDealContent: { flex: 1, justifyContent: 'center', gap: 6 },
  flashHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  flashBadgeWrap: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  flashBadgeText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF' },
  flashTimer: { fontSize: 11, fontWeight: '800', color: '#EF4444' },
  flashTitle: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashPrice: { fontSize: 15, fontWeight: '900', color: '#EF4444' },
  flashOldPrice: { fontSize: 12, color: '#999999', textDecorationLine: 'line-through', fontWeight: '600' },
  flashImage: { width: 90, height: 90, borderRadius: 12, alignSelf: 'center' },

  discoveryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg - 6,
    justifyContent: 'space-between',
  },
  discoveryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    overflow: 'hidden',
  },
  discoveryImageWrap: {
    height: 140,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  discoveryImage: {
    width: '100%',
    height: '100%',
  },
  discoveryHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoveryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discoveryBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  discoveryInfo: {
    padding: 12,
    gap: 8,
  },
  discoveryName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  discoveryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discoveryPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryBlue,
  },
  discoveryRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  discoveryRatingText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  discoveryAddBtn: {
    backgroundColor: COLORS.textPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  discoveryAddText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
