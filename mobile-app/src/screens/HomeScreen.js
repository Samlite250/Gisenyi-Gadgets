import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Image, FlatList, RefreshControl, Platform, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, Search, ShoppingBag, Heart,
  ChevronRight, Star, MessageSquare,
  Smartphone, Laptop, Headphones, Watch, Gamepad2,
  Cpu, Camera, MapPin, Tablet, Sliders, Flame
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import SkeletonLoader from '../components/SkeletonLoader';


const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=600', // iPhone
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600', // Laptop
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=600', // Watch
  'https://images.unsplash.com/photo-1583394838336-acd97773dbf9?q=80&w=600', // Headphones
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600', // Camera
];

const getFallbackImage = (id) => {
  const hash = String(id || '1').split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length];
};

// ProductCard MUST be outside the parent component to prevent re-mount shaking
const ProductCard = ({ product, style, onPress, onWishlist, wishlisted, fmt }) => (
  <View style={[styles.productCard, style]}>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ flex: 1 }}
    >
      <View style={styles.productImageWrap}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.productImage}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.heartBtn} onPress={onWishlist}>
          <Heart size={16} color={wishlisted ? COLORS.error : '#666'} fill={wishlisted ? COLORS.error : 'none'} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
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
  </View>
);

export default function HomeScreen({ navigation }) {
  const { profile, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);


  const displayName = profile?.full_name?.split(' ')[0]
    || user?.user_metadata?.full_name?.split(' ')[0]
    || 'there';

  const fetchData = useCallback(async () => {
    try {
      const [
        { data: cats, error: catErr },
        { data: products, error: prodErr },
        { data: bannersData },
      ] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(40),
        supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
      ]);

      if (catErr) throw catErr;
      if (prodErr) throw prodErr;

      // ── Categories ────────────────────────────────────────────────
      setCategories(cats || []);

      // ── Banners & Offers ──────────────────────────────────────────
      const allBanners = bannersData || [];
      setBanners(allBanners.filter(b => b.type === 'banner'));
      setOffers(allBanners.filter(b => b.type === 'offer'));

      // ── Products ─────────────────────────────────────────────────
      const dbProducts = (products || []).map(p => {
        let parsedImages = [];
        try {
          if (typeof p.images === 'string') parsedImages = JSON.parse(p.images);
          else if (Array.isArray(p.images)) parsedImages = p.images;
        } catch(e) {}
        const hasImg = parsedImages.length > 0 && typeof parsedImages[0] === 'string' && parsedImages[0].startsWith('http');
        return { ...p, images: hasImg ? parsedImages : [getFallbackImage(p.id)] };
      });

      setFeaturedProducts(dbProducts.filter(p => p.is_featured));
      setAllProducts(dbProducts);

    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
      setCategories([]);
      setFeaturedProducts([]);
      setAllProducts([]);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Real-time subscriptions ────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('home_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => fetchData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  // ProductCard is now defined outside this component — no re-mount shaking

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={{ gap: 6 }}>
            <SkeletonLoader width={80} height={12} borderRadius={6} />
            <SkeletonLoader width={140} height={20} borderRadius={8} />
          </View>
        </View>
        <SkeletonLoader width={'90%'} height={50} borderRadius={16} style={{ alignSelf: 'center', marginBottom: SIZES.lg }} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Banner Skeleton */}
          <SkeletonLoader width={'90%'} height={170} borderRadius={24} style={{ alignSelf: 'center', marginBottom: SIZES.lg }} />
          
          {/* Categories Skeleton */}
          <View style={{ paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg }}>
            <SkeletonLoader width={120} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={{ alignItems: 'center', gap: 8 }}>
                  <SkeletonLoader width={68} height={68} borderRadius={22} />
                  <SkeletonLoader width={50} height={10} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>

          {/* Featured Skeleton */}
          <View style={{ paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg }}>
            <SkeletonLoader width={150} height={24} borderRadius={6} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              {[1, 2, 3].map(i => (
                <View key={i} style={{ gap: 8 }}>
                  <SkeletonLoader width={170} height={150} borderRadius={20} />
                  <SkeletonLoader width={140} height={14} borderRadius={4} />
                  <SkeletonLoader width={80} height={16} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>
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
        <View style={[styles.searchBarWrapper, isSearchFocused && styles.searchBarWrapperFocused]}>
          <View style={styles.searchBar}>
            <Search size={20} color={isSearchFocused ? COLORS.primaryBlue : COLORS.textMuted} />
            <TextInput
              placeholder="Search gadgets, brands..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                <Text style={{ color: COLORS.primaryBlue, fontWeight: '700', fontSize: 13 }}>Clear</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.filterBtn}>
                <Sliders size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Banners Carousel — from DB */}
        {banners.length > 0 && (
          <View style={styles.bannerContainerWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.lg }}
              snapToInterval={Dimensions.get('window').width - SIZES.lg * 2 + 16}
              decelerationRate="fast"
            >
              {banners.map((b, index) => (
                <View
                  key={b.id}
                  style={[
                    styles.banner,
                    { backgroundColor: b.color },
                    index !== banners.length - 1 && { marginRight: 16 }
                  ]}
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                    <Text style={styles.bannerTitle}>{b.title}</Text>
                    <TouchableOpacity style={styles.bannerButton} onPress={() => navigation.navigate('Search')}>
                      <Text style={styles.bannerButtonText}>{b.button_text}</Text>
                    </TouchableOpacity>
                  </View>
                  <Image source={{ uri: b.image_url }} style={styles.bannerImage} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Special Offers — from DB */}
        {offers.length > 0 && (
          <View style={styles.offersSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame size={22} color="#EF4444" fill="#EF4444" />
                <Text style={styles.sectionTitle}>Special Offers</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SIZES.lg }}
              snapToInterval={186}
              decelerationRate="fast"
            >
              {offers.map((offer, index) => (
                <TouchableOpacity
                  key={offer.id}
                  style={[
                    styles.offerCard,
                    { backgroundColor: offer.color },
                    index !== offers.length - 1 && { marginRight: 16 }
                  ]}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('Search', { category: offer.link_category })}
                >
                  <View style={styles.offerImageHalf}>
                    <Image source={{ uri: offer.image_url }} style={styles.offerImgFull} resizeMode="cover" />
                  </View>
                  <View style={styles.offerContentHalf}>
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerDiscount}>{offer.discount}</Text>
                    </View>
                    <Text style={styles.offerLabel}>{offer.label}</Text>
                    <Text style={styles.offerTagline} numberOfLines={2}>{offer.tagline}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}



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
                  <View style={styles.catIconCircle}>
                    <Icon size={28} color={isActive ? '#FFFFFF' : '#64748B'} strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.catName, isActive && { color: '#3B82F6' }]}>{c.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Products Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Results for "${searchQuery}"` : (activeCategory === 'all' ? 'Featured Products' : (categories.find(c => c.id === activeCategory)?.name || '') + ' Products')}
          </Text>
          {!searchQuery && (
            <TouchableOpacity onPress={() => navigation.navigate('Search', { category: activeCategory !== 'all' ? activeCategory : null })}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal={!searchQuery} showsHorizontalScrollIndicator={false} contentContainerStyle={searchQuery ? styles.searchResultGrid : styles.hScroll}>
          {(() => {
            const query = searchQuery.toLowerCase();
            const filtered = allProducts.filter(p => 
              p.name.toLowerCase().includes(query) || 
              (p.brand && p.brand.toLowerCase().includes(query)) ||
              (p.description && p.description.toLowerCase().includes(query))
            );

            if (searchQuery) {
              if (filtered.length === 0) {
                return (
                  <View style={styles.noResults}>
                    <Search size={40} color={COLORS.textMuted} />
                    <Text style={styles.noResultsText}>No products found matching "{searchQuery}"</Text>
                  </View>
                );
              }
              return filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  style={styles.searchResultCard}
                  onPress={() => navigation.navigate('ProductDetails', { product: p })}
                  onWishlist={() => toggleWishlist(p)}
                  wishlisted={isInWishlist(p.id)}
                  fmt={fmt}
                />
              ));
            }

            const selectedCat = categories.find(c => c.id === activeCategory);
            if (activeCategory !== 'all') {
              return allProducts
                .filter(p => p.category_id === activeCategory || (selectedCat && p.category_id === selectedCat.slug))
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    style={styles.featuredCard}
                    onPress={() => navigation.navigate('ProductDetails', { product: p })}
                    onWishlist={() => toggleWishlist(p)}
                    wishlisted={isInWishlist(p.id)}
                    fmt={fmt}
                  />
                ));
            }
            return featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                style={styles.featuredCard}
                onPress={() => navigation.navigate('ProductDetails', { product: p })}
                onWishlist={() => toggleWishlist(p)}
                wishlisted={isInWishlist(p.id)}
                fmt={fmt}
              />
            ));
          })()}
        </ScrollView>



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
            <View key={p.id} style={styles.discoveryCard}>
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProductDetails', { product: p })}
                style={{ flex: 1 }}
              >
                <View style={styles.discoveryImageWrap}>
                  <Image 
                    source={{ uri: (p.images && p.images[0]) || getFallbackImage(p.id) }} 
                    style={styles.discoveryImage} 
                    resizeMode="contain" 
                  />
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
            </View>
          ))}
        </View>

        <View style={{ height: SIZES.xxl || 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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

  searchBarWrapper: {
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.md,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...Platform.select({
      web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' },
      default: SHADOWS.md
    }),
  },
  searchBarWrapperFocused: {
    borderColor: COLORS.primaryBlue,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: { boxShadow: '0px 8px 25px rgba(66, 133, 244, 0.15)' },
      default: SHADOWS.lg
    }),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  },
  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  bannerContainer: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  banner: {
    width: Dimensions.get('window').width - SIZES.lg * 2,
    height: 170,
    borderRadius: 24,
    paddingLeft: SIZES.xl,
    paddingVertical: SIZES.xl,
    paddingRight: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
    paddingRight: SIZES.sm,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    ...SHADOWS.sm,
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  bannerImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginRight: -20,
  },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: SIZES.lg, marginBottom: SIZES.md },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', letterSpacing: -0.5 },
  seeAll: { fontSize: 13, color: '#3B82F6', fontWeight: '700' },

  catRow: { flexDirection: 'row', paddingHorizontal: SIZES.lg, paddingRight: 40, marginBottom: SIZES.lg, gap: 16 },
  catItem: { alignItems: 'center', gap: 10, width: 75 },
  catIconCircle: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#F8FAFC', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: '#F1F5F9', 
  },
  catIconCircleActive: {
    backgroundColor: COLORS.primaryBlue,
    borderColor: COLORS.primaryBlue,
  },
  catName: { fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center' },

  hScroll: { paddingHorizontal: SIZES.lg, gap: 16, paddingBottom: SIZES.md },
  featuredCard: { width: 170 },

  productCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 8, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    marginVertical: 6,
    width: 170,
    height: 250,
    ...SHADOWS.sm,
  },
  productImageWrap: { 
    height: 150,
    backgroundColor: '#F1F5F9', 
    borderRadius: 18, 
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  productImage: { 
    width: '100%', 
    height: '100%',
  },
  imagePlaceholder: { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  heartBtn: { 
    position: 'absolute', top: 8, right: 8, 
    width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.95)', 
    borderRadius: 16, justifyContent: 'center', alignItems: 'center', 
    ...SHADOWS.sm,
    zIndex: 10
  },
  productInfo: { padding: 8, gap: 4 },
  productName: { fontSize: 13, fontWeight: '700', color: '#1E293B', letterSpacing: -0.2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  starWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  priceBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  productPriceSmall: { fontSize: 12, fontWeight: '800', color: '#3B82F6' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#3B82F6', marginTop: 4 },

  offerCard: {
    width: 170,
    height: 240,
    borderRadius: 24,
    ...SHADOWS.md,
    overflow: 'hidden',
    borderWidth: 0,
  },
  offerImageHalf: {
    width: '100%',
    height: '52%',
    backgroundColor: '#F8F9FA',
  },
  offerImgFull: {
    width: '100%',
    height: '100%',
  },
  offerContentHalf: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'flex-start',
    gap: 6,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
    ...SHADOWS.sm,
  },
  offerDiscount: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  offerLabel: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  offerTagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    lineHeight: 18,
  },

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

  bannerContainerWrap: {
    marginBottom: SIZES.xl,
    marginTop: SIZES.md,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },

  offersSection: {
    marginBottom: SIZES.xl,
  },

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
  searchResultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg,
    justifyContent: 'space-between',
  },
  searchResultCard: {
    width: '48%',
    marginBottom: 16,
  },
  noResults: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  noResultsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },

  discoveryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.lg - 6,
    justifyContent: 'space-between',
  },
  discoveryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
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
