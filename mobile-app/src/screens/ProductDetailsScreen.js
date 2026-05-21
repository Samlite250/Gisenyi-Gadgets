import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, Alert, Dimensions, ActivityIndicator, Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, Heart, Share2, Star,
  Minus, Plus, ShoppingCart, Zap, CircleCheckBig,
  Maximize2, X, Store, ChevronDown, ChevronUp,
  ShieldCheck, Truck, RefreshCw, Award,
} from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Modal } from 'react-native';
import { FileSystem, Sharing } from '../utils/nativeShare';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { ReviewCard, WriteReviewModal } from '../components/ReviewComponents';
import { productLogger } from '../utils/logger';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const [product, setProduct] = useState(route.params?.product || null);
  const [loadingProduct, setLoadingProduct] = useState(!product);

  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descOverflows, setDescOverflows] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [hasBought, setHasBought] = useState(false);
  const scrollRef = useRef(null);

  // Fetch full product if only ID was passed or for fresh data
  useEffect(() => {
    const fetchFullProduct = async () => {
      const pId = route.params?.product?.id || route.params?.productId;
      if (!pId) return;
      
      try {
        const { data, error } = await supabase.from('products').select('*, categories(name)').eq('id', pId).single();
        if (!error && data) {
          setProduct(data);
          if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
          if (data.storage_options?.length > 0) setSelectedStorage(data.storage_options[0]);
        }
      } catch (err) {
        productLogger.error('Product fetch failed', err);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchFullProduct();
  }, [route.params?.product?.id, route.params?.productId]);

  // Calculate real rating distribution
  const ratingDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { if (ratingDist[r.rating] !== undefined) ratingDist[r.rating]++; });
  const totalWithReviews = reviews.length || 1;
  const getRatingPer = (r) => Math.round((ratingDist[r] / totalWithReviews) * 100);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!product.id || product.id === 'demo-1') return;
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        // Fetch profile names manually for each review to avoid join issues
        const reviewsWithNames = await Promise.all(data.map(async (r) => {
          const { data: p } = await supabase.from('profiles').select('full_name').eq('id', r.user_id).maybeSingle();
          return { ...r, profiles: { full_name: p?.full_name || 'Verified Buyer' } };
        }));
        setReviews(reviewsWithNames);
      }
    } catch (e) {
      productLogger.error('Reviews fetch failed', e);
    } finally {
      setLoadingReviews(false);
    }
  }, [product.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Fetch related products
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        // Build query: same category, exclude current product
        let qb = supabase
          .from('products')
          .select('id, name, price, images, rating, brand, category_id')
          .eq('is_active', true)
          .neq('id', product.id)
          .limit(10);

        // Filter by category_id if it looks like a UUID; otherwise try slug match
        const catId = product.category_id;
        if (catId) {
          const isUUID = /^[0-9a-f-]{36}$/.test(catId);
          if (isUUID) {
            qb = qb.eq('category_id', catId);
          } else {
            // Resolve slug → UUID first
            const { data: catRow } = await supabase
              .from('categories')
              .select('id')
              .or(`slug.eq.${catId},name.ilike.${catId}`)
              .maybeSingle();
            if (catRow?.id) qb = qb.eq('category_id', catRow.id);
          }
        }

        const { data } = await qb;
        if (data && data.length > 0) {
          const parsed = data.map(p => {
            let imgs = [];
            try { imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []); } catch(e) {}
            const validImg = imgs.filter(i => typeof i === 'string' && i.startsWith('http'));
            return { ...p, images: validImg.length > 0 ? validImg : ['https://images.unsplash.com/photo-1526406915894-7bcd65f60845?q=80&w=600'] };
          });
          setRelatedProducts(parsed);
        }
      } catch (err) {
        productLogger.error('Related products fetch failed', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [product.id, product.category_id]);

  // Fetch supplier, product-level, or global support details
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        // 1. Try to get WhatsApp from product record directly (some schemas have it there)
        if (product.whatsapp || product.phone) {
          setSupplier({ phone: product.whatsapp || product.phone, business_name: 'Gisenyi Gadgets' });
          return;
        }

        // 2. Try to get supplier info if product has a supplier_id
        if (product.supplier_id) {
          const { data: sup } = await supabase
            .from('suppliers')
            .select('phone, business_name')
            .eq('id', product.supplier_id)
            .maybeSingle();
          if (sup?.phone) {
            setSupplier(sup);
            return;
          }
        }

        // 3. Fallback: Get global store WhatsApp from platform_settings
        const { data: settings } = await supabase
          .from('platform_settings')
          .select('value')
          .eq('key', 'whatsappNumber')
          .maybeSingle();

        if (settings?.value) {
          setSupplier({ phone: settings.value, business_name: 'Gisenyi Gadgets' });
        }
      } catch (e) {
        productLogger.error('Contact info fetch failed', e);
      }
    };
    fetchContactInfo();
  }, [product.id, product.supplier_id, product.whatsapp, product.phone]);

  // Check if user has bought this product
  useEffect(() => {
    const checkPurchase = async () => {
      if (!user || !product.id || product.id === 'demo-1') return;
      try {
        const { count, error } = await supabase
          .from('order_items')
          .select('*', { count: 'exact', head: true })
          .eq('product_id', product.id)
          .innerJoin('orders', 'order_items.order_id', 'orders.id')
          .eq('orders.user_id', user.id)
          .eq('orders.status', 'delivered'); 
        
        if (!error && count > 0) setHasBought(true);
      } catch (e) {
        // Fallback check if join fails
        try {
          const { data: myOrders } = await supabase.from('orders').select('id').eq('user_id', user.id).eq('status', 'delivered');
          if (myOrders?.length > 0) {
            const orderIds = myOrders.map(o => o.id);
            const { count: itemMatch } = await supabase.from('order_items').select('*', { count: 'exact', head: true }).in('order_id', orderIds).eq('product_id', product.id);
            if (itemMatch > 0) setHasBought(true);
          }
        } catch(e2) {}
      }
    };
    checkPurchase();
  }, [user, product.id]);

  const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;
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

  const handleWhatsApp = async () => {
    const rawPhone = supplier?.phone || '+250788000000';
    let cleanPhone = rawPhone.replace(/[^\d+]/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '+250' + cleanPhone.slice(1);
    const intlNumber = cleanPhone.replace('+', '');

    const price = product.price
      ? `RWF ${Number(product.price).toLocaleString()}`
      : 'Ask for price';

    const message =
      `Hello! I'm interested in purchasing this item from Gisenyi Gadgets:\n\n` +
      `📦 *${product.name}*\n` +
      `🏷️ Brand: ${product.brand || 'Gisenyi Gadgets'}\n` +
      `💰 Price: ${price}\n` +
      `🆔 Ref: #GG-${product.id.toString().slice(0, 6).toUpperCase()}\n\n` +
      `Is it available? Please confirm and share delivery details.`;

    const imageUrl = images[0];
    const canShare = Platform.OS !== 'web' && Sharing && await Sharing.isAvailableAsync();

    if (canShare && imageUrl) {
      try {
        // Download product image to a temp file then share with message
        const ext = imageUrl.split('?')[0].split('.').pop()?.split('/').pop() || 'jpg';
        const localUri = `${FileSystem.cacheDirectory}product_share.${ext}`;
        const { uri } = await FileSystem.downloadAsync(imageUrl, localUri);
        await Sharing.shareAsync(uri, {
          mimeType: `image/${ext === 'webp' ? 'webp' : 'jpeg'}`,
          dialogTitle: message,
          UTI: 'public.image',
        });
        return;
      } catch {
        // fall through to wa.me link if image share fails
      }
    }

    // Web or image share failed — open WhatsApp with text only
    Linking.openURL(`https://wa.me/${intlNumber}?text=${encodeURIComponent(message)}`)
      .catch(() => Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`));
  };

  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
  ];

  if (loadingProduct || !product) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {loadingProduct ? (
          <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        ) : (
          <Text style={{ color: COLORS.textSecondary }}>Product not found</Text>
        )}
      </SafeAreaView>
    );
  }

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
              <TouchableOpacity 
                key={i} 
                activeOpacity={0.9} 
                onPress={() => setIsZoomVisible(true)}
              >
                <Image source={{ uri: img }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.zoomHint}>
                  <Maximize2 size={16} color="#fff" />
                  <Text style={styles.zoomHintText}>Tap to zoom</Text>
                </View>
              </TouchableOpacity>
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
                  <Image source={{ uri: img }} style={styles.thumbnail} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Details */}
        <View style={styles.details}>
          {!!product.brand && (
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
            {!!product.compare_price && (
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

          {/* Trust Badges */}
          <View style={styles.badgesRow}>
            {[
              { Icon: ShieldCheck, label: 'Warranty' },
              { Icon: Truck, label: 'Fast Delivery' },
              { Icon: RefreshCw, label: 'Easy Returns' },
              { Icon: Award, label: 'Genuine' },
            ].map(({ Icon, label }) => (
              <View key={label} style={styles.badge}>
                <Icon size={18} color={COLORS.primaryBlue} strokeWidth={2} />
                <Text style={styles.badgeText}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {!!product.description && (
            <View style={styles.descSection}>
              <View style={styles.descHeader}>
                <View style={styles.descHeaderAccent} />
                <Text style={styles.descTitle}>About this Product</Text>
              </View>
              <View>
                <Text
                  style={styles.descText}
                  numberOfLines={descExpanded ? undefined : 4}
                  onTextLayout={(e) => {
                    if (!descExpanded) setDescOverflows(e.nativeEvent.lines.length >= 4);
                  }}
                >
                  {product.description}
                </Text>
                {(descOverflows || descExpanded) && (
                  <TouchableOpacity
                    style={styles.readMoreBtn}
                    onPress={() => setDescExpanded(v => !v)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.readMoreText}>
                      {descExpanded ? 'Show less' : 'Read more'}
                    </Text>
                    {descExpanded
                      ? <ChevronUp size={14} color={COLORS.primaryBlue} />
                      : <ChevronDown size={14} color={COLORS.primaryBlue} />
                    }
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Specs Table */}
          {(() => {
            const specs = [];
            if (product.brand) specs.push(['Brand', product.brand]);
            if (product.model) specs.push(['Model', product.model]);
            if (product.storage_options?.length) specs.push(['Storage', product.storage_options.join(', ')]);
            if (product.colors?.length) specs.push(['Colors', product.colors.join(', ')]);
            if (product.categories?.name) specs.push(['Category', product.categories.name]);
            if (product.sku) specs.push(['SKU', product.sku]);
            if (product.weight) specs.push(['Weight', `${product.weight}g`]);
            if (product.dimensions) specs.push(['Dimensions', product.dimensions]);
            if (product.warranty) specs.push(['Warranty', product.warranty]);
            if (specs.length === 0) return null;
            return (
              <View style={styles.specsSection}>
                <View style={styles.descHeader}>
                  <View style={styles.descHeaderAccent} />
                  <Text style={styles.descTitle}>Specifications</Text>
                </View>
                <View style={styles.specsTable}>
                  {specs.map(([label, value], i) => (
                    <View key={label} style={[styles.specRow, i % 2 === 0 && styles.specRowAlt]}>
                      <Text style={styles.specLabel}>{label}</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })()}

          {/* Seller Information Section */}
          <View style={styles.sellerSection}>
            <View style={styles.sellerCard}>
              <View style={styles.sellerInfo}>
                <View style={styles.sellerAvatar}>
                  <Store size={20} color={COLORS.primaryBlue} />
                </View>
                <View>
                  <Text style={styles.sellerLabel}>Sold by</Text>
                  <Text style={styles.sellerName}>{supplier?.business_name || 'Gisenyi Gadgets Official'}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.sellerWhatsappBtn}
                onPress={handleWhatsApp}
                activeOpacity={0.7}
              >
                <FontAwesome name="whatsapp" size={18} color="#fff" />
                <Text style={styles.sellerWhatsappText}>Chat</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              {hasBought && (
                <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                  <Text style={styles.seeAll}>✏️ Write a review</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Rating Overview */}
            <View style={styles.ratingOverview}>
              <View style={styles.avgRatingBox}>
                <Text style={styles.avgRatingText}>{product.rating || '4.5'}</Text>
                <View style={styles.starsRow}>
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} color={s <= Math.round(product.rating || 4.5) ? '#FBBC04' : '#E5E7EB'} fill={s <= Math.round(product.rating || 4.5) ? '#FBBC04' : 'none'} />
                  ))}
                </View>
                <Text style={styles.totalReviewsText}>{product.review_count || reviews.length} reviews</Text>
              </View>
              <View style={styles.ratingBars}>
                {[5,4,3,2,1].map(r => (
                  <View key={r} style={styles.barRow}>
                    <Text style={styles.barLabel}>{r} ★</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${getRatingPer(r)}%` }]} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Review List */}
            {loadingReviews ? (
              <ActivityIndicator size="small" color={COLORS.primaryBlue} style={{ marginVertical: 16 }} />
            ) : reviews.length === 0 ? (
              <View style={styles.noReviews}>
                <Text style={styles.noReviewsText}>No reviews yet. Be the first!</Text>
              </View>
            ) : (
              (showAllReviews ? reviews : reviews.slice(0, 3)).map((rev) => (
                <ReviewCard key={rev.id} rev={rev} />
              ))
            )}

            {reviews.length > 3 && (
              <TouchableOpacity style={styles.viewMoreReviews} onPress={() => setShowAllReviews(v => !v)}>
                <Text style={styles.viewMoreText}>
                  {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Related Products Section */}
          <View style={styles.relatedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Related Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search', { category: product.category_id })}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {loadingRelated ? (
              <ActivityIndicator size="small" color={COLORS.primaryBlue} style={{ marginVertical: 20 }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedScroll}>
                {relatedProducts.length > 0 ? relatedProducts.map((p) => (
                  <TouchableOpacity 
                    key={p.id} 
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ProductDetails', { product: p })}
                  >
                    <Image source={{ uri: p.images[0] }} style={styles.relatedImage} />
                    <Text style={styles.relatedName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.relatedPrice}>RWF {Number(p.price).toLocaleString()}</Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={{ color: COLORS.textMuted, paddingVertical: 16 }}>No related products found.</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cartBtn, inCart && { backgroundColor: '#34A853', borderWidth: 0 }]}
          onPress={handleAddToCart}
          activeOpacity={0.7}
        >
          <Text style={styles.cartBtnText}>{inCart ? 'In Cart' : 'Add to Cart'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuyNow}
          disabled={product.stock === 0}
          activeOpacity={0.8}
        >
          <Zap size={18} color="#fff" fill="#fff" />
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Zoom Modal */}
      <Modal visible={isZoomVisible} transparent={false} animationType="fade" onRequestClose={() => setIsZoomVisible(false)}>
        <SafeAreaView style={styles.zoomModal}>
          <View style={styles.zoomHeader}>
            <TouchableOpacity style={styles.zoomClose} onPress={() => setIsZoomVisible(false)}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.zoomCount}>{activeImage + 1} / {images.length}</Text>
          </View>
          
          <ScrollView 
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            contentOffset={{ x: activeImage * width, y: 0 }}
            onMomentumScrollEnd={(e) => setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))}
            style={styles.zoomScroll}
          >
            {images.map((img, i) => (
              <View key={i} style={{ width, height: '100%', justifyContent: 'center' }}>
                <ScrollView 
                  maximumZoomScale={3} 
                  minimumZoomScale={1} 
                  showsHorizontalScrollIndicator={false} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ flex: 1, justifyContent: 'center' }}
                >
                  <Image source={{ uri: img }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
                </ScrollView>
              </View>
            ))}
          </ScrollView>

          <View style={styles.zoomFooter}>
            <Text style={styles.zoomInstruction}>Pinch to zoom • Swipe to navigate</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Write Review Modal */}
      <WriteReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        product={product}
        user={user}
        onSubmitted={fetchReviews}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
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
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
    paddingVertical: SIZES.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  badge: { alignItems: 'center', gap: 5, flex: 1 },
  badgeText: { fontSize: 10, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
  descSection: { marginTop: SIZES.lg },
  descHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  descHeaderAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: COLORS.primaryBlue },
  descTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  descText: { fontSize: 14, color: '#475569', lineHeight: 24, letterSpacing: 0.1 },
  readMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  readMoreText: { fontSize: 13, fontWeight: '700', color: COLORS.primaryBlue },
  specsSection: { marginTop: SIZES.lg },
  specsTable: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  specRow: { flexDirection: 'row', paddingVertical: 11, paddingHorizontal: 14, backgroundColor: '#fff' },
  specRowAlt: { backgroundColor: '#F8FAFC' },
  specLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  specValue: { flex: 1.5, fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'right' },
  footer: {
    flexDirection: 'row',
    padding: SIZES.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.lg,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    ...SHADOWS.lg,
  },
  storagePill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#E5E7EB', backgroundColor: '#fff',
  },
  storagePillActive: { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue },
  storagePillText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
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
  },
  cartBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#000000',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  buyBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#4285F4',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.md,
  },
  cartBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  buyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  sellerSection: {
    marginTop: SIZES.lg,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sellerName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  sellerWhatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#25D366',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  sellerWhatsappText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  relatedSection: { marginTop: SIZES.lg, gap: SIZES.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  sectionTitle: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: SIZES.fontSm, color: COLORS.primaryBlue, fontWeight: '600' },
  relatedScroll: { gap: 16, paddingBottom: 8 },
  relatedCard: { 
    width: 130, 
    gap: 6, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 18, 
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  relatedImage: { width: 114, height: 114, borderRadius: 12, backgroundColor: '#f9f9f9' },
  relatedName: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  relatedPrice: { fontSize: 11, fontWeight: '800', color: COLORS.primaryBlue },
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
  reviewItem: { 
    marginBottom: 16, 
    backgroundColor: '#F8FAFC', 
    padding: 14, 
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16 },
  reviewUser: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  reviewDate: { fontSize: 11, color: COLORS.textMuted },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  viewMoreReviews: { alignItems: 'center', paddingVertical: 8 },
  viewMoreText: { fontSize: 13, fontWeight: '700', color: COLORS.primaryBlue },
  
  // Zoom Modal Styles
  zoomModal: { flex: 1, backgroundColor: '#000' },
  zoomHeader: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 
  },
  zoomClose: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  zoomCount: { color: '#fff', fontSize: 16, fontWeight: '700' },
  zoomScroll: { flex: 1 },
  zoomFooter: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  zoomInstruction: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  zoomHint: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'center', gap: 6
  },
  zoomHintText: { color: '#fff', fontSize: 11, fontWeight: '700' }
});
