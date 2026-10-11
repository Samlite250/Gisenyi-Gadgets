import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, TextInput, ActivityIndicator, Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Minus, Plus, Trash2, ShoppingBag, Ticket, CircleCheckBig, X,
  ArrowRight, ArrowLeft, ShieldCheck, Truck, RotateCcw
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
    promoDiscount, activePromo, applyPromoCode, removePromoCode
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

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.images?.[0]
        ? <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
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
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
            >
              <Minus size={15} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
            >
              <Plus size={15} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => removeFromCart(item.cartItemId)}
          >
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemTotal}>{fmt(item.price * item.quantity)}</Text>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <ShoppingBag size={52} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
      <Text style={styles.emptySub}>{t('cart.startShopping')}</Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopBtnText}>{t('cart.startShopping')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPromoSection = () => (
    <View style={styles.promoContainer}>
      <View style={[styles.promoSection, activePromo && styles.promoSectionActive]}>
        <View style={styles.promoInputWrapper}>
          <Ticket size={20} color={activePromo ? COLORS.primaryGreen : COLORS.textMuted} />
          <TextInput
            style={styles.promoInput}
            placeholder={activePromo ? `Code ${activePromo} Active` : "Promo Code"}
            placeholderTextColor={COLORS.textMuted}
            value={promoInput}
            onChangeText={setPromoInput}
            autoCapitalize="characters"
            editable={!activePromo}
          />
        </View>
        <TouchableOpacity
          style={[styles.promoBtn, activePromo && { backgroundColor: COLORS.error }]}
          onPress={activePromo ? removePromoCode : handleApplyPromo}
          disabled={!activePromo && applyingPromo}
        >
          {activePromo
            ? <X size={18} color="#fff" />
            : applyingPromo
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.promoBtnText}>Apply</Text>}
        </TouchableOpacity>
      </View>
      {promoMsg && (
        <Text style={[styles.promoMsg, promoMsg.success ? styles.promoMsgSuccess : styles.promoMsgError]}>
          {promoMsg.message}
        </Text>
      )}
    </View>
  );

  const renderSummaryRows = () => (
    <View style={styles.summaryRows}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
        <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{t('cart.shipping')}</Text>
        <Text style={[styles.summaryValue, shippingFee === 0 && { color: COLORS.primaryGreen }]}>
          {shippingFee === 0 ? t('common.free', 'FREE') : fmt(shippingFee)}
        </Text>
      </View>
      {promoDiscount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('common.discount', 'Discount')} ({activePromo})</Text>
          <Text style={[styles.summaryValue, { color: COLORS.error }]}>-{fmt(promoDiscount)}</Text>
        </View>
      )}
      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>{t('cart.total')}</Text>
        <Text style={styles.totalAmount}>{fmt(total)}</Text>
      </View>
    </View>
  );

  // Content for Two Column Web Layout
  const renderTwoColumnView = () => (
    <View style={styles.webContainer}>
      <View style={styles.webInner}>
        {/* Header */}
        <View style={styles.webHeader}>
          <View style={styles.webHeaderTitleGroup}>
            <Text style={styles.webHeaderTitle}>My Cart</Text>
            {cartItems.length > 0 && (
              <View style={styles.webBadge}>
                <Text style={styles.webBadgeText}>
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.webContinueShopping}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={16} color={COLORS.primaryBlue} />
            <Text style={styles.webContinueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>

        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <View style={styles.webTwoColumns}>
            {/* Left Column: Cart Items List */}
            <View style={styles.webItemsColumn}>
              {cartItems.map((item) => (
                <View key={item.cartItemId} style={styles.webCartCard}>
                  {item.images?.[0] ? (
                    <Image source={{ uri: item.images[0] }} style={styles.webItemImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.webItemImage, styles.imagePlaceholder]}>
                      <ShoppingBag size={32} color={COLORS.textMuted} />
                    </View>
                  )}
                  <View style={styles.webItemDetails}>
                    <Text style={styles.webItemName}>{item.name}</Text>
                    {(item.selectedColor || item.selectedStorage) && (
                      <Text style={styles.itemVariant}>
                        {[item.selectedColor, item.selectedStorage].filter(Boolean).join(' · ')}
                      </Text>
                    )}
                    <Text style={styles.webItemPrice}>{fmt(item.price)}</Text>

                    <View style={styles.webItemActions}>
                      <View style={styles.qtySelector}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        >
                          <Minus size={15} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        >
                          <Plus size={15} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.webDeleteBtn}
                        onPress={() => removeFromCart(item.cartItemId)}
                      >
                        <Trash2 size={16} color={COLORS.error} />
                        <Text style={styles.webDeleteText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.webItemTotalWrap}>
                    <Text style={styles.webItemTotalLabel}>Total</Text>
                    <Text style={styles.webItemTotal}>{fmt(item.price * item.quantity)}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Right Column: Order Summary Sidebar */}
            <View style={styles.webSummaryColumn}>
              <View style={styles.webSummaryCard}>
                <Text style={styles.webSummaryCardTitle}>Order Summary</Text>

                {renderPromoSection()}
                {renderSummaryRows()}

                <TouchableOpacity
                  style={styles.webCheckoutBtn}
                  onPress={handleCheckout}
                  activeOpacity={0.85}
                >
                  <Text style={styles.webCheckoutBtnText}>{t('cart.checkout')}</Text>
                  <ArrowRight size={18} color="#fff" />
                </TouchableOpacity>

                {/* Trust Badges */}
                <View style={styles.webTrustBadges}>
                  <View style={styles.trustItem}>
                    <ShieldCheck size={18} color={COLORS.primaryGreen} />
                    <Text style={styles.trustText}>Secure Checkout</Text>
                  </View>
                  <View style={styles.trustItem}>
                    <Truck size={18} color={COLORS.primaryBlue} />
                    <Text style={styles.trustText}>Fast Delivery in Rwanda</Text>
                  </View>
                  <View style={styles.trustItem}>
                    <RotateCcw size={18} color={COLORS.textSecondary} />
                    <Text style={styles.trustText}>Official Warranty & Returns</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // Content for Single Column Mobile Layout
  const renderMobileView = () => (
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
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          {renderPromoSection()}
          {renderSummaryRows()}
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleCheckout}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>{t('cart.checkout')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );

  return (
    <WebLayoutWrapper navigation={navigation}>
      {isTwoColumn ? renderTwoColumnView() : renderMobileView()}
    </WebLayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: SIZES.lg, paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerBadge: {
    position: 'absolute', right: 24, top: 44,
    backgroundColor: COLORS.primaryBlue, borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  headerCount: { color: '#fff', fontSize: 11, fontWeight: '800' },
  listContent: { padding: SIZES.lg, paddingBottom: 180 },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  itemImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F5F5F5' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1, gap: 4, paddingHorizontal: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  itemVariant: { fontSize: 12, color: COLORS.textMuted },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primaryGreen },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginTop: 4 },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 4,
    height: 32,
  },
  qtyBtn: { padding: 4 },
  qtyText: { fontSize: 14, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  deleteBtn: { padding: 4 },
  itemTotal: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  footer: {
    padding: SIZES.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.lg,
    borderTopWidth: 1, borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    ...SHADOWS.lg,
  },
  summaryRows: { marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  totalAmount: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  checkoutBtn: {
    backgroundColor: COLORS.textPrimary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md, minHeight: 400 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  shopBtn: { backgroundColor: COLORS.primaryBlue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  promoContainer: { marginBottom: 20 },
  promoSection: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 6,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  promoSectionActive: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: 'rgba(52, 168, 83, 0.05)',
  },
  promoInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    ...Platform.select({
      web: { outlineStyle: 'none' }
    }),
  },
  promoBtn: {
    backgroundColor: COLORS.textPrimary,
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  promoMsg: { fontSize: 12, fontWeight: '600', marginTop: 6, marginLeft: 8 },
  promoMsgSuccess: { color: COLORS.primaryGreen },
  promoMsgError: { color: COLORS.error },

  // ── Two Column Web Styles ─────────────────────────────────────────
  webContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  webInner: {
    width: '100%',
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  webHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  webHeaderTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  webBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  webBadgeText: {
    color: COLORS.primaryBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  webContinueShopping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  webContinueShoppingText: {
    color: COLORS.primaryBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  webTwoColumns: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 32,
  },
  webItemsColumn: {
    flex: 1.5,
    gap: 16,
  },
  webCartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s ease',
      },
      default: SHADOWS.sm,
    }),
  },
  webItemImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
  },
  webItemDetails: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 18,
  },
  webItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  webItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  webItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
  },
  webDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  webDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
  },
  webItemTotalWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: 12,
    minWidth: 130,
  },
  webItemTotalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  webItemTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  webSummaryColumn: {
    width: 380,
    maxWidth: '100%',
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 24,
      },
    }),
  },
  webSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
      },
      default: SHADOWS.lg,
    }),
  },
  webSummaryCardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  webCheckoutBtn: {
    backgroundColor: COLORS.textPrimary,
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        transition: 'transform 0.15s ease',
      },
    }),
  },
  webCheckoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  webTrustBadges: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
