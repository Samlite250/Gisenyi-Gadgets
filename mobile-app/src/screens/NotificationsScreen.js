import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ActivityIndicator, RefreshControl,
    Animated, LayoutAnimation, UIManager, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, ShoppingBag, Package, Tag, Bell, Star, Truck } from 'lucide-react-native';
import { COLORS, SIZES } from '../constants/theme';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { notificationLogger } from '../utils/logger';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TYPE_MAP = {
    order:    { icon: Package,     color: '#4285F4' },
    promo:    { icon: Tag,         color: '#EA4335' },
    review:   { icon: Star,        color: '#FBBC04' },
    delivery: { icon: Truck,       color: '#34A853' },
    general:  { icon: ShoppingBag, color: '#6366F1' },
    system:   { icon: Bell,        color: '#F97316' },
};

const DEMO_NOTIFICATIONS = [
    { id: 'demo_1', type: 'order',   title: 'Welcome to Gisenyi Gadgets!', body: 'Start shopping and your order updates will appear here. You can track all your orders from the Orders tab.',            is_read: false, created_at: new Date().toISOString() },
    { id: 'demo_2', type: 'promo',   title: '🔥 Flash Sale — 40% OFF',    body: 'Limited time deals on AirPods Pro and Sony headphones! Use code FLASH40 at checkout. Offer valid until midnight.',   is_read: false, created_at: new Date().toISOString() },
    { id: 'demo_3', type: 'general', title: 'New Arrivals Just Dropped',   body: 'Check out the latest MacBook Pro M4, Galaxy S25 and more. Browse the full collection in the Search tab.',           is_read: true,  created_at: new Date().toISOString() },
];

const fmtTime = (iso) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7)  return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
};

function NotifCard({ item, onMarkRead }) {
    const [expanded, setExpanded] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const cfg = TYPE_MAP[item.type] || TYPE_MAP.general;
    const Icon = cfg.icon;
    const isUnread = !item.is_read;
    const body = item.body || item.message || '';

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(v => !v);
        Animated.timing(rotateAnim, {
            toValue: expanded ? 0 : 1,
            duration: 200,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
        if (isUnread) onMarkRead(item);
    };

    const chevronRotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });

    return (
        <TouchableOpacity
            style={[styles.notifCard, isUnread && styles.notifCardUnread]}
            activeOpacity={0.8}
            onPress={toggle}
        >
            <View style={[styles.iconBox, { backgroundColor: cfg.color + '18' }]}>
                <Icon size={20} color={cfg.color} />
            </View>

            <View style={styles.notifContent}>
                <View style={styles.notifTopRow}>
                    <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]} numberOfLines={expanded ? undefined : 1}>
                        {item.title}
                    </Text>
                    <View style={styles.notifMeta}>
                        {isUnread && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
                        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                            <ChevronRight size={16} color={COLORS.textMuted} />
                        </Animated.View>
                    </View>
                </View>

                {expanded && body.length > 0 && (
                    <>
                        <Text style={[styles.notifMessage, { marginTop: 8 }]}>{body}</Text>
                        <View style={[styles.expandedFooter, { borderTopColor: cfg.color + '30' }]}>
                            <View style={[styles.typeBadge, { backgroundColor: cfg.color + '15' }]}>
                                <Icon size={11} color={cfg.color} />
                                <Text style={[styles.typeBadgeText, { color: cfg.color }]}>
                                    {(item.type || 'general').charAt(0).toUpperCase() + (item.type || 'general').slice(1)}
                                </Text>
                            </View>
                            <Text style={styles.notifTime}>{fmtTime(item.created_at)}</Text>
                        </View>
                    </>
                )}

                {!expanded && (
                    <Text style={styles.notifTime}>{fmtTime(item.created_at)}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

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
                .or(`user_id.eq.${user.id},user_id.is.null`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data?.length ? data : DEMO_NOTIFICATIONS);
        } catch (err) {
            notificationLogger.error('Failed to fetch notifications', err);
            setNotifications(DEMO_NOTIFICATIONS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const markRead = async (notif) => {
        if (notif.is_read || notif.id.startsWith('demo_')) return;
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        if (user) {
            await supabase.from('notifications').update({ is_read: true })
                .eq('user_id', user.id).eq('is_read', false);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

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
                    keyExtractor={item => String(item.id)}
                    renderItem={({ item }) => <NotifCard item={item} onMarkRead={markRead} />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
                            tintColor={COLORS.primaryBlue}
                        />
                    }
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
        elevation: 1,
        ...Platform.select({
            web: { boxShadow: '0px 1px 4px rgba(0,0,0,0.06)' },
            default: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
        }),
    },
    notifCardUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primaryBlue },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
    notifContent: { flex: 1 },
    notifTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    notifTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, flex: 1, marginRight: 6 },
    notifTitleUnread: { fontWeight: '800', color: '#111827' },
    notifMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    unreadDot: { width: 8, height: 8, borderRadius: 4 },
    notifMessage: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, marginBottom: 6 },
    notifTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
    expandedFooter: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 10, paddingTop: 10, borderTopWidth: 1,
    },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    typeBadgeText: { fontSize: 11, fontWeight: '700' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
