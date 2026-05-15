import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2, ShoppingBag, Ticket, CheckCircle2 } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function CartScreen({ navigation }) {
  const { 
    cartItems, updateQuantity, removeFromCart, 
    subtotal, shippingFee, total, 
    promoDiscount, activePromo, applyPromoCode 
  } = useCart();
  const [promoInput, setPromoInput] = React.useState('');
  const [promoMsg, setPromoMsg] = React.useState(null);

  const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMsg(res);
    if (res.success) setPromoInput('');
    setTimeout(() => setPromoMsg(null), 3000);
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
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySub}>Add items you love to your cart</Text>
      <TouchableOpacity
        style={styles.shopBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopBtnText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  return (
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
          {/* Promotion Code Section */}
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
                style={[styles.promoBtn, activePromo && { backgroundColor: COLORS.primaryGreen }]}
                onPress={handleApplyPromo}
                disabled={!!activePromo}
              >
                {activePromo ? <CheckCircle2 size={18} color="#fff" /> : <Text style={styles.promoBtnText}>Apply</Text>}
              </TouchableOpacity>
            </View>
            {promoMsg && (
              <Text style={[styles.promoMsg, promoMsg.success ? styles.promoMsgSuccess : styles.promoMsgError]}>
                {promoMsg.message}
              </Text>
            )}
          </View>

          <View style={styles.summaryRows}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, shippingFee === 0 && { color: COLORS.primaryGreen }]}>
                {shippingFee === 0 ? 'FREE' : fmt(shippingFee)}
              </Text>
            </View>
            {promoDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount ({activePromo})</Text>
                <Text style={[styles.summaryValue, { color: COLORS.error }]}>-{fmt(promoDiscount)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{fmt(total)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}
            activeOpacity={0.85}
          >
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  shopBtn: { backgroundColor: COLORS.primaryBlue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  shopBtnText: { color: '#fff', fontWeight: '700' },
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
});
