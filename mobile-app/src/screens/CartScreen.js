import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function CartScreen({ navigation }) {
  const { cartItems, updateQuantity, removeFromCart, subtotal, shippingFee, total } = useCart();

  const fmt = (n) => `RWF ${n.toLocaleString()}`;

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
          <Text style={styles.headerCount}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</Text>
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
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SIZES.lg, paddingBottom: SIZES.sm,
  },
  headerTitle: { fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.textPrimary },
  headerCount: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '500' },
  listContent: { padding: SIZES.lg, paddingTop: SIZES.sm, paddingBottom: 220 },
  cartItem: {
    flexDirection: 'row', backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg, padding: SIZES.sm,
    marginBottom: SIZES.sm, ...SHADOWS.sm,
  },
  itemImage: { width: 80, height: 80, borderRadius: SIZES.radiusMd },
  imagePlaceholder: { backgroundColor: COLORS.surfaceBg, justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1, marginHorizontal: SIZES.sm, justifyContent: 'space-between' },
  itemName: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.textPrimary },
  itemVariant: { fontSize: SIZES.fontXs, color: COLORS.textMuted, marginTop: 2 },
  itemPrice: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.primaryGreen },
  itemActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtySelector: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.darkBg, borderRadius: SIZES.radiusSm,
  },
  qtyBtn: { padding: SIZES.xs + 2 },
  qtyText: { color: COLORS.textPrimary, fontSize: SIZES.fontSm, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  deleteBtn: { padding: SIZES.xs },
  itemTotal: { fontSize: SIZES.fontSm, fontWeight: '700', color: COLORS.textPrimary, alignSelf: 'flex-start' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm, padding: SIZES.xl },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.cardBg, justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  emptyTitle: { fontSize: SIZES.fontXl, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, textAlign: 'center' },
  shopBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.md, paddingHorizontal: SIZES.xl, marginTop: SIZES.sm,
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.fontMd },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.cardBg, padding: SIZES.lg,
    borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl,
    ...SHADOWS.lg,
  },
  summaryRows: { gap: SIZES.xs, marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  summaryValue: { fontSize: SIZES.fontSm, color: COLORS.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.xs },
  totalLabel: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, fontWeight: '600' },
  totalAmount: { fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.textPrimary },
  checkoutBtn: {
    backgroundColor: COLORS.primaryBlue, height: 54,
    borderRadius: SIZES.radiusLg, justifyContent: 'center', alignItems: 'center', ...SHADOWS.md,
  },
  checkoutBtnText: { color: '#fff', fontSize: SIZES.fontMd, fontWeight: '700' },
});
