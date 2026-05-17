import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, CreditCard, Smartphone, Banknote, CheckCircle2, Landmark, Bitcoin } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const PAYMENT_METHODS = [
  { id: 'mtn', name: 'MTN MoMo', icon: Smartphone, color: '#FBC400', bg: '#FFFBEB', description: 'Pay via MTN Mobile Money' },
  { id: 'airtel', name: 'Airtel Money', icon: Smartphone, color: '#E8002D', bg: '#FFF1F2', description: 'Pay via Airtel Money' },
  { id: 'bank', name: 'Bank Transfer', icon: Landmark, color: '#0EA5E9', bg: '#F0F9FF', description: 'Direct bank transfer — use order # as ref.' },
  { id: 'crypto', name: 'Crypto', icon: Bitcoin, color: '#F7931A', bg: '#FFF7ED', description: 'Pay with USDT, BTC, etc.' },
  { id: 'cash', name: 'Cash on Delivery', icon: Banknote, color: '#16A34A', bg: '#F0FDF4', description: 'Pay when your order arrives.' },
];

export default function CheckoutScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { cartItems, subtotal, shippingFee, total, promoDiscount, activePromo } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('mtn');
  const [placing, setPlacing] = useState(false);
  const [settings, setSettings] = useState({});

  React.useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('platform_settings').select('*');
      if (data) {
        const s = {};
        data.forEach(item => s[item.key] = item.value);
        setSettings(s);
      }
    };
    fetchSettings();
  }, []);

  const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Customer';
  const displayPhone = profile?.phone || '—';
  const displayAddress = profile?.address
    ? `${profile.address}, ${profile.city || 'Gisenyi'}`
    : 'No address set. Please update in profile.';

  // Map UI payment method IDs → DB allowed values ('momo' | 'card' | 'cash')
  const toDbPayment = (id) => {
    if (id === 'cash') return 'cash';
    if (id === 'mtn' || id === 'airtel') return 'momo';
    return 'card'; // bank, crypto
  };

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
          payment_method: toDbPayment(selectedPayment), // map to DB-allowed value
          payment_status: 'unpaid',
          subtotal,
          shipping_fee: shippingFee,
          total,
          notes: activePromo ? `Promo used: ${activePromo} (-${fmt(promoDiscount)})` : null,
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
      console.error('Order Error:', err);
      Alert.alert(
        'Submission Error',
        'We encountered an issue saving your order items. Please verify your connection or contact support if the issue persists.'
      );
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
            {shippingFee === 0 ? 'Free Shipping' : `Shipping: ${fmt(shippingFee)}`}
          </Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.payList}>
          {PAYMENT_METHODS.map((m) => {
            const isActive = selectedPayment === m.id;
            return (
              <View key={m.id} style={[styles.payOptionCard, isActive && { borderColor: m.color }]}>
                <TouchableOpacity
                  style={styles.payOptionHeader}
                  onPress={() => setSelectedPayment(m.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.payIconBox, { backgroundColor: m.bg }]}>
                    <m.icon size={22} color={m.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payCardName, isActive && { color: m.color }]}>{m.name}</Text>
                    <Text style={styles.payCardSub}>{m.description}</Text>
                  </View>
                  <View style={[styles.radio, isActive && styles.radioActive]}>
                    {isActive && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>

                {isActive && (
                  <View style={styles.payInstructions}>
                    <View style={styles.dividerSmall} />
                    <Text style={styles.instructionTitle}>Payment Process:</Text>
                    {m.id === 'mtn' || m.id === 'airtel' ? (
                      <Text style={styles.instructionText}>
                        {m.id === 'mtn' 
                          ? (settings.mtnInstructions || "Please contact support for MoMo details.") 
                          : (settings.airtelInstructions || "Please contact support for Airtel details.")
                        }
                      </Text>
                    ) : m.id === 'bank' ? (
                      <Text style={styles.instructionText}>
                        {settings.bankInstructions || "Bank details not configured."}
                      </Text>
                    ) : m.id === 'crypto' ? (
                      <Text style={styles.instructionText}>
                        {settings.cryptoInstructions || "Crypto wallet not configured."}
                      </Text>
                    ) : (
                      <Text style={styles.instructionText}>
                        Pay the delivery agent in cash or MoMo upon receiving your package.
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
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
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({activePromo})</Text>
              <Text style={[styles.summaryValue, { color: COLORS.error }]}>-{fmt(promoDiscount)}</Text>
            </View>
          )}
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scroll: { padding: SIZES.lg, paddingBottom: 120 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: -0.4
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...SHADOWS.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  changeText: {
    color: COLORS.primaryBlue,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 30,
  },
  deliveryCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BFDBFE',
  },
  deliveryDate: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primaryBlue,
    marginBottom: 4,
  },
  deliverySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  payList: { gap: 12, marginBottom: 16 },
  payOptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  payOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  payIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  payCardSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.primaryBlue,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryBlue,
  },
  payInstructions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingTop: 12,
  },
  dividerSmall: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryName: {
    fontSize: 13,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  footer: {
    padding: SIZES.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.lg,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    ...SHADOWS.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primaryBlue,
    letterSpacing: -0.5,
  },
  placeBtn: {
    backgroundColor: COLORS.primaryBlue,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...SHADOWS.md,
  },
  placeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
