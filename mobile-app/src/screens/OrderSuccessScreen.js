import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Package, Home, ListOrdered, Truck } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useCart } from '../context/CartContext';

export default function OrderSuccessScreen({ navigation, route }) {
  const { clearCart } = useCart();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const orderId = route?.params?.orderId || `#GGS${Date.now().toString().slice(-6)}`;
  const estimatedDelivery = route?.params?.estimatedDelivery || '3-5 Business Days';
  const total = route?.params?.total || 0;

  useEffect(() => {
    // Clear cart after successful order
    clearCart();

    // Animate in
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 60,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleViewOrders = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main', params: { screen: 'Orders' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.outerRing}>
            <View style={styles.innerRing}>
              <CheckCircle2 size={64} color={COLORS.primaryGreen} />
            </View>
          </View>
        </Animated.View>

        {/* Text */}
        <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Order Placed!</Text>
          <Text style={styles.subtitle}>
            Thank you for shopping with Gisenyi Gadgets. Your order has been confirmed and is being processed.
          </Text>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View style={[styles.orderCard, { opacity: fadeAnim }]}>
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Order ID</Text>
            <Text style={styles.orderValue}>{orderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.orderRow}>
            <Text style={styles.orderLabel}>Estimated Delivery</Text>
            <Text style={styles.orderValue}>{estimatedDelivery}</Text>
          </View>
          {total > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Total Paid</Text>
                <Text style={[styles.orderValue, { color: COLORS.primaryGreen }]}>
                  RWF {total.toLocaleString()}
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* Steps */}
        <Animated.View style={[styles.stepsCard, { opacity: fadeAnim }]}>
          <Text style={styles.stepsTitle}>What happens next?</Text>
          {[
            { icon: CheckCircle2, label: 'Order Confirmed', done: true, color: COLORS.primaryGreen },
            { icon: Package, label: 'Being Packed', done: false, color: COLORS.textSecondary },
            { icon: Truck, label: 'Out for Delivery', done: false, color: COLORS.textSecondary },
            { icon: Home, label: 'Delivered', done: false, color: COLORS.textSecondary },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <step.icon size={20} color={step.color} />
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                {step.label}
              </Text>
              {step.done && (
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>Done</Text>
                </View>
              )}
            </View>
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={handleViewOrders}
            activeOpacity={0.85}
          >
            <ListOrdered size={20} color={COLORS.textPrimary} />
            <Text style={styles.trackBtnText}>Track My Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={handleGoHome}
            activeOpacity={0.85}
          >
            <Home size={20} color={COLORS.primaryBlue} />
            <Text style={styles.homeBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: SIZES.lg,
    paddingTop: 80,
    gap: SIZES.lg,
  },
  iconWrap: { marginBottom: SIZES.md },
  outerRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#E6FFFA', justifyContent: 'center', alignItems: 'center',
  },
  innerRing: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#34A853', justifyContent: 'center', alignItems: 'center',
  },
  textBlock: { alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  orderCard: {
    width: '100%', padding: SIZES.lg,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderLabel: { fontSize: 14, color: COLORS.textSecondary },
  orderValue: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  stepsCard: {
    width: '100%', padding: SIZES.lg,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#F3F4F6', gap: SIZES.md,
  },
  stepsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepIcon: { fontSize: 18, width: 24 },
  stepLabel: { flex: 1, fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  stepLabelDone: { color: COLORS.textPrimary, fontWeight: '600' },
  actions: { width: '100%', gap: SIZES.md, marginTop: SIZES.md },
  trackBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: 8,
    height: 56, justifyContent: 'center', alignItems: 'center',
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtn: {
    backgroundColor: '#fff', borderRadius: 8, height: 56,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  homeBtnText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
});
