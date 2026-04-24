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
import { CheckCircle2, Package, Home, ListOrdered } from 'lucide-react-native';
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
        useNativeDriver: true,
        tension: 60,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
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
            { icon: '✅', label: 'Order Confirmed', done: true },
            { icon: '📦', label: 'Being Packed', done: false },
            { icon: '🚚', label: 'Out for Delivery', done: false },
            { icon: '🏠', label: 'Delivered', done: false },
          ].map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepIcon}>{step.icon}</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xxl,
    paddingBottom: SIZES.xl,
    gap: SIZES.lg,
  },
  iconWrap: {
    marginBottom: SIZES.sm,
  },
  outerRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${COLORS.primaryGreen}10`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.primaryGreen}20`,
  },
  innerRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: `${COLORS.primaryGreen}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.primaryGreen}30`,
  },
  textBlock: {
    alignItems: 'center',
    gap: SIZES.sm,
  },
  title: {
    fontSize: SIZES.fontHero,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  orderCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.xs,
  },
  orderLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  orderValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.sm,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.sm,
    gap: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepsTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  stepIcon: {
    fontSize: 20,
    width: 28,
  },
  stepLabel: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  stepLabelDone: {
    color: COLORS.textPrimary,
  },
  stepBadge: {
    backgroundColor: `${COLORS.primaryGreen}20`,
    borderRadius: SIZES.radiusFull,
    paddingVertical: 2,
    paddingHorizontal: SIZES.sm,
  },
  stepBadgeText: {
    fontSize: SIZES.fontXs,
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    gap: SIZES.sm,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.radiusLg,
    height: 54,
    ...SHADOWS.md,
  },
  trackBtnText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    fontWeight: '700',
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    height: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  homeBtnText: {
    color: COLORS.primaryBlue,
    fontSize: SIZES.fontMd,
    fontWeight: '700',
  },
});
