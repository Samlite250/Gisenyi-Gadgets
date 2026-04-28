import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Heart, Share2, Star,
  Minus, Plus, ShoppingCart, Zap, CheckCircle2,
} from 'lucide-react-native';
import FloatingSupport from '../components/FloatingSupport';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { DEMO_PRODUCTS, DEMO_REVIEWS } from '../constants/dummyData';

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
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=600&auto=format&fit=crop'
    ],
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
  const scrollRef = useRef(null);

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

  const handleShare = () => {
    Alert.alert('Share', `Check out ${product.name} on Gisenyi Gadgets!`);
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
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Share2 size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Image Gallery */}
        <View style={styles.galleryWrap}>
          <ScrollView
            ref={scrollRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
            }
          >
            {images.map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
            ))}
          </ScrollView>

          {/* Dots overlay */}
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

        {/* Thumbnail Navigation Strip */}
        {images.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
              {images.map((img, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.thumbnailWrap, i === activeImage && styles.thumbnailActive]}
                  onPress={() => {
                    setActiveImage(i);
                    scrollRef.current?.scrollTo({ x: i * width, animated: true });
                  }}
                >
                  <Image source={{ uri: img }} style={styles.thumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
              <Text style={styles.optionLabel}>Color</Text>
              <View style={styles.optionRow}>
                {product.colors.map((c) => {
                  const colorMap = { 'Titanium Black': '#222', 'Titanium Gray': '#888', 'Titanium Violet': '#4B0082', 'White': '#FFF', 'Blue': '#00F', 'Natural Titanium': '#A09383' };
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.colorDot, { backgroundColor: colorMap[c] || '#000' }, selectedColor === c && styles.colorDotActive]}
                      onPress={() => setSelectedColor(c)}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Storage Options */}
          {product.storage_options?.length > 0 && (
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>Storage</Text>
              <View style={styles.optionRow}>
                {product.storage_options.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.storagePill, selectedStorage === s && styles.storagePillActive]}
                    onPress={() => setSelectedStorage(s)}
                  >
                    <Text style={[styles.storagePillText, selectedStorage === s && { color: '#fff' }]}>{s}</Text>
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
              <Text style={styles.descText}>{product.description}</Text>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Write a review</Text>
              </TouchableOpacity>
            </View>
            
            {/* Rating Overview */}
            <View style={styles.ratingOverview}>
              <View style={styles.avgRatingBox}>
                <Text style={styles.avgRatingText}>{product.rating || '4.5'}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={12} color={s <= Math.round(product.rating || 4.5) ? '#FBBC04' : '#E5E7EB'} fill={s <= Math.round(product.rating || 4.5) ? '#FBBC04' : 'none'} />
                  ))}
                </View>
                <Text style={styles.totalReviewsText}>{product.review_count || 24} reviews</Text>
              </View>
              <View style={styles.ratingBars}>
                {[5, 4, 3, 2, 1].map(r => (
                  <View key={r} style={styles.barRow}>
                    <Text style={styles.barLabel}>{r} ★</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${r === 5 ? 70 : r === 4 ? 20 : 5}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Review List */}
            {DEMO_REVIEWS.slice(0, 2).map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: rev.avatar }} style={styles.reviewAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewUser}>{rev.user}</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={10} color={s <= rev.rating ? '#FBBC04' : '#E5E7EB'} fill={s <= rev.rating ? '#FBBC04' : 'none'} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{rev.date}</Text>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))}
            
            <TouchableOpacity style={styles.viewMoreReviews}>
              <Text style={styles.viewMoreText}>View All {product.review_count || 24} Reviews</Text>
            </TouchableOpacity>
          </View>

          {/* Related Products Section */}
          <View style={styles.relatedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Related Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search', { category: product.category_id })}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
              {DEMO_PRODUCTS
                .filter(p => {
                  // Match by category_id or brand to ensure something always shows
                  const sameCat = p.category_id === product.category_id;
                  const sameBrand = p.brand === product.brand;
                  return (sameCat || sameBrand) && p.id !== product.id;
                })
                .slice(0, 10) // Show more items
                .map((p) => (
                  <TouchableOpacity 
                    key={p.id} 
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ProductDetails', { product: p })}
                  >
                    <Image source={{ uri: p.images[0] }} style={styles.relatedImage} />
                    <Text style={styles.relatedName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.relatedPrice}>RWF {p.price.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cartBtn, inCart && { backgroundColor: COLORS.primaryGreen }]}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          {inCart && <CheckCircle2 size={18} color="#fff" />}
          <Text style={styles.cartBtnText}>{inCart ? 'In Cart ✓' : 'Add to Cart'}</Text>
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

      <FloatingSupport />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: SIZES.md, paddingBottom: 0,
  },
  topBarRight: { flexDirection: 'row', gap: 8 },
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
  price: { fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.primaryGreen },
  comparePrice: {
    fontSize: SIZES.fontMd, color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  optionSection: { gap: SIZES.sm, marginTop: SIZES.sm },
  optionLabel: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '700' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.md, marginTop: SIZES.xs },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#eee' },
  colorDotActive: { borderWidth: 3, borderColor: COLORS.primaryBlue },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginTop: SIZES.xs },
  qtyBtn: {
    width: 40, height: 40, backgroundColor: '#F5F5F5',
    borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center',
  },
  qtyText: {
    fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary,
  },
  descSection: { marginTop: SIZES.md },
  descText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, lineHeight: 22 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: SIZES.md,
    padding: SIZES.lg, paddingBottom: SIZES.xl,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  storagePill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  storagePillActive: { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue },
  storagePillText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  cartBtn: {
    flex: 1, height: 54, backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusSm,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8,
  },
  cartBtnText: { color: '#fff', fontSize: SIZES.fontMd, fontWeight: '700' },
  buyBtn: {
    flex: 1, height: 54, backgroundColor: COLORS.primaryGreen, borderRadius: SIZES.radiusSm,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8,
  },
  buyBtnText: { color: '#fff', fontSize: SIZES.fontMd, fontWeight: '700' },
  thumbnailContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  thumbnailScroll: {
    paddingHorizontal: SIZES.lg,
    gap: 12,
  },
  thumbnailWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  thumbnailActive: {
    borderColor: COLORS.primaryBlue,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  relatedSection: { marginTop: SIZES.lg, gap: SIZES.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  sectionTitle: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: SIZES.fontSm, color: COLORS.primaryBlue, fontWeight: '600' },
  relatedScroll: { gap: 16, paddingBottom: 8 },
  relatedCard: { width: 120, gap: 4 },
  relatedImage: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#f9f9f9' },
  relatedName: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  relatedPrice: { fontSize: 12, fontWeight: '700', color: COLORS.primaryGreen },
  reviewsSection: { marginTop: SIZES.lg, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: SIZES.lg },
  ratingOverview: { flexDirection: 'row', gap: 24, marginBottom: 20, alignItems: 'center' },
  avgRatingBox: { alignItems: 'center', gap: 4 },
  avgRatingText: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary },
  starsRow: { flexDirection: 'row', gap: 2 },
  totalReviewsText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  ratingBars: { flex: 1, gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 11, color: COLORS.textSecondary, width: 25 },
  barBg: { flex: 1, height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#FBBC04' },
  reviewItem: { marginBottom: 16, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 12 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16 },
  reviewUser: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  reviewDate: { fontSize: 11, color: COLORS.textMuted },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  viewMoreReviews: { alignItems: 'center', paddingVertical: 8 },
  viewMoreText: { fontSize: 13, fontWeight: '700', color: COLORS.primaryBlue },
});
