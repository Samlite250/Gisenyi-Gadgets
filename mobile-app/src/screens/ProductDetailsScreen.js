import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Heart, Share2, Star,
  Minus, Plus, ShoppingCart, Zap,
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const product = route.params?.product || {
    id: 'demo-1',
    name: 'Samsung Galaxy S24 Ultra',
    price: 850000,
    compare_price: 950000,
    rating: 4.8,
    review_count: 124,
    description: 'The ultimate Galaxy experience with a built-in S Pen, 200MP camera, and titanium frame. Experience AI-powered photography and productivity.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop'],
    colors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet'],
    storage_options: ['256GB', '512GB', '1TB'],
    brand: 'Samsung',
    stock: 12,
  };

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [selectedStorage, setSelectedStorage] = useState(product.storage_options?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;
  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;
  const wishlisted = isInWishlist(product.id);
  const inCart = isInCart(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedStorage);
    Alert.alert('Added to Cart ✓', `${product.name} added to your cart.`, [
      { text: 'Continue Shopping' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, selectedStorage);
    navigation.navigate('Checkout');
  };

  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <ShoppingCart size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image Gallery */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
            }
          >
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Dots */}
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Wishlist + Discount */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => toggleWishlist(product)}
          >
            <Heart
              size={20}
              color={wishlisted ? COLORS.error : COLORS.textSecondary}
              fill={wishlisted ? COLORS.error : 'none'}
            />
          </TouchableOpacity>

          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          {product.brand && (
            <Text style={styles.brand}>{product.brand}</Text>
          )}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Star size={14} color="#FBBC04" fill="#FBBC04" />
            <Text style={styles.ratingText}>
              {product.rating} ({product.review_count} reviews)
            </Text>
            <View style={styles.stockPill}>
              <Text style={styles.stockText}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{fmt(product.price)}</Text>
            {product.compare_price && (
              <Text style={styles.comparePrice}>{fmt(product.compare_price)}</Text>
            )}
          </View>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>
                Color: <Text style={styles.optionSelected}>{selectedColor}</Text>
              </Text>
              <View style={styles.optionRow}>
                {product.colors.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.optionChip, selectedColor === c && styles.optionChipActive]}
                    onPress={() => setSelectedColor(c)}
                  >
                    <Text style={[styles.optionChipText, selectedColor === c && styles.optionChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Storage */}
          {product.storage_options?.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>
                Storage: <Text style={styles.optionSelected}>{selectedStorage}</Text>
              </Text>
              <View style={styles.optionRow}>
                {product.storage_options.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.optionChip, selectedStorage === s && styles.optionChipActive]}
                    onPress={() => setSelectedStorage(s)}
                  >
                    <Text style={[styles.optionChipText, selectedStorage === s && styles.optionChipTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.optionSection}>
            <Text style={styles.optionLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
              >
                <Plus size={16} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descSection}>
              <Text style={styles.descTitle}>About this product</Text>
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cartBtn, inCart && styles.cartBtnDone]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <ShoppingCart size={18} color={inCart ? COLORS.primaryGreen : COLORS.textPrimary} />
          <Text style={[styles.cartBtnText, inCart && { color: COLORS.primaryGreen }]}>
            {inCart ? 'In Cart' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
          activeOpacity={0.85}
        >
          <Zap size={18} color="#fff" />
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: SIZES.md, paddingBottom: 0,
  },
  iconBtn: {
    width: 42, height: 42, backgroundColor: COLORS.cardBg,
    borderRadius: 21, justifyContent: 'center', alignItems: 'center', ...SHADOWS.sm,
  },
  scroll: { paddingBottom: 120 },
  galleryWrap: { position: 'relative' },
  heroImage: { width, height: 320 },
  dots: {
    position: 'absolute', bottom: SIZES.sm, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: SIZES.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 16 },
  wishlistBtn: {
    position: 'absolute', top: SIZES.sm, right: SIZES.md,
    width: 40, height: 40, backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20, justifyContent: 'center', alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute', top: SIZES.sm, left: SIZES.md,
    backgroundColor: COLORS.error, borderRadius: SIZES.radiusFull,
    paddingVertical: 3, paddingHorizontal: SIZES.sm,
  },
  discountText: { color: '#fff', fontSize: SIZES.fontXs, fontWeight: '800' },
  details: { padding: SIZES.lg, gap: SIZES.sm },
  brand: { fontSize: SIZES.fontXs, fontWeight: '700', color: COLORS.primaryBlue, letterSpacing: 1, textTransform: 'uppercase' },
  name: { fontSize: SIZES.fontXl, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  ratingText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, flex: 1 },
  stockPill: {
    backgroundColor: `${COLORS.primaryGreen}20`, borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.sm, paddingVertical: 2,
  },
  stockText: { fontSize: SIZES.fontXs, color: COLORS.primaryGreen, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: SIZES.sm },
  price: { fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.textPrimary },
  comparePrice: {
    fontSize: SIZES.fontMd, color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  optionSection: { gap: SIZES.xs },
  optionLabel: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '500' },
  optionSelected: { color: COLORS.textPrimary, fontWeight: '700' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.xs },
  optionChip: {
    paddingVertical: SIZES.xs, paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.cardBg,
  },
  optionChipActive: { borderColor: COLORS.primaryBlue, backgroundColor: `${COLORS.primaryBlue}15` },
  optionChipText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '500' },
  optionChipTextActive: { color: COLORS.primaryBlue, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: {
    width: 38, height: 38, backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  qtyText: {
    minWidth: 44, textAlign: 'center',
    fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary,
  },
  descSection: { gap: SIZES.xs, marginTop: SIZES.sm },
  descTitle: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary },
  descText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, lineHeight: 22 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: SIZES.sm,
    padding: SIZES.lg, paddingBottom: SIZES.xl,
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl,
    ...SHADOWS.lg,
  },
  cartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.xs,
    backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, height: 52,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  cartBtnDone: { borderColor: COLORS.primaryGreen },
  cartBtnText: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '700' },
  buyBtn: {
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SIZES.xs,
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusLg, height: 52, ...SHADOWS.md,
  },
  buyBtnText: { color: '#fff', fontSize: SIZES.fontMd, fontWeight: '700' },
});
