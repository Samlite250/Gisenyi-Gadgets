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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    padding: SIZES.lg, paddingTop: 40,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  headerCount: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  list: { padding: SIZES.lg, gap: SIZES.lg },
  row: { justifyContent: 'space-between', marginBottom: SIZES.md },
  card: { width: '47%', gap: 8 },
  image: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#F5F5F5' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  removeBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: '#fff', borderRadius: 16,
    width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.sm,
  },
  info: { gap: 4 },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  price: { fontSize: 14, fontWeight: '800', color: COLORS.primaryGreen },
  addBtn: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDone: { backgroundColor: COLORS.primaryGreen },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
  browseBtn: { backgroundColor: COLORS.primaryBlue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  browseBtnText: { color: '#fff', fontWeight: '700' },
});
