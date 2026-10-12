import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  Image, TouchableOpacity, TextInput, ActivityIndicator, Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Minus, Plus, Trash2, ShoppingBag, Ticket, X,
  ArrowRight, ArrowLeft, ShieldCheck, Truck, RotateCcw, Tag,
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import WebLayoutWrapper from '../components/WebLayoutWrapper';

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const {
    cartItems, updateQuantity, removeFromCart,
    subtotal, shippingFee, total,
    promoDiscount, activePromo, applyPromoCode, removePromoCode,
  } = useCart();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isTwoColumn = Platform.OS === 'web' && width >= 800;

  const [promoInput, setPromoInput] = React.useState('');
  const [promoMsg, setPromoMsg] = React.useState(null);
  const [applyingPromo, setApplyingPromo] = React.useState(false);
  const isMounted = useRef(true);

  const handleCheckout = () => {
    if (!user) {
      navigation.navigate('Login', {
        returnTo: 'Checkout',
        message: 'Please sign in or create an account to complete your purchase.',
      });
      return;
    }
    navigation.navigate('Checkout');
  };

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;

  const handleApplyPromo = async () => {
    if (!promoInput.trim() || applyingPromo) return;
    setApplyingPromo(true);
    const res = await applyPromoCode(promoInput);
    if (!isMounted.current) return;
    setApplyingPromo(false);
    setPromoMsg(res);
    if (res.success) setPromoInput('');
    const timer = setTimeout(() => { if (isMounted.current) setPromoMsg(null); }, 3000);
    return () => clearTimeout(timer);
  };

  // ─── Mobile Item Card ──────────────────────────────────────────
  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.images?.[0]
        ? <Image source={{ uri: item.images[0] }} style={styles.itemImage} resizeMode="cover" />
        : <View style={[styles.itemImage, styles.imagePlaceholder]}>
          <ShoppingBag size={28} color={COLORS.textMuted} />
        </View>
      }
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        {(item.selectedColor || item.selectedStorage) && (
          <Text style={styles.itemVariant}>
            {[item.selectedColor, item.selectedStorage].filter(Boolean).join(' · ')}
          </Text>
        )}
        <Text style={styles.itemPrice}>{fmt(item.price)}</Text>
        <View style={styles.itemActions}>
          <View style={styles.qtySelector}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}>
              <Minus size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}>
              <Plus size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => removeFromCart(item.cartItemId)}>
            <Trash2 size={16} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemTotal}>{fmt(item.price * item.quantity)}</Text>
    </View>
  );

  // ─── Empty State ───────────────────────────────────────────────
  const EmptyCart = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <ShoppingBag size={48} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
      <Text style={styles.emptySub}>{t('cart.startShopping')}</Text>
      <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.shopBtnText}>{t('cart.startShopping')}</Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Promo Row ─────────────────────────────────────────────────
  const renderPromoSection = () => (
    <View style={styles.promoBlock}>
      <View style={[styles.promoRow, activePromo && styles.promoRowActive]}>
        <Tag size={16} color={activePromo ? COLORS.primaryGreen : COLORS.textMuted} style={{ marginLeft: 2 }} />
        <TextInput
          style={styles.promoInput}
          placeholder={activePromo ? `"${activePromo}" applied` : 'Promo / Coupon code'}
          placeholderTextColor={activePromo ? COLORS.primaryGreen : COLORS.textMuted}
          value={promoInput}
          onChangeText={setPromoInput}
          autoCapitalize="characters"
          editable={!activePromo}
        />
        <TouchableOpacity
          style={[styles.promoBtn, activePromo && styles.promoBtnActive]}
          onPress={activePromo ? removePromoCode : handleApplyPromo}
          disabled={!activePromo && applyingPromo}
        >
          {activePromo
            ? <X size={16} color="#fff" />
            : applyingPromo
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.promoBtnText}>Apply</Text>}
        </TouchableOpacity>
      </View>
      {promoMsg && (
        <Text style={[styles.promoMsg, promoMsg.success ? styles.promoMsgOk : styles.promoMsgErr]}>
          {promoMsg.message}
        </Text>
      )}
    </View>
  );

  // ─── Price Rows ────────────────────────────────────────────────
  const renderSummaryRows = () => (
    <View style={styles.summaryRows}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
        <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
        <Text style={[styles.summaryValue, shippingFee === 0 && styles.freeText]}>
          {shippingFee === 0 ? 'FREE' : fmt(shippingFee)}
        </Text>
      </View>
      {promoDiscount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount ({activePromo})</Text>
          <Text style={[styles.summaryValue, styles.discountText]}>−{fmt(promoDiscount)}</Text>
        </View>
      )}
      <View style={styles.summaryDivider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>{t('cart.total')}</Text>
        <Text style={styles.totalAmount}>{fmt(total)}</Text>
      </View>
    </View>
  );

  // ─── Mobile Footer ─────────────────────────────────────────────
  const renderFooter = () => {
    if (cartItems.length === 0) return null;
    return (
      <View style={styles.footerContainer}>
        {renderPromoSection()}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          {renderSummaryRows()}
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
            <Text style={styles.checkoutBtnText}>{t('cart.checkout')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Two-Column Desktop Web View ───────────────────────────────
  if (isTwoColumn) {
    return (
      <View style={styles.webPage}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.webScrollContent}>
          <View style={styles.webInner}>

            {/* ── Page Header ── */}
            <View style={styles.webHeader}>
              <View style={styles.webHeaderLeft}>
                <Text style={styles.webHeaderTitle}>My Cart</Text>
                {cartItems.length > 0 && (
                  <View style={styles.webItemBadge}>
                    <Text style={styles.webItemBadgeText}>
                      {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.webBackBtn}
                onPress={() => navigation.navigate('Home')}
                activeOpacity={0.7}
              >
                <ArrowLeft size={15} color={COLORS.primaryBlue} />
                <Text style={styles.webBackBtnText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>

            {cartItems.length === 0 ? <EmptyCart /> : (
              <View style={styles.webColumns}>

                {/* ── Left Column: Item Cards ── */}
                <View style={styles.webItemsCol}>
                  {cartItems.map((item) => (
                    <View key={item.cartItemId} style={styles.webCard}>
                      {/* Image */}
                      <View style={styles.webImgWrap}>
                        {item.images?.[0]
                          ? <Image source={{ uri: item.images[0] }} style={styles.webImg} resizeMode="cover" />
                          : <View style={[styles.webImg, styles.imagePlaceholder]}>
                            <ShoppingBag size={32} color={COLORS.textMuted} />
                          </View>
                        }
                      </View>

                      {/* Info */}
                      <View style={styles.webCardInfo}>
                        <Text style={styles.webItemName} numberOfLines={2}>{item.name}</Text>
                        {(item.selectedColor || item.selectedStorage) && (
                          <View style={styles.variantChip}>
                            <Text style={styles.variantChipText}>
                              {[item.selectedColor, item.selectedStorage].filter(Boolean).join(' · ')}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.webUnitPrice}>{fmt(item.price)} / unit</Text>

                        {/* Controls row */}
                        <View style={styles.webCardControls}>
                          {/* Qty stepper */}
                          <View style={styles.webQtyPill}>
                            <TouchableOpacity
                              style={styles.webQtyBtn}
                              onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            >
                              <Minus size={13} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                            <Text style={styles.webQtyText}>{item.quantity}</Text>
                            <TouchableOpacity
                              style={styles.webQtyBtn}
                              onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            >
                              <Plus size={13} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                          </View>

                          {/* Remove */}
                          <TouchableOpacity
                            style={styles.webRemoveBtn}
                            onPress={() => removeFromCart(item.cartItemId)}
                          >
                            <Trash2 size={14} color={COLORS.error} />
                            <Text style={styles.webRemoveText}>Remove</Text>
                          </TouchableOpacity>

                          {/* Line total */}
                          <Text style={styles.webLineTotal}>{fmt(item.price * item.quantity)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* ── Right Column: Order Summary ── */}
                <View style={styles.webSummaryCol}>
                  <View style={styles.webSummaryCard}>
                    <Text style={styles.webSummaryTitle}>Order Summary</Text>

                    {/* Promo */}
                    {renderPromoSection()}

                    {/* Price rows */}
                    {renderSummaryRows()}

                    {/* CTA */}
                    <TouchableOpacity style={styles.webCheckoutBtn} onPress={handleCheckout} activeOpacity={0.85}>
                      <Text style={styles.webCheckoutText}>{t('cart.checkout')}</Text>
                      <ArrowRight size={18} color="#fff" />
                    </TouchableOpacity>

                    {/* Trust Badges */}
                    <View style={styles.webTrust}>
                      <View style={styles.trustRow}>
                        <ShieldCheck size={16} color={COLORS.primaryGreen} />
                        <Text style={styles.trustText}>Secure 256-bit Checkout</Text>
                      </View>
                      <View style={styles.trustRow}>
                        <Truck size={16} color={COLORS.primaryBlue} />
                        <Text style={styles.trustText}>Fast Delivery in Rwanda</Text>
                      </View>
                      <View style={styles.trustRow}>
                        <RotateCcw size={16} color={COLORS.textSecondary} />
                        <Text style={styles.trustText}>Official Warranty &amp; Returns</Text>
                      </View>
                    </View>
                  </View>
                </View>

              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─── Mobile Single-Column View ─────────────────────────────────
  return (
    <WebLayoutWrapper navigation={navigation}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {cartItems.length > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerCount}>{cartItems.length}</Text>
            </View>
          )}
        </View>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cartItemId}
          renderItem={renderItem}
          contentContainerStyle={cartItems.length === 0 ? { flex: 1 } : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyCart />}
          ListFooterComponent={renderFooter}
        />
      </SafeAreaView>
    </WebLayoutWrapper>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Mobile ──
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: SIZES.lg, paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerBadge: {
    position: 'absolute', right: 24, top: 44,
    backgroundColor: COLORS.primaryBlue, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  headerCount: { color: '#fff', fontSize: 11, fontWeight: '800' },
  listContent: { padding: SIZES.lg, paddingBottom: 60 },

  cartItem: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 18, padding: 12, marginBottom: SIZES.md,
    borderWidth: 1, borderColor: '#F0F4F8', alignItems: 'center', ...SHADOWS.sm,
  },
  itemImage: { width: 76, height: 76, borderRadius: 14, backgroundColor: '#F5F7FA' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1, gap: 3, paddingHorizontal: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, lineHeight: 19 },
  itemVariant: { fontSize: 11, color: COLORS.textMuted },
  itemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primaryGreen },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  qtySelector: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E9EF', borderRadius: 8, height: 30,
  },
  qtyBtn: { paddingHorizontal: 8, height: 30, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 13, fontWeight: '700', minWidth: 22, textAlign: 'center', color: COLORS.textPrimary },
  deleteBtn: { padding: 4 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'right' },

  // ── Empty ──
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, minHeight: 380 },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  shopBtn: { backgroundColor: COLORS.primaryBlue, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12, marginTop: 8 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // ── Promo ──
  promoBlock: { marginBottom: 16 },
  promoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FAFBFC', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: '#E5E9EF',
  },
  promoRowActive: { borderColor: COLORS.primaryGreen, backgroundColor: 'rgba(52,168,83,0.04)' },
  promoInput: {
    flex: 1, height: 42, fontSize: 13, fontWeight: '600', color: COLORS.textPrimary,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  promoBtn: {
    backgroundColor: COLORS.textPrimary, height: 34,
    paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center', alignItems: 'center',
  },
  promoBtnActive: { backgroundColor: COLORS.error },
  promoBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  promoMsg: { fontSize: 12, fontWeight: '600', marginTop: 6, marginLeft: 4 },
  promoMsgOk: { color: COLORS.primaryGreen },
  promoMsgErr: { color: COLORS.error },

  // ── Summary rows ──
  summaryRows: { marginBottom: 18 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  freeText: { color: COLORS.primaryGreen, fontWeight: '700' },
  discountText: { color: COLORS.error },
  summaryDivider: { height: 1, backgroundColor: '#EDF0F4', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  totalAmount: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },

  // ── Mobile footer ──
  footerContainer: { marginTop: 4, marginBottom: SIZES.xl, gap: 12 },
  summaryCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: SIZES.lg, borderWidth: 1, borderColor: '#F0F4F8', ...SHADOWS.sm,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  checkoutBtn: {
    backgroundColor: COLORS.textPrimary, height: 52,
    borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ══ WEB DESKTOP ════════════════════════════════════════════════
  webPage: { flex: 1, backgroundColor: '#F4F6F9' },
  webScrollContent: { paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center' },
  webInner: { width: '100%', maxWidth: 1200 },

  // Page header
  webHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 32, paddingBottom: 24,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  webHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  webHeaderTitle: { fontSize: 30, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.8 },
  webItemBadge: {
    backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  webItemBadgeText: { color: '#4F46E5', fontSize: 13, fontWeight: '700' },
  webBackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingVertical: 9, paddingHorizontal: 16,
    borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E2E8F0',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  webBackBtnText: { color: COLORS.primaryBlue, fontSize: 14, fontWeight: '600' },

  // Two-column layout
  webColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: 28 },
  webItemsCol: { flex: 1, gap: 16 },

  // Cart item card
  webCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#E8EDF3',
    alignItems: 'flex-start',
    ...Platform.select({
      web: { boxShadow: '0 2px 12px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s ease' },
      default: SHADOWS.sm,
    }),
  },
  webImgWrap: {
    width: 108, height: 108, borderRadius: 16,
    backgroundColor: '#F4F6F9',
    borderWidth: 1, borderColor: '#EDF0F4', overflow: 'hidden', flexShrink: 0,
  },
  webImg: { width: 108, height: 108 },
  webCardInfo: { flex: 1, paddingLeft: 20, gap: 6 },
  webItemName: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 22, letterSpacing: -0.2 },
  variantChip: {
    alignSelf: 'flex-start', backgroundColor: '#F1F5F9',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  variantChipText: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  webUnitPrice: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },

  // Controls row inside web card
  webCardControls: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginTop: 10,
  },
  webQtyPill: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#DDE3EC', borderRadius: 10,
    backgroundColor: '#FAFBFC', height: 36,
  },
  webQtyBtn: {
    width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  webQtyText: {
    fontSize: 14, fontWeight: '800', minWidth: 28,
    textAlign: 'center', color: COLORS.textPrimary,
  },
  webRemoveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 9, backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FECACA',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  webRemoveText: { fontSize: 12, fontWeight: '700', color: COLORS.error },
  webLineTotal: {
    marginLeft: 'auto',
    fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.4,
  },

  // Summary sidebar
  webSummaryCol: {
    width: 360,
    ...Platform.select({ web: { position: 'sticky', top: 24 } }),
  },
  webSummaryCard: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 28, borderWidth: 1, borderColor: '#E8EDF3',
    gap: 0,
    ...Platform.select({
      web: { boxShadow: '0 8px 30px rgba(0,0,0,0.07)' },
      default: SHADOWS.lg,
    }),
  },
  webSummaryTitle: {
    fontSize: 22, fontWeight: '900', color: COLORS.textPrimary,
    letterSpacing: -0.5, marginBottom: 20,
  },
  webCheckoutBtn: {
    backgroundColor: '#111827', height: 56, borderRadius: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    marginTop: 4,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      },
    }),
  },
  webCheckoutText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },

  // Trust badges
  webTrust: {
    marginTop: 24, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: '#EDF0F4',
    gap: 11,
  },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
});
