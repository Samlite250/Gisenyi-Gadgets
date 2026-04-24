import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, ChevronRight, Clock } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#FBBC04', bg: '#FBBC0415' },
  confirmed:  { label: 'Confirmed',  color: COLORS.primaryBlue, bg: `${COLORS.primaryBlue}15` },
  processing: { label: 'Processing', color: '#FF9800', bg: '#FF980015' },
  shipped:    { label: 'Shipped',    color: COLORS.primaryBlue, bg: `${COLORS.primaryBlue}15` },
  delivered:  { label: 'Delivered',  color: COLORS.primaryGreen, bg: `${COLORS.primaryGreen}15` },
  cancelled:  { label: 'Cancelled',  color: COLORS.error, bg: `${COLORS.error}15` },
  refunded:   { label: 'Refunded',   color: COLORS.textSecondary, bg: `${COLORS.textSecondary}15` },
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
      console.warn('Orders fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderOrder = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const itemCount = item.order_items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderTracking', { order: item })}
        activeOpacity={0.8}
      >
        <View style={styles.orderTop}>
          <View style={styles.orderIdWrap}>
            <Package size={16} color={COLORS.primaryBlue} />
            <Text style={styles.orderId}>{item.order_number}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.orderMeta}>
          <View style={styles.metaRow}>
            <Clock size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={styles.metaText}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {item.order_items?.slice(0, 2).map((oi, i) => (
          <Text key={i} style={styles.itemPreview} numberOfLines={1}>
            • {oi.product_name} × {oi.quantity}
          </Text>
        ))}
        {itemCount > 2 && (
          <Text style={styles.moreItems}>+{itemCount - 2} more item{itemCount - 2 > 1 ? 's' : ''}</Text>
        )}

        <View style={styles.orderBottom}>
          <Text style={styles.orderTotal}>{fmt(item.total)}</Text>
          <View style={styles.trackBtn}>
            <Text style={styles.trackBtnText}>Track Order</Text>
            <ChevronRight size={14} color={COLORS.primaryBlue} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Demo orders shown before Supabase is configured
  const DEMO_ORDERS = [
    {
      id: 'demo-1', order_number: '#GGS123456',
      status: 'delivered', created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      total: 195000, order_items: [{ product_name: 'Samsung Galaxy S24', quantity: 1 }],
    },
    {
      id: 'demo-2', order_number: '#GGS789012',
      status: 'shipped', created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      total: 120000, order_items: [{ product_name: 'AirPods Pro', quantity: 1 }, { product_name: 'Phone Case', quantity: 2 }],
    },
    {
      id: 'demo-3', order_number: '#GGS345678',
      status: 'pending', created_at: new Date().toISOString(),
      total: 45000, order_items: [{ product_name: 'USB-C Hub', quantity: 1 }],
    },
  ];

  const displayOrders = orders.length > 0 ? orders : (loading ? [] : DEMO_ORDERS);
  const filteredDemo = activeFilter === 'All'
    ? displayOrders
    : displayOrders.filter((o) => o.status === activeFilter.toLowerCase());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <Text style={styles.headerCount}>{filteredDemo.length} order{filteredDemo.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filter Tabs */}
      <FlatList
        data={FILTERS}
        horizontal
        keyExtractor={(f) => f}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredDemo}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={filteredDemo.length === 0 ? { flex: 1 } : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primaryBlue} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Package size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              {activeFilter !== 'All' ? `No ${activeFilter.toLowerCase()} orders` : 'Start shopping to place your first order'}
            </Text>
            {activeFilter === 'All' && (
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.shopBtnText}>Shop Now</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
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
  headerCount: { fontSize: SIZES.fontSm, color: COLORS.textSecondary },
  filterList: { paddingHorizontal: SIZES.lg, gap: SIZES.sm, paddingBottom: SIZES.sm },
  filterChip: {
    paddingVertical: SIZES.xs, paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusFull, backgroundColor: COLORS.cardBg,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primaryBlue, borderColor: COLORS.primaryBlue },
  filterText: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: SIZES.lg, paddingTop: SIZES.sm, gap: SIZES.sm },
  orderCard: {
    backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg,
    padding: SIZES.md, ...SHADOWS.sm, gap: SIZES.xs,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdWrap: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  orderId: { fontSize: SIZES.fontMd, fontWeight: '700', color: COLORS.textPrimary },
  statusBadge: { borderRadius: SIZES.radiusFull, paddingVertical: 3, paddingHorizontal: SIZES.sm },
  statusText: { fontSize: SIZES.fontXs, fontWeight: '700' },
  orderMeta: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: SIZES.fontXs, color: COLORS.textMuted },
  itemPreview: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, marginLeft: 2 },
  moreItems: { fontSize: SIZES.fontXs, color: COLORS.textMuted, marginLeft: 2, fontStyle: 'italic' },
  orderBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: SIZES.xs, paddingTop: SIZES.xs, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  orderTotal: { fontSize: SIZES.fontMd, fontWeight: '800', color: COLORS.textPrimary },
  trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trackBtnText: { fontSize: SIZES.fontSm, color: COLORS.primaryBlue, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SIZES.sm, padding: SIZES.xl },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.cardBg,
    justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm,
  },
  emptyTitle: { fontSize: SIZES.fontXl, fontWeight: '700', color: COLORS.textPrimary },
  emptySub: { fontSize: SIZES.fontSm, color: COLORS.textSecondary, textAlign: 'center' },
  shopBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusLg,
    paddingVertical: SIZES.md, paddingHorizontal: SIZES.xl, marginTop: SIZES.sm,
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.fontMd },
});
