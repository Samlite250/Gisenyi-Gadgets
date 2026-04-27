import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Package, ChevronRight, Clock, ShoppingBag, Truck, MapPin } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7', icon: Clock },
  confirmed: { label: 'Confirmed', color: COLORS.primaryBlue, bg: '#E0E7FF', icon: Package },
  processing: { label: 'Processing', color: '#8B5CF6', bg: '#EDE9FE', icon: ShoppingBag },
  shipped: { label: 'Shipped', color: '#0284C7', bg: '#E0F2FE', icon: Truck },
  delivered: { label: 'Delivered', color: COLORS.primaryGreen, bg: '#DCFCE7', icon: MapPin },
  cancelled: { label: 'Cancelled', color: COLORS.error, bg: '#FEE2E2', icon: null },
  refunded: { label: 'Refunded', color: COLORS.textSecondary, bg: '#F3F4F6', icon: null },
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
    const status = STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const itemCount = item.order_items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.orderCard}
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
      </TouchableOpacity>
    );
  };

  // Demo orders shown before Supabase is configured
  const DEMO_ORDERS = [
    {
      id: 'demo-1', order_number: '#GGS123456',
      status: 'delivered', created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      total: 195000, order_items: [{ product_name: 'Samsung Galaxy S24 Ultra', quantity: 1 }],
    },
    {
      id: 'demo-2', order_number: '#GGS789012',
      status: 'shipped', created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      total: 120000, order_items: [{ product_name: 'AirPods Pro Gen 2', quantity: 1 }, { product_name: 'Silicone Phone Case', quantity: 2 }],
    },
    {
      id: 'demo-3', order_number: '#GGS345678',
      status: 'pending', created_at: new Date().toISOString(),
      total: 45000, order_items: [{ product_name: 'Fast Charging USB-C Hub', quantity: 1 }],
    },
  ];

  const displayOrders = orders.length > 0 ? orders : (loading ? [] : DEMO_ORDERS);
  const filteredDemo = activeFilter === 'All'
    ? displayOrders
    : displayOrders.filter((o) => o.status?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Refined Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerCount}>
            You have <Text style={{ fontWeight: '700' }}>{filteredDemo.length}</Text> {activeFilter === 'All' ? 'total' : activeFilter.toLowerCase()} order{filteredDemo.length !== 1 ? 's' : ''}.
          </Text>
        </View>
      </View>

      {/* Pill-shaped Filter Tabs Wrapper (Fixes Stretching on Web) */}
      <View style={styles.filterContainer}>
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
      </View>

      <FlatList
        data={filteredDemo}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={filteredDemo.length === 0 ? { flex: 1 } : styles.list}
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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    paddingHorizontal: SIZES.lg,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerCount: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4 },

  // Constrain height strictly so flatlist items don't stretch into long rectangles
  filterContainer: {
    height: 60,
    maxHeight: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  filterList: { paddingHorizontal: SIZES.lg, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterChipActive: { backgroundColor: COLORS.primaryBlue, shadowOpacity: 0.15 },
  filterText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.2 },
  filterTextActive: { color: '#fff' },

  list: { padding: SIZES.lg, gap: 16 },

  // Professional Order Card
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SIZES.md,
    ...SHADOWS.medium, // From theme constants, typically good shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F9FAFB',
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
    borderRadius: 12, ...SHADOWS.small
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  clearBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  clearBtnText: { color: COLORS.primaryBlue, fontWeight: '600', fontSize: 15 },
});
