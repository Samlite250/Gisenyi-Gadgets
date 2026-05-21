import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Image,
  Dimensions, Alert,
} from 'react-native';
import { BlurView } from '../components/BlurView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, ChevronRight, Clock, ShoppingBag, Truck, MapPin, CircleCheckBig } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { orderLogger } from '../utils/logger';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
  confirmed: { label: 'Confirmed', color: '#4285F4', bg: '#E0E7FF', icon: Package },
  processing: { label: 'Processing', color: '#0EA5E9', bg: '#E0F2FE', icon: ShoppingBag },
  shipped: { label: 'Shipped', color: '#0284C7', bg: '#E0F2FE', icon: Truck },
  delivered: { label: 'Delivered', color: '#34A853', bg: '#DCFCE7', icon: MapPin },
  cancelled: { label: 'Cancelled', color: '#EA4335', bg: '#FEE2E2', icon: null },
  refunded: { label: 'Refunded', color: '#5F6368', bg: '#F3F4F6', icon: null },
};

const FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(id, product_name, quantity, price)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (activeFilter !== 'All') {
        query = query.eq('status', activeFilter.toLowerCase());
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      orderLogger.error('Orders fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Real-time: auto-refresh when admin changes any order status ──────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`orders_user_${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user, fetchOrders]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleConfirmReceipt = async (orderId) => {
    Alert.alert(
      'Confirm Order Receipt',
      'Have you received all items in this order? This will allow you to leave reviews for the products.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Received',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('orders')
                .update({
                  receipt_confirmed: true,
                  receipt_confirmed_at: new Date().toISOString(),
                })
                .eq('id', orderId);

              if (error) throw error;

              Alert.alert('Success', 'Order receipt confirmed! You can now review your products.');
              fetchOrders();
            } catch (err) {
              Alert.alert('Error', 'Failed to confirm receipt. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderOrder = ({ item }) => {
    const status = STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const itemCount = item.order_items?.length || 0;
    const isDelivered = item.status?.toLowerCase() === 'delivered';
    const isConfirmed = item.receipt_confirmed === true;

    return (
      <BlurView intensity={40} tint="light" style={styles.orderCard}>
        <TouchableOpacity
        onPress={() => navigation.navigate('OrderTracking', { order: item })}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdWrap}>
            <View style={styles.iconBox}>
              <ShoppingBag size={18} color={COLORS.primaryBlue} />
            </View>
            <View>
              <Text style={styles.orderId}>{item.order_number}</Text>
              <View style={styles.metaRow}>
                <Clock size={12} color={COLORS.textMuted} />
                <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            {StatusIcon && <StatusIcon size={12} color={status.color} style={{ marginRight: 4 }} />}
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderDivider} />

        <View style={styles.orderBody}>
          <View style={styles.itemsWrapper}>
            {item.order_items?.slice(0, 2).map((oi, i) => (
              <View key={i} style={styles.itemPreviewRow}>
                <View style={styles.bulletPoint} />
                <Text style={styles.itemPreviewText} numberOfLines={1}>
                  <Text style={{ fontWeight: '600', color: COLORS.textPrimary }}>{oi.quantity}x</Text> {oi.product_name}
                </Text>
              </View>
            ))}
            {itemCount > 2 && (
              <Text style={styles.moreItems}>+{itemCount - 2} more item{itemCount - 2 !== 1 ? 's' : ''}</Text>
            )}
          </View>

          <View style={styles.priceWrap}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.orderTotal}>{fmt(item.total)}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.itemCountText}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          <View style={styles.trackBtn}>
            <Text style={styles.trackBtnText}>Track Order</Text>
            <ChevronRight size={16} color={COLORS.primaryBlue} />
          </View>
        </View>

        {/* Confirm Receipt Button for Delivered Orders */}
        {isDelivered && !isConfirmed && (
          <TouchableOpacity
            style={styles.confirmReceiptBtn}
            onPress={() => handleConfirmReceipt(item.id)}
            activeOpacity={0.8}
          >
            <CircleCheckBig size={16} color="#fff" />
            <Text style={styles.confirmReceiptText}>Confirm Receipt & Review</Text>
          </TouchableOpacity>
        )}

        {/* Confirmed Badge */}
        {isDelivered && isConfirmed && (
          <View style={styles.confirmedBadge}>
            <CircleCheckBig size={14} color="#34A853" />
            <Text style={styles.confirmedText}>
              Receipt Confirmed • Ready to Review
            </Text>
          </View>
        )}
        </TouchableOpacity>
      </BlurView>
    );
  };


  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter((o) => o.status?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Refined Header */}
      {/* Glass Header */}
      <BlurView intensity={70} tint="light" style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerCount}>
            You have <Text style={{ fontWeight: '700' }}>{filteredOrders.length}</Text> {activeFilter === 'All' ? 'total' : activeFilter.toLowerCase()} order{filteredOrders.length !== 1 ? 's' : ''}.
          </Text>
        </View>
      </BlurView>

      {/* Pill-shaped Filter Tabs Wrapper (Fixes Stretching on Web) */}
      {/* Pill-shaped Filter Tabs Wrapper with Glass Effect */}
      <BlurView intensity={60} tint="light" style={styles.filterContainer}>
        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={(f) => f}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </BlurView>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={filteredOrders.length === 0 ? { flex: 1 } : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryBlue} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconBg}>
              <Package size={56} color={COLORS.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySub}>
              {activeFilter !== 'All'
                ? `You don't have any orders marked as ${activeFilter.toLowerCase()}.`
                : 'Looks like you haven\'t started shopping with us yet!'}
            </Text>
            {activeFilter === 'All' ? (
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
                <Text style={styles.shopBtnText}>Start Shopping Now</Text>
                <ChevronRight size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.clearBtn} onPress={() => setActiveFilter('All')} activeOpacity={0.8}>
                <Text style={styles.clearBtnText}>View All Orders</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    paddingHorizontal: SIZES.lg,
    paddingTop: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerCount: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },

  // Constrain height strictly so flatlist items don't stretch into long rectangles
  filterContainer: {
    height: 60,
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 10,
    overflow: 'hidden',
  },
  filterList: { paddingHorizontal: SIZES.lg, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    elevation: 1,
    ...require('react-native').Platform.select({
      web: { boxShadow: '0px 1px 1px rgba(0,0,0,0.05)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
    }),
  },
  filterChipActive: { backgroundColor: COLORS.primaryBlue },
  filterText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.2 },
  filterTextActive: { color: '#fff' },

  list: { padding: SIZES.lg, gap: 16 },

  orderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    padding: SIZES.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderIdWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: `${COLORS.primaryBlue}10`,
    justifyContent: 'center', alignItems: 'center'
  },
  orderId: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20
  },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  orderDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 14 },

  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemsWrapper: { flex: 1, paddingRight: 16 },
  itemPreviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bulletPoint: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, marginRight: 8 },
  itemPreviewText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  moreItems: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 4, paddingLeft: 12 },

  priceWrap: { alignItems: 'flex-end', justifyContent: 'center' },
  totalLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '600', letterSpacing: 0.5 },
  orderTotal: { fontSize: 18, fontWeight: '800', color: COLORS.primaryBlue, marginTop: 2 },

  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F9FAFB'
  },
  itemCountText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${COLORS.primaryBlue}10`, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  trackBtnText: { fontSize: 13, color: COLORS.primaryBlue, fontWeight: '700' },

  // Confirm Receipt Button
  confirmReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryBlue,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  confirmReceiptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Confirmed Badge
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  confirmedText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty State
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyIconBg: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 8 },
  emptySub: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 20 },
  shopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primaryBlue, paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12, ...SHADOWS.sm
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  clearBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  clearBtnText: { color: COLORS.primaryBlue, fontWeight: '600', fontSize: 15 },
});
