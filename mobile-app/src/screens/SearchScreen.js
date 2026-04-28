import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, ScrollView, Animated,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search, SlidersHorizontal, Star, X, Heart,
  History, TrendingUp, Filter, ArrowRight,
  ChevronRight, ShoppingBag
} from 'lucide-react-native';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { DEMO_PRODUCTS } from '../constants/dummyData';

const TRENDING_TAGS = ['iPhone 15', 'Samsung S24', 'AirPods', 'MacBook M3', 'Gaming', 'Offers'];

export default function SearchScreen({ navigation, route }) {
  const { toggleWishlist, isInWishlist } = useWishlist();

  // States
  const [query, setQuery] = useState(route.params?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('Relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['Samsung', 'iPhone', 'Headphones']);

  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const doSearch = useCallback(async (q, catSlug) => {
    if (!q.trim() && !catSlug) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // ── Resolve category slug → UUID ──────────────────────────
      let categoryUUID = null;
      if (catSlug && catSlug !== 'all') {
        const { data: catRow } = await supabase
          .from('categories')
          .select('id')
          .or(`slug.eq.${catSlug},name.ilike.${catSlug}`)
          .maybeSingle();
        categoryUUID = catRow?.id ?? null;
      }

      let qb = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Text search
      if (q.trim()) {
        qb = qb.or(`name.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%,brand.ilike.%${q.trim()}%`);
      }

      // Filter by UUID only — never send the raw slug
      if (categoryUUID) {
        qb = qb.eq('category_id', categoryUUID);
      }

      // Sorting
      if (sortBy === 'Price: Low→High') qb = qb.order('price', { ascending: true });
      else if (sortBy === 'Price: High→Low') qb = qb.order('price', { ascending: false });
      else if (sortBy === 'Top Rated') qb = qb.order('rating', { ascending: false });
      else qb = qb.order('created_at', { ascending: false });

      const { data, error } = await qb.limit(20);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Fallback to dummy data
        let dummy = DEMO_PRODUCTS;
        if (q.trim()) {
          const lowerQ = q.toLowerCase();
          dummy = dummy.filter(p => p.name.toLowerCase().includes(lowerQ) || p.brand?.toLowerCase().includes(lowerQ));
        }
        if (catSlug && catSlug !== 'all') {
          dummy = dummy.filter(p => p.category_id === catSlug || p.category_id === categoryUUID);
        }
        
        // Sorting dummy
        if (sortBy === 'Price: Low→High') dummy.sort((a,b) => a.price - b.price);
        else if (sortBy === 'Price: High→Low') dummy.sort((a,b) => b.price - a.price);
        else if (sortBy === 'Top Rated') dummy.sort((a,b) => parseFloat(b.rating) - parseFloat(a.rating));
        
        setResults(dummy);
      } else {
        setResults(data);
      }

      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: false,
      }).start();

    } catch (err) {
      console.warn('Search error:', err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, selectedCategory);
      if (query.trim().length > 2 && !recentSearches.includes(query.trim())) {
        setRecentSearches(prev => [query.trim(), ...prev.slice(0, 4)]);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedCategory, doSearch]);

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory(null);
    setResults([]);
  };

  const renderProduct = ({ item }) => {
    const wishlisted = isInWishlist(item.id);
    const discount = item.compare_price ? Math.round((1 - item.price / item.compare_price) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {item.images?.[0] ? (
            <Image source={{ uri: item.images[0] }} style={styles.productImage} />
          ) : (
            <View style={styles.placeholderImg}><ShoppingBag size={24} color={COLORS.textMuted} /></View>
          )}
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={styles.input}
            placeholder="Search phones, laptops..."
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

      {/* Quick Filters / Sort */}
      {showFilters && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {['Relevance', 'Price: Low→High', 'Price: High→Low', 'Top Rated'].map((sort) => (
              <TouchableOpacity
                key={sort}
                style={[styles.sortChip, sortBy === sort && styles.sortChipActive]}
                onPress={() => setSortBy(sort)}
              >
                <Text style={[styles.sortText, sortBy === sort && styles.sortTextActive]}>{sort}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
          <Text style={styles.loadingText}>Searching live database...</Text>
        </View>
      ) : results.length > 0 ? (
        <Animated.FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.resultList}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
          ListHeaderComponent={
            <Text style={styles.resultCount}>{results.length} items found for your search</Text>
          }
        />
      ) : query.trim().length > 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/6134/6134065.png' }}
            style={styles.emptyImg}
          />
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySub}>
            We couldn't find items matching your search. Try checking the spelling or using broader terms like "Galaxy" or "Mac".
          </Text>
          <TouchableOpacity style={styles.clearFiltersBtn} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.landing} showsVerticalScrollIndicator={false}>
          {/* Recent Searches */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
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
              <Text style={styles.sectionTitle}>Trending Tags</Text>
              <TrendingUp size={16} color={COLORS.primaryGreen} />
            </View>
            <View style={styles.trendingList}>
              {TRENDING_TAGS.map((t, i) => (
                <TouchableOpacity key={i} style={styles.trendingItem} onPress={() => setQuery(t)}>
                  <Text style={styles.trendingText}># {t}</Text>
                  <ChevronRight size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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

  filterBar: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
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

  resultList: { paddingHorizontal: SIZES.lg, paddingBottom: 40 },
  resultCount: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginBottom: 16, marginTop: 4 },

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

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 16 },
  emptyImg: { width: 120, height: 120, opacity: 0.8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  clearFiltersBtn: {
    marginTop: 10, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 25, backgroundColor: COLORS.primaryBlue, ...SHADOWS.md
  },
  clearFiltersText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  landing: { flex: 1, paddingHorizontal: SIZES.lg },
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

  trendingList: { gap: 12 },
  trendingItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F9FAFB'
  },
  trendingText: { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
});
