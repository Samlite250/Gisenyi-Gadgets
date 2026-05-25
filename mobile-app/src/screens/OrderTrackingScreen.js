import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { BlurView } from '../components/BlurView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CircleCheckBig, Circle, Clock, Package, Truck, MapPin } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';

const STATUS_STEP_MAP = {
  pending: 1,
  confirmed: 2,
  processing: 2,
  shipped: 3,
  delivered: 5,
  cancelled: 0,
};

export default function OrderTrackingScreen({ route, navigation }) {
  const { t } = useLanguage();
  const [order, setOrder] = useState(route?.params?.order || {});

  const ALL_STEPS = [
    { key: 'placed', label: t('orders.orderPlaced'), icon: Package },
    { key: 'processing', label: t('orders.processing'), icon: Clock },
    { key: 'shipped', label: t('orders.shipped'), icon: Truck },
    { key: 'delivered', label: t('orders.outForDelivery'), icon: MapPin },
    { key: 'done', label: t('orders.delivered'), icon: CircleCheckBig },
  ];

  const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : t('orders.pending');

  useEffect(() => {
    if (!order.id) return;

    // Subscribe to real-time changes for this specific order
    const orderSubscription = supabase
      .channel(`order_tracking_${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [order.id]);

  const completedSteps = STATUS_STEP_MAP[order.status] ?? 1;
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BlurView intensity={70} tint="light" style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.trackOrder').toUpperCase()}</Text>
        <View style={{ width: 44 }} />
      </BlurView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{order.order_number || '#GGS000000'}</Text>
          <Text style={styles.orderDate}>{t('orders.placedOn')} {fmt(order.created_at)}</Text>
          {isCancelled && (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledText}>{t('orders.orderCancelled')}</Text>
            </View>
          )}
        </View>

        {/* Summary row Glass Card */}
        <BlurView intensity={60} tint="light" style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('orders.total')}</Text>
            <Text style={styles.summaryValue}>RWF {Number(order.total || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('orders.payment')}</Text>
            <Text style={styles.summaryValue}>{order.payment_method?.toUpperCase() || 'MTN'}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('orders.items')}</Text>
            <Text style={styles.summaryValue}>{order.order_items?.length || '—'}</Text>
          </View>
        </BlurView>

        <View style={styles.timelineCard}>
          {ALL_STEPS.map((step, index) => {
            const done = completedSteps > index;
            const active = completedSteps === index + 1;
            const StepIcon = step.icon;
            return (
              <View key={step.key} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  <View style={[
                    styles.stepCircle,
                    done && styles.stepCircleDone,
                    active && styles.stepCircleActive,
                  ]}>
                    <StepIcon size={16} color={done || active ? '#fff' : '#94A3B8'} />
                  </View>
                  {index < ALL_STEPS.length - 1 && (
                    <View style={[styles.timelineLine, done && styles.timelineLineCompleted]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.statusLabel,
                    (done || active) && styles.statusLabelCompleted,
                    active && { color: '#34A853', fontWeight: '800' },
                  ]}>
                    {step.label}{active ? ' ●' : ''}
                  </Text>
                  <Text style={styles.statusTime}>
                    {done ? (index === 0 ? fmt(order.created_at) : t('orders.completed')) : t('orders.pending')}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.viewDetailsBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.viewDetailsBtnText}>{t('orders.backToOrders')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 24, paddingBottom: 16,
    overflow: 'hidden',
  },
  iconBtn: {
    width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', letterSpacing: 1 },
  content: { padding: 24, paddingBottom: 40 },
  orderInfo: { marginBottom: 24 },
  orderId: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  orderDate: { fontSize: 14, color: '#64748B' },
  cancelledBadge: { marginTop: 10, backgroundColor: '#7F1D1D', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  cancelledText: { color: '#FCA5A5', fontWeight: '700', fontSize: 13 },
  summaryCard: {
    flexDirection: 'row', borderRadius: 14,
    padding: 16, marginBottom: 36, alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  summaryValue: { fontSize: 14, color: '#1E293B', fontWeight: '700' },
  summaryDivider: { width: 1, height: 30, backgroundColor: 'rgba(0,0,0,0.1)' },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    }),
  },
  timelineItem: { flexDirection: 'row', marginBottom: 28 },
  timelineIconContainer: { alignItems: 'center', marginRight: 16 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E2E8F0',
  },
  stepCircleDone: { backgroundColor: '#34A853', borderColor: '#34A853' },
  stepCircleActive: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  timelineLine: { width: 2, height: 36, backgroundColor: '#E2E8F0', marginTop: 6 },
  timelineLineCompleted: { backgroundColor: '#34A853' },
  timelineContent: { flex: 1, paddingTop: 6 },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 4 },
  statusLabelCompleted: { color: '#1E293B' },
  statusTime: { fontSize: 13, color: '#64748B' },
  viewDetailsBtn: {
    backgroundColor: '#4285F4', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  viewDetailsBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
