import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle2, Circle, Clock, Package, Truck, MapPin } from 'lucide-react-native';

const ALL_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Out for Delivery', icon: MapPin },
  { key: 'done', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_STEP_MAP = {
  pending: 1,
  confirmed: 2,
  processing: 2,
  shipped: 3,
  delivered: 5,
  cancelled: 0,
};

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending';

export default function OrderTrackingScreen({ route, navigation }) {
  const order = route?.params?.order || {};
  const completedSteps = STATUS_STEP_MAP[order.status] ?? 1;
  const isCancelled = order.status === 'cancelled';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDER TRACKING</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{order.order_number || '#GGS000000'}</Text>
          <Text style={styles.orderDate}>Placed on {fmt(order.created_at)}</Text>
          {isCancelled && (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledText}>This order was cancelled</Text>
            </View>
          )}
        </View>

        {/* Summary row */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>RWF {Number(order.total || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text style={styles.summaryValue}>{order.payment_method?.toUpperCase() || 'MTN'}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{order.order_items?.length || '—'}</Text>
          </View>
        </View>

        <View style={styles.timeline}>
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
                    {done ? (index === 0 ? fmt(order.created_at) : 'Completed') : 'Pending'}
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
          <Text style={styles.viewDetailsBtnText}>Back to Orders</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 24, paddingBottom: 16,
  },
  iconBtn: {
    width: 44, height: 44, backgroundColor: '#1E293B',
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  content: { padding: 24, paddingBottom: 40 },
  orderInfo: { marginBottom: 24 },
  orderId: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  orderDate: { fontSize: 14, color: '#94A3B8' },
  cancelledBadge: { marginTop: 10, backgroundColor: '#7F1D1D', paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  cancelledText: { color: '#FCA5A5', fontWeight: '700', fontSize: 13 },
  summaryCard: {
    flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 14,
    padding: 16, marginBottom: 36, alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  summaryValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  summaryDivider: { width: 1, height: 30, backgroundColor: '#334155' },
  timeline: { marginBottom: 32 },
  timelineItem: { flexDirection: 'row', marginBottom: 28 },
  timelineIconContainer: { alignItems: 'center', marginRight: 16 },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#334155',
  },
  stepCircleDone: { backgroundColor: '#34A853', borderColor: '#34A853' },
  stepCircleActive: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  timelineLine: { width: 2, height: 36, backgroundColor: '#1E293B', marginTop: 6 },
  timelineLineCompleted: { backgroundColor: '#34A853' },
  timelineContent: { flex: 1, paddingTop: 6 },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 4 },
  statusLabelCompleted: { color: '#FFFFFF' },
  statusTime: { fontSize: 13, color: '#64748B' },
  viewDetailsBtn: {
    backgroundColor: '#4285F4', height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  viewDetailsBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
