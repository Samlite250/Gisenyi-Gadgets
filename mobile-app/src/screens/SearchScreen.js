import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, ScrollView, Animated,
  ActivityIndicator, RefreshControl, Platform, useWindowDimensions,
} from 'react-native';
import { BlurView } from '../components/BlurView';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, SlidersHorizontal, Star, X, Heart,
  History, TrendingUp, Filter, ArrowRight,
  ChevronRight, ShoppingBag, Home, ArrowLeft
} from 'lucide-react-native';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import SkeletonLoader from '../components/SkeletonLoader';
import WebLayoutWrapper from '../components/WebLayoutWrapper';
import { productLogger } from '../utils/logger';

const TRENDING_TAGS = ['iPhone 15', 'Samsung S24', 'AirPods', 'MacBook M3', 'Gaming', 'Offers'];

export default function SearchScreen({ navigation, route }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const getInitialWebParam = (key) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      return params.get(key);
    }
    return null;
  };

  // States
  const [query, setQuery] = useState(route.params?.query ?? getInitialWebParam('query') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category ?? getInitialWebParam('category') ?? null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('Relevance');
  const [priceRange, setPriceRange] = useState('All Prices');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Samsung', 'iPhone', 'Headphones']);

  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  // Resolve a category slug to a UUID using multiple strategies
  const resolveCategoryUUID = useCallback(async (catSlug) => {
    if (!catSlug || catSlug === 'all') return null;

    // Strategy 1: exact slug match
    const { data: bySlug } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', catSlug)
      .maybeSingle();
    if (bySlug?.id) return bySlug.id;

    // Strategy 2: name starts with slug (handles 'laptops' → 'Laptops & PCs')
    const { data: byName } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', `${catSlug}%`)
      .maybeSingle();
    if (byName?.id) return byName.id;

    // Strategy 3: slug contains the keyword anywhere
    const { data: byPartial } = await supabase
      .from('categories')
      .select('id, name')
      .ilike('name', `%${catSlug}%`)
      .maybeSingle();
    return byPartial?.id ?? null;
  }, []);

  const doSearch = useCallback(async (q, catSlug) => {
    // On mobile, if no query and no category, clear results for landing screen.
    // On desktop, default to showing all active products in the 4-column grid.
    if (!q.trim() && (!catSlug || catSlug === 'all') && !isDesktop) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ── Resolve category slug → UUID ──────────────────────────
      const categoryUUID = await resolveCategoryUUID(catSlug);

      let qb = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Text search — search name, description, brand and sku/tags if available
      if (q.trim()) {
        qb = qb.or(`name.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,brand.ilike.%${q.trim()}%,sku.ilike.%${q.trim()}%`);
      }

      // Filter by category UUID if resolved. Skip filter entirely if UUID lookup failed
      // so text query still returns cross-category results.
      if (categoryUUID) {
        qb = qb.eq('category_id', categoryUUID);
      }

      // Price filtering
      if (priceRange === 'Under 50K') qb = qb.lte('price', 50000);
      else if (priceRange === '50K - 200K') qb = qb.gte('price', 50000).lte('price', 200000);
      else if (priceRange === 'Over 200K') qb = qb.gte('price', 200000);

      // Sorting
      if (sortBy === 'Price: Low→High') qb = qb.order('price', { ascending: true });
      else if (sortBy === 'Price: High→Low') qb = qb.order('price', { ascending: false });
      else if (sortBy === 'Top Rated') qb = qb.order('rating', { ascending: false });
      else qb = qb.order('created_at', { ascending: false });

      const { data, error } = await qb.limit(60);

      if (error) throw error;

      const parsedData = (data || []).map(p => {
        let parsedImages = [];
        try {
          if (typeof p.images === 'string') parsedImages = JSON.parse(p.images);
          else if (Array.isArray(p.images)) parsedImages = p.images;
        } catch (e) { }
        const hasImg = parsedImages.length > 0 && typeof parsedImages[0] === 'string' && parsedImages[0].startsWith('http');
        return { ...p, images: hasImg ? parsedImages : ['https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=600'] };
      });
      setResults(parsedData);

      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: false,
      }).start();

    } catch (err) {
      productLogger.error('Search failed', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy, priceRange, isDesktop, resolveCategoryUUID]);

  useEffect(() => {
    let cat = route.params?.category;
    let q = route.params?.query;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.search) {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get('category');
      const urlQ = params.get('query');
      if (urlCat) cat = urlCat;
      if (urlQ !== null && urlQ !== undefined) q = urlQ;
    }

    if (cat !== undefined) setSelectedCategory(cat);
    if (q !== undefined) setQuery(q);
  }, [route.params?.category, route.params?.query]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedCategory);
      if (query.trim().length > 2 && !recentSearches.includes(query.trim())) {
        setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedCategory, doSearch]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory(null);
    setResults([]);
  };

  const renderProduct = ({ item }) => {
    const wishlisted = isInWishlist(item.id);
    const inCart = isInCart(item.id);
    const discount = item.compare_price ? Math.round((1 - item.price / item.compare_price) * 100) : 0;

    if (isDesktop) {
      return (
        <View key={item.id} style={styles.desktopGridCardWrapper}>
          <TouchableOpacity
            style={styles.desktopGridCard}
            onPress={() => navigation.navigate('ProductDetails', { product: item })}
            activeOpacity={0.9}
            {...(Platform.OS === 'web' ? { dataSet: { hover: 'true' } } : {})}
          >
            <View style={styles.desktopImageWrap}>
              <Image
                source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=600' }}
                style={styles.desktopProductImg}
                resizeMode="contain"
              />
              {discount > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>-{discount}%</Text>
                </View>
              )}
              <TouchableOpacity style={styles.desktopWishlistBtn} onPress={() => toggleWishlist(item)}>
                <Heart size={16} color={wishlisted ? COLORS.error : '#64748B'} fill={wishlisted ? COLORS.error : 'none'} />
              </TouchableOpacity>
            </View>

            <View style={styles.desktopCardBody}>
              <Text style={styles.productBrand}>{item.brand || 'PREMIUM GADGET'}</Text>
              <Text style={styles.desktopProductName} numberOfLines={2}>{item.name}</Text>

              <View style={styles.desktopRatingRow}>
                <Star size={12} color="#FBBC04" fill="#FBBC04" />
                <Text style={styles.ratingText}>{item.rating || '4.8'}</Text>
                <Text style={styles.reviewCount}>({item.review_count || 12})</Text>
              </View>

              <View style={styles.desktopPriceRow}>
                <Text style={styles.desktopPriceText}>{fmt(item.price)}</Text>
                {item.compare_price > item.price && (
                  <Text style={styles.comparePrice}>{fmt(item.compare_price)}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.desktopAddCartBtn, inCart && styles.desktopAddCartBtnDone]}
                onPress={() => addToCart(item)}
                activeOpacity={0.85}
              >
                <ShoppingBag size={14} color="#FFFFFF" />
                <Text style={styles.desktopAddCartText}>
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images?.[0] || 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=600' }}
            style={styles.productImage}
          />
          {discount > 0 && <View style={styles.discountPill}><Text style={styles.discountVal}>-{discount}%</Text></View>}
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productBrand}>{item.brand || 'Premium Gadget'}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#FBBC04" fill="#FBBC04" />
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
            <Text style={styles.reviewCount}>({item.review_count || 0})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{fmt(item.price)}</Text>
            {item.compare_price && <Text style={styles.comparePrice}>{fmt(item.compare_price)}</Text>}
          </View>
        </View>
        <TouchableOpacity style={styles.wishlistIcon} onPress={() => toggleWishlist(item)}>
          <Heart size={18} color={wishlisted ? COLORS.error : COLORS.textMuted} fill={wishlisted ? COLORS.error : 'none'} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getPageTitle = () => {
    const catLabel = selectedCategory && selectedCategory !== 'all'
      ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
      : null;
    if (query && catLabel) return `"${query}" in ${catLabel}`;
    if (query) return `Search: "${query}"`;
    if (catLabel) return `${catLabel} Collection`;
    return 'All Gadgets & Products';
  };

  return (
    <WebLayoutWrapper navigation={navigation}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Mobile Search Header (hidden on Desktop view) */}
        {!isDesktop && (
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <Search size={20} color={COLORS.textSecondary} />
              <TextInput
                ref={searchInputRef}
                style={styles.input}
                placeholder={t('search.placeholder')}
                placeholderTextColor={COLORS.textMuted}
                value={query}
                onChangeText={setQuery}
                autoFocus
                clearButtonMode="while-editing"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={20} color={showFilters ? '#fff' : COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Desktop Compact Header & Filter Bar */}
        {isDesktop && (
          <View style={styles.desktopHeaderBanner}>
            <View style={styles.desktopTitleRow}>
              <Text style={styles.desktopCategoryTitle}>{getPageTitle()}</Text>
              <Text style={styles.desktopResultCount}>({results.length})</Text>
            </View>

            <View style={styles.desktopFilterBar}>
              <View style={styles.desktopFilterGroup}>
                <Text style={styles.desktopFilterLabel}>Sort by:</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[
                    { key: 'Relevance', label: t('search.relevance') },
                    { key: 'Price: Low→High', label: t('search.priceLowToHigh') },
                    { key: 'Price: High→Low', label: t('search.priceHighToLow') },
                    { key: 'Top Rated', label: t('search.topRated') }
                  ].map((sort) => (
                    <TouchableOpacity
                      key={sort.key}
                      style={[styles.sortChipCompact, sortBy === sort.key && styles.sortChipActive]}
                      onPress={() => setSortBy(sort.key)}
                    >
                      <Text style={[styles.sortTextCompact, sortBy === sort.key && styles.sortTextActive]}>{sort.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.desktopFilterGroup}>
                <Text style={styles.desktopFilterLabel}>Price:</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[
                    { key: 'All Prices', label: t('search.allPrices') },
                    { key: 'Under 50K', label: t('search.under50k') },
                    { key: '50K - 200K', label: t('search.range50kTo200k') },
                    { key: 'Over 200K', label: t('search.over200k') }
                  ].map((pr) => (
                    <TouchableOpacity
                      key={pr.key}
                      style={[styles.sortChipCompact, priceRange === pr.key && styles.sortChipActive]}
                      onPress={() => setPriceRange(pr.key)}
                    >
                      <Text style={[styles.sortTextCompact, priceRange === pr.key && styles.sortTextActive]}>{pr.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Mobile Filters / Sort Toggle */}
        {!isDesktop && showFilters && (
          <View style={styles.filterBar}>
            <Text style={styles.filterSectionTitle}>{t('search.sortBy')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { key: 'Relevance', label: t('search.relevance') },
                { key: 'Price: Low→High', label: t('search.priceLowToHigh') },
                { key: 'Price: High→Low', label: t('search.priceHighToLow') },
                { key: 'Top Rated', label: t('search.topRated') }
              ].map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[styles.sortChip, sortBy === sort.key && styles.sortChipActive]}
                  onPress={() => setSortBy(sort.key)}
                >
                  <Text style={[styles.sortText, sortBy === sort.key && styles.sortTextActive]}>{sort.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>{t('search.priceRange')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {[
                { key: 'All Prices', label: t('search.allPrices') },
                { key: 'Under 50K', label: t('search.under50k') },
                { key: '50K - 200K', label: t('search.range50kTo200k') },
                { key: 'Over 200K', label: t('search.over200k') }
              ].map((pr) => (
                <TouchableOpacity
                  key={pr.key}
                  style={[styles.sortChip, priceRange === pr.key && styles.sortChipActive]}
                  onPress={() => setPriceRange(pr.key)}
                >
                  <Text style={[styles.sortText, priceRange === pr.key && styles.sortTextActive]}>{pr.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {loading ? (
          <ScrollView style={{ paddingHorizontal: SIZES.lg, paddingTop: 16 }}>
            <View style={isDesktop ? styles.desktopGridContainer : { gap: 16 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <View key={i} style={isDesktop ? styles.desktopGridCardWrapper : styles.productCard}>
                  <SkeletonLoader width={isDesktop ? '100%' : 100} height={isDesktop ? 180 : 100} borderRadius={12} />
                  <View style={{ flex: 1, gap: 8, padding: 12, justifyContent: 'center' }}>
                    <SkeletonLoader width={80} height={10} borderRadius={4} />
                    <SkeletonLoader width={160} height={16} borderRadius={6} />
                    <SkeletonLoader width={100} height={14} borderRadius={4} />
                    <SkeletonLoader width={120} height={20} borderRadius={6} style={{ marginTop: 8 }} />
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : results.length > 0 ? (
          isDesktop ? (
            <ScrollView
              contentContainerStyle={styles.desktopGridContainer}
              showsVerticalScrollIndicator={false}
            >
              {results.map((item) => renderProduct({ item }))}
            </ScrollView>
          ) : (
            <Animated.FlatList
              key="mobile-1-col"
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderProduct}
              numColumns={1}
              contentContainerStyle={styles.resultList}
              showsVerticalScrollIndicator={false}
              style={{ opacity: fadeAnim }}
              ListHeaderComponent={
                <Text style={styles.resultCount}>{t('search.itemsFound', { count: results.length })}</Text>
              }
            />
          )
        ) : query.trim().length > 0 || selectedCategory ? (
          <View style={styles.emptyContainer}>
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6134/6134065.png' }}
              style={styles.emptyImg}
            />
            <Text style={styles.emptyTitle}>{t('search.noResults', { query: query || selectedCategory })}</Text>
            <Text style={styles.emptySub}>
              {t('search.noResultsDescription')}
            </Text>
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>{t('search.clearAllFilters')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.landing} showsVerticalScrollIndicator={false}>
            {/* Recent Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('search.recentSearches')}</Text>
                <History size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.tagCloud}>
                {recentSearches.map((s, i) => (
                  <TouchableOpacity key={i} style={styles.tag} onPress={() => setQuery(s)}>
                    <Text style={styles.tagText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Trending Now */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('search.trendingTags')}</Text>
                <TrendingUp size={16} color={COLORS.primaryGreen} />
              </View>
              <View style={styles.trendingList}>
                {TRENDING_TAGS.map((tag, i) => (
                  <TouchableOpacity key={i} style={styles.trendingItem} onPress={() => setQuery(tag)}>
                    <Text style={styles.trendingText}># {tag}</Text>
                    <ChevronRight size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </WebLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', gap: 12, paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md, alignItems: 'center'
  },
  searchContainer: {
    flex: 1, height: 48, backgroundColor: '#F3F4F6',
    borderRadius: 14, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, gap: 10,
  },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  filterToggle: {
    width: 48, height: 48, backgroundColor: '#F3F4F6',
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  filterToggleActive: { backgroundColor: COLORS.primaryBlue },

  desktopHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  desktopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopCategoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  desktopResultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  desktopFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  desktopFilterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  desktopFilterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  sortChipCompact: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  sortTextCompact: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },

  filterBar: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 16, gap: 12, marginTop: 8 },
  filterSectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, paddingHorizontal: SIZES.lg, marginBottom: 2 },
  filterScroll: { paddingHorizontal: SIZES.lg, gap: 10 },
  sortChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB'
  },
  sortChipActive: { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue },
  sortText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  sortTextActive: { color: '#fff' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },

  resultList: { paddingBottom: 60 },
  resultCount: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 16, marginTop: 4 },

  desktopGridRow: {
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  desktopGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 24,
    paddingBottom: 60,
    alignItems: 'flex-start',
  },
  desktopGridCardWrapper: {
    width: 'calc(25% - 12px)',
    marginBottom: 4,
  },
  desktopGridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    flex: 1,
    transition: 'transform 0.2s ease',
    ...SHADOWS.sm,
  },
  desktopImageWrap: {
    height: 180,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 12,
  },
  desktopProductImg: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  desktopWishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  desktopCardBody: {
    padding: 14,
    gap: 6,
  },
  desktopProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
    height: 40,
  },
  desktopRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  desktopPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  desktopPriceText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#10B981',
  },
  desktopAddCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  desktopAddCartBtnDone: {
    backgroundColor: '#10B981',
  },
  desktopAddCartText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  productCard: {
    flexDirection: 'row', gap: 16, marginBottom: 20,
    backgroundColor: '#fff', borderRadius: 16, padding: 8,
    borderWidth: 1, borderColor: '#F3F4F6', ...SHADOWS.sm,
  },
  imageContainer: { position: 'relative' },
  productImage: { width: 100, height: 100, borderRadius: 12, backgroundColor: '#F9FAFB' },
  placeholderImg: {
    width: 100, height: 100, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center'
  },
  discountPill: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: COLORS.error, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4,
  },
  discountVal: { color: '#fff', fontSize: 10, fontWeight: '800' },

  productDetails: { flex: 1, justifyContent: 'center', gap: 2 },
  productBrand: { fontSize: 10, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase' },
  productName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#333' },
  reviewCount: { fontSize: 12, color: COLORS.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 },
  priceText: { fontSize: 17, fontWeight: '800', color: COLORS.primaryGreen },
  comparePrice: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  wishlistIcon: { position: 'absolute', top: 12, right: 12 },

  emptyContainer: { flex: 1, minHeight: 400, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  emptyImg: { width: 120, height: 120, opacity: 0.8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  clearFiltersBtn: {
    marginTop: 10, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 25, backgroundColor: COLORS.primaryBlue, ...SHADOWS.md
  },
  clearFiltersText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  landing: { flex: 1, minHeight: 600, paddingHorizontal: SIZES.lg },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F3F4F6', borderRadius: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  tagText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },

  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  backHomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  trendingList: { gap: 12 },
  trendingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB'
  },
  trendingText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
});
