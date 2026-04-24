import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, ShoppingCart } from 'lucide-react-native';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function WishlistScreen({ navigation }) {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const fmt = (n) => `RWF ${n.toLocaleString()}`;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        {item.images?.[0]
          ? <Image source={{ uri: item.images[0] }} style={styles.image} />
          : <View style={[styles.image, styles.imagePlaceholder]}>
              <Heart size={32} color={COLORS.textMuted} />
            </View>
        }
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromWishlist(item.id)}
      >
        <Heart size={18} color={COLORS.error} fill={COLORS.error} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>{fmt(item.price)}</Text>
        <TouchableOpacity
          style={[styles.addBtn, isInCart(item.id) && styles.addBtnDone]}
          onPress={() => !isInCart(item.id) && addToCart(item)}
          activeOpacity={0.8}
        >
          <ShoppingCart size={14} color="#fff" />
          <Text style={styles.addBtnText}>
            {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Text style={styles.headerCount}>{wishlistItems.length}</Text>
      </View>

      <FlatList
        data={wishlistItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={wishlistItems.length === 0 ? { flex: 1 } : styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Heart size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No saved items</Text>
            <Text style={styles.emptySub}>Tap the heart icon on any product to save it here</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.browseBtnText}>Browse Products</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.sm,
    padding: SIZES.lg, paddingBottom: SIZES.sm,
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: COLORS.cardBg,
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.textPrimary },
  headerCount: {
    fontSize: SIZES.fontSm, color: '#fff', fontWeight: '700',
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.sm, paddingVertical: 2,
  },
  list: { padding: SIZES.md, paddingBottom: SIZES.xxl },
  row: { justifyContent: 'space-between', marginBottom: SIZES.sm },
  card: {
    width: '48.5%', backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg, overflow: 'hidden', ...SHADOWS.sm,
  },
  image: { width: '100%', height: 150 },
  imagePlaceholder: { backgroundColor: COLORS.surfaceBg, justifyContent: 'center', alignItems: 'center' },
  removeBtn: {
    position: 'absolute', top: SIZES.sm, right: SIZES.sm,
    backgroundColor: 'rgba(15,23,42,0.7)', borderRadius: SIZES.radiusFull,
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
  },
  info: { padding: SIZES.sm, gap: SIZES.xs },
  name: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.textPrimary },
  price: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.primaryGreen },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusSm,
    paddingVertical: SIZES.xs + 2, marginTop: 2,
  },
  addBtnDone: { backgroundColor: COLORS.primaryGreen },
  addBtnText: { color: '#fff', fontSize: SIZES.fontXs, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm, padding: SIZES.xl },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.cardBg,
    justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm,
  },
  emptyTitle: { fontSize: SIZES.fontXl, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, textAlign: 'center' },
  browseBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.md, paddingHorizontal: SIZES.xl, marginTop: SIZES.sm,
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.fontMd },
});
