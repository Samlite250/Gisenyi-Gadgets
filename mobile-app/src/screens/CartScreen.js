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
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: SIZES.lg, paddingTop: 40,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerBadge: {
    backgroundColor: COLORS.primaryBlue, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  headerCount: { fontSize: 13, color: '#fff', fontWeight: '700' },
  listContent: { padding: SIZES.lg, paddingBottom: 200 },
  cartItem: {
    flexDirection: 'row',
    marginBottom: SIZES.lg,
    alignItems: 'center',
    gap: SIZES.md,
  },
  itemImage: { width: 80, height: 80, borderRadius: SIZES.radiusMd, backgroundColor: '#F5F5F5' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  itemDetails: { flex: 1, gap: 4 },
  itemName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  itemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primaryGreen },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md, marginTop: 4 },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 32,
  },
  qtyBtn: { padding: 4 },
  qtyText: { fontSize: 14, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  deleteBtn: { padding: 4 },
  itemTotal: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    padding: SIZES.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  summaryRows: { marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  totalAmount: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  checkoutBtn: {
    backgroundColor: COLORS.primaryBlue,
    height: 56,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: 14, color: COLORS.textSecondary },
  shopBtn: { backgroundColor: COLORS.primaryBlue, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  shopBtnText: { color: '#fff', fontWeight: '700' },
});
