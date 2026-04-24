import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const PAYMENT_METHODS = [
  { id: 'momo', name: 'Mobile Money (MTN/Airtel)', icon: Smartphone, description: 'Pay with MTN MoMo or Airtel Money' },
  { id: 'card', name: 'Card Payment', icon: CreditCard, description: 'Visa, Mastercard accepted' },
  { id: 'cash', name: 'Cash on Delivery', icon: Banknote, description: 'Pay when your order arrives' },
];

export default function CheckoutScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { cartItems, subtotal, shippingFee, total } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('momo');
  const [placing, setPlacing] = useState(false);

  const fmt = (n) => `RWF ${n.toLocaleString()}`;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Customer';
  const displayPhone = profile?.phone || '—';
  const displayAddress = profile?.address
    ? `${profile.address}, ${profile.city || 'Gisenyi'}`
    : 'KG 15 Ave, Gisenyi, Rubavu District';

  const estimatedDelivery = () => {
    const d = new Date();
    d.setDate(d.getDate() + (selectedPayment === 'cash' ? 5 : 3));
    return d.toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      Alert.alert('Empty Cart', 'Add items to your cart before placing an order.');
      return;
    }
    setPlacing(true);
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          payment_method: selectedPayment,
          payment_status: selectedPayment === 'cash' ? 'unpaid' : 'unpaid',
          subtotal,
          shipping_fee: shippingFee,
          total,
          shipping_address: {
            name: displayName,
            phone: displayPhone,
            address: displayAddress,
          },
          estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.images?.[0] || null,
        price: item.price,
        quantity: item.quantity,
        selected_color: item.selectedColor || null,
        selected_storage: item.selectedStorage || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // 3. Navigate to success (CartContext clears itself in OrderSuccessScreen)
      navigation.replace('OrderSuccess', {
        orderId: order.order_number,
        estimatedDelivery: estimatedDelivery(),
        total,
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Order Failed', err.message || 'Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Delivery Address */}
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <MapPin size={20} color={COLORS.primaryBlue} />
            <Text style={styles.cardName}>{displayName}</Text>
            <TouchableOpacity><Text style={styles.changeText}>Change</Text></TouchableOpacity>
          </View>
          <Text style={styles.cardSub}>{displayAddress}</Text>
          <Text style={styles.cardSub}>{displayPhone}</Text>
        </View>

        {/* Estimated Delivery */}
        <Text style={styles.sectionTitle}>Estimated Delivery</Text>
        <View style={[styles.card, styles.deliveryCard]}>
          <Text style={styles.deliveryDate}>{estimatedDelivery()}</Text>
          <Text style={styles.deliverySub}>
            {shippingFee === 0 ? '🎉 Free Shipping' : `Shipping: ${fmt(shippingFee)}`}
          </Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.card}>
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.payRow}
              onPress={() => setSelectedPayment(m.id)}
              activeOpacity={0.7}
            >
              <View style={styles.payLeft}>
                <View style={[styles.radio, selectedPayment === m.id && styles.radioActive]}>
                  {selectedPayment === m.id && <View style={styles.radioDot} />}
                </View>
                <m.icon size={20} color={selectedPayment === m.id ? COLORS.primaryBlue : COLORS.textSecondary} />
                <View>
                  <Text style={[styles.payName, selectedPayment === m.id && { color: COLORS.primaryBlue }]}>
                    {m.name}
                  </Text>
                  <Text style={styles.payDesc}>{m.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
          {cartItems.map((item) => (
            <View key={item.cartItemId} style={styles.summaryRow}>
              <Text style={styles.summaryName} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryPrice}>{fmt(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
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
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, placing && { opacity: 0.6 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          <CheckCircle2 size={20} color="#fff" />
          <Text style={styles.placeBtnText}>
            {placing ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
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
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  scroll: { padding: SIZES.lg, paddingBottom: 150 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SIZES.md, marginTop: SIZES.sm },
  card: { padding: SIZES.md, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F5F5F5', borderRadius: 8, marginBottom: SIZES.lg },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  changeText: { color: COLORS.primaryBlue, fontSize: 13, fontWeight: '700' },
  cardSub: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20 },
  payRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  payLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: COLORS.primaryBlue },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primaryBlue },
  payName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  payDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 12 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: SIZES.lg, paddingBottom: 40,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.md },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  totalAmount: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary },
  placeBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: 8,
    height: 56, justifyContent: 'center', alignItems: 'center',
  },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
