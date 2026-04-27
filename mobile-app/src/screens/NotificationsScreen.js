import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ShoppingBag, Package, Tag, Bell, Star, Truck } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const TYPE_MAP = {
    order: { icon: Package, color: '#4285F4' },
    promo: { icon: Tag, color: '#EA4335' },
    review: { icon: Star, color: '#FBBC04' },
    delivery: { icon: Truck, color: '#34A853' },
    general: { icon: ShoppingBag, color: '#8B5CF6' },
    system: { icon: Bell, color: '#F97316' },
};

// Shown when there are no DB notifications yet
const DEMO_NOTIFICATIONS = [
    { id: 'demo_1', type: 'order', title: 'Welcome to Gisenyi Gadgets!', body: 'Start shopping and your order updates will appear here.', is_read: false, created_at: new Date().toISOString() },
    { id: 'demo_2', type: 'promo', title: '🔥 Flash Sale — 40% OFF', body: 'Limited time deals on AirPods Pro and Sony headphones!', is_read: false, created_at: new Date().toISOString() },
    { id: 'demo_3', type: 'general', title: 'New Arrivals Just Dropped', body: 'Check out the latest MacBook Pro M4, Galaxy S25 and more.', is_read: true, created_at: new Date().toISOString() },
];

const fmtTime = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
};

export default function NotificationsScreen({ navigation }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) { setNotifications(DEMO_NOTIFICATIONS); setLoading(false); return; }
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data?.length ? data : DEMO_NOTIFICATIONS);
        } catch (err) {
            console.warn('Notifications fetch error:', err.message);
            setNotifications(DEMO_NOTIFICATIONS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markRead = async (notif) => {
        if (notif.is_read) return;
        setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
        if (user && !notif.id.startsWith('demo_')) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
        }
    };

    const markAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        if (user) {
            await supabase.from('notifications').update({ is_read: true })
                .eq('user_id', user.id).eq('is_read', false);
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const renderItem = ({ item }) => {
        const cfg = TYPE_MAP[item.type] || TYPE_MAP.general;
        const Icon = cfg.icon;
        const isUnread = !item.is_read;
        return (
            <TouchableOpacity
                style={[styles.notifCard, isUnread && styles.notifCardUnread]}
                activeOpacity={0.75}
                onPress={() => markRead(item)}
            >
                <View style={[styles.iconBox, { backgroundColor: cfg.color + '18' }]}>
                    <Icon size={20} color={cfg.color} />
                </View>
                <View style={styles.notifContent}>
                    <View style={styles.notifTopRow}>
                        <Text style={[styles.notifTitle, isUnread && { fontWeight: '800', color: COLORS.textPrimary }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {isUnread && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
                    </View>
                    <Text style={styles.notifMessage} numberOfLines={2}>{item.body || item.message}</Text>
                    <Text style={styles.notifTime}>{fmtTime(item.created_at)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && <Text style={styles.headerSub}>{unreadCount} unread</Text>}
                </View>
                {unreadCount > 0
                    ? <TouchableOpacity onPress={markAllRead}><Text style={styles.markAllText}>Mark all read</Text></TouchableOpacity>
                    : <View style={{ width: 80 }} />
                }
            </View>

            {loading
                ? <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primaryBlue} /></View>
                : <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} tintColor={COLORS.primaryBlue} />}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Bell size={48} color={COLORS.textMuted} strokeWidth={1.5} />
                            <Text style={styles.emptyTitle}>No notifications</Text>
                            <Text style={styles.emptyText}>You're all caught up!</Text>
                        </View>
                    }
                />
            }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: SIZES.md,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backBtn: { padding: SIZES.sm },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    headerSub: { fontSize: 12, color: COLORS.primaryBlue, fontWeight: '600' },
    markAllText: { fontSize: 13, color: COLORS.primaryBlue, fontWeight: '700' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: SIZES.md, gap: 10 },
    notifCard: {
        flexDirection: 'row', gap: 14,
        backgroundColor: '#fff', borderRadius: 14,
        padding: SIZES.md, alignItems: 'flex-start',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    },
    notifCardUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primaryBlue },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notifContent: { flex: 1 },
    notifTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
    unreadDot: { width: 8, height: 8, borderRadius: 4 },
    notifMessage: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
    notifTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
