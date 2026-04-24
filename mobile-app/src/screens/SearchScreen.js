import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, Star, X, Heart } from 'lucide-react-native';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const DEMO_RESULTS = [
  { id: 'p1', name: 'Samsung Galaxy S24 Ultra', price: 850000, compare_price: 950000, rating: 4.8, review_count: 124, brand: 'Samsung', images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=500'], colors: ['Titanium Black', 'Titanium Gray'], storage_options: ['256GB', '512GB'], stock: 12 },
  { id: 'p2', name: 'iPhone 15 Pro Max', price: 1200000, rating: 4.9, review_count: 89, brand: 'Apple', images: ['https://images.unsplash.com/photo-1695048133142-1a20484429b6?q=80&w=500'], colors: ['Natural Titanium'], storage_options: ['256GB', '512GB'], stock: 8 },
  { id: 'p3', name: 'AirPods Pro (3rd Gen)', price: 120000, compare_price: 150000, rating: 4.7, review_count: 201, brand: 'Apple', images: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=500'], colors: ['White'], storage_options: [], stock: 25 },
  { id: 'p4', name: 'MacBook Air M3', price: 1450000, rating: 4.9, review_count: 67, brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500'], colors: ['Space Gray', 'Silver'], storage_options: ['256GB', '512GB'], stock: 5 },
  { id: 'p5', name: 'Sony WH-1000XM5', price: 195000, compare_price: 220000, rating: 4.8, review_count: 156, brand: 'Sony', images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500'], colors: ['Black', 'Silver'], storage_options: [], stock: 18 },
  { id: 'p6', name: 'iPad Pro 12.9"', price: 980000, compare_price: 1100000, rating: 4.7, review_count: 43, brand: 'Apple', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=500'], colors: ['Space Gray', 'Silver'], storage_options: ['128GB', '256GB'], stock: 7 },
];

const SORT_OPTIONS = ['Relevance', 'Price: Low→High', 'Price: High→Low', 'Top Rated'];

export default function SearchScreen({ navigation }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(DEMO_RESULTS);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('Relevance');
  const [showSort, setShowSort] = useState(false);
  const debounceRef = useRef(null);

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const doSearch = useCallback(async (q) => {
    setLoading(true);
    try {
      let qb = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (q.trim()) qb = qb.ilike('name', `%${q}%`);

      if (sortBy === 'Price: Low→High') qb = qb.order('price', { ascending: true });
      else if (sortBy === 'Price: High→Low') qb = qb.order('price', { ascending: false });
      else if (sortBy === 'Top Rated') qb = qb.order('rating', { ascending: false });
      else qb = qb.order('created_at', { ascending: false });

      const { data } = await qb.limit(50);
      if (data?.length) {
        setResults(data);
      } else if (!q.trim()) {
        setResults(DEMO_RESULTS);
      } else {
        setResults([]);
      }
    } catch {
      const filtered = q.trim()
        ? DEMO_RESULTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
        : DEMO_RESULTS;
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  const renderItem = ({ item }) => {
    const discount = item.compare_price
      ? Math.round((1 - item.price / item.compare_price) * 100) : 0;
    const wishlisted = isInWishlist(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        activeOpacity={0.85}
      >
        <View style={styles.imageWrap}>
          {item.images?.[0]
            ? <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
            : <View style={[styles.image, styles.imageFallback]}><Search size={24} color={COLORS.textMuted} /></View>
          }
          {discount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>-{discount}%</Text></View>
          )}
        </View>
        <View style={styles.info}>
          {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color="#FBBC04" fill="#FBBC04" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.review_count})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{fmt(item.price)}</Text>
            {item.compare_price && (
              <Text style={styles.comparePrice}>{fmt(item.compare_price)}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.wishBtn}
          onPress={() => toggleWishlist(item)}
        >
          <Heart
            size={18}
            color={wishlisted ? COLORS.error : COLORS.textSecondary}
            fill={wishlisted ? COLORS.error : 'none'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showSort && styles.filterBtnActive]}
          onPress={() => setShowSort(!showSort)}
        >
          <SlidersHorizontal size={18} color={showSort ? '#fff' : COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      {showSort && (
        <View style={styles.sortPanel}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.sortOpt, sortBy === opt && styles.sortOptActive]}
              onPress={() => { setSortBy(opt); setShowSort(false); }}
            >
              <Text style={[styles.sortOptText, sortBy === opt && styles.sortOptTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''}`}
          {query.trim() ? ` for "${query}"` : ''}
        </Text>
        <Text style={styles.sortLabel}>{sortBy}</Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={results.length === 0 ? { flex: 1 } : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySub}>Try a different search term</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    backgroundColor: '#F5F5F5', borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md, height: 48,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14, outlineStyle: 'none' },
  filterBtn: {
    width: 48, height: 48, backgroundColor: '#F5F5F5',
    borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center',
  },
  filterBtnActive: { backgroundColor: COLORS.primaryBlue },
  sortPanel: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm,
    paddingHorizontal: SIZES.lg, paddingBottom: SIZES.sm,
  },
  sortOpt: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: '#F5F5F5',
  },
  sortOptActive: { backgroundColor: COLORS.primaryBlue },
  sortOptText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  sortOptTextActive: { color: '#fff' },
  resultsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm,
  },
  resultsCount: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  sortLabel: { fontSize: 12, color: COLORS.primaryBlue, fontWeight: '700' },
  list: { paddingHorizontal: SIZES.lg, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    marginBottom: SIZES.lg,
    gap: SIZES.md,
    alignItems: 'center',
  },
  imageWrap: { position: 'relative' },
  image: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#F5F5F5' },
  imageFallback: { justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: COLORS.error, borderRadius: 4,
    paddingVertical: 2, paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  info: { flex: 1, gap: 2 },
  brand: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase' },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rating: { fontSize: 12, color: '#FBBC04', fontWeight: '700' },
  reviews: { fontSize: 12, color: COLORS.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primaryGreen },
  comparePrice: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  wishBtn: { padding: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
});
