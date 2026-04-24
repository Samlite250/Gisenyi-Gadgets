import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart, MapPin, CreditCard, Settings,
  HelpCircle, LogOut, ChevronRight, Package, Bell,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const MENU_ITEMS = [
  { id: 'orders', title: 'My Orders', icon: Package, route: 'Orders' },
  { id: 'wishlist', title: 'Wishlist', icon: Heart, route: 'Wishlist' },
  { id: 'addresses', title: 'Addresses', icon: MapPin, route: null },
  { id: 'payment', title: 'Payment Methods', icon: CreditCard, route: null },
  { id: 'notifications', title: 'Notifications', icon: Bell, route: null },
  { id: 'settings', title: 'Settings', icon: Settings, route: null },
  { id: 'help', title: 'Help & Support', icon: HelpCircle, route: null },
];

export default function ProfileScreen({ navigation }) {
  const { user, profile, signOut } = useAuth();
  const { totalWishlistItems } = useWishlist();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Guest User';
  const displayEmail = user?.email || '';
  const avatarUrl = profile?.avatar_url;

  const getInitials = (name) =>
    name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try { await signOut(); }
          catch (err) { Alert.alert('Error', err.message); }
          finally { setLoggingOut(false); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.headerPad}>
          <View style={styles.profileCard}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
                </View>
              )}
            <View style={styles.profileInfo}>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.email} numberOfLines={1}>{displayEmail}</Text>
              <TouchableOpacity style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Orders', value: '—' },
            { label: 'Wishlist', value: totalWishlistItems },
            { label: 'Reviews', value: '—' },
          ].map((s, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route && navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconWrap}>
                  <item.icon size={18} color={COLORS.primaryBlue} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <View style={styles.menuRight}>
                {item.id === 'wishlist' && totalWishlistItems > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalWishlistItems}</Text>
                  </View>
                )}
                <ChevronRight size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.menuItem, { marginTop: SIZES.sm }]}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconWrap, { backgroundColor: `${COLORS.error}15` }]}>
                <LogOut size={18} color={COLORS.error} />
              </View>
              <Text style={[styles.menuTitle, { color: COLORS.error }]}>
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Gisenyi Gadgets v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  headerPad: { padding: SIZES.lg, paddingBottom: 0 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: SIZES.radiusXl, padding: SIZES.lg, ...SHADOWS.md,
  },
  avatar: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitials: { fontSize: SIZES.fontXl, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1, marginLeft: SIZES.md },
  name: { fontSize: SIZES.fontLg, fontWeight: '700', color: '#fff', marginBottom: 2 },
  email: { fontSize: SIZES.fontSm, color: 'rgba(255,255,255,0.75)', marginBottom: SIZES.sm },
  editBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4, paddingHorizontal: SIZES.sm,
    borderRadius: SIZES.radiusFull,
  },
  editBtnText: { color: '#fff', fontSize: SIZES.fontXs, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.cardBg,
    marginHorizontal: SIZES.lg, marginTop: SIZES.sm,
    borderRadius: SIZES.radiusLg, padding: SIZES.md, ...SHADOWS.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: SIZES.fontXl, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: SIZES.fontXs, color: COLORS.textSecondary, marginTop: 2 },
  menu: { padding: SIZES.lg, gap: SIZES.sm },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg, padding: SIZES.md,
    borderRadius: SIZES.radiusLg, ...SHADOWS.sm,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: SIZES.radiusMd,
    backgroundColor: `${COLORS.primaryBlue}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  menuTitle: { fontSize: SIZES.fontMd, color: COLORS.textPrimary, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  badge: {
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusFull,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: SIZES.fontXs, fontWeight: '700' },
  version: {
    textAlign: 'center', color: COLORS.textMuted,
    fontSize: SIZES.fontXs, paddingBottom: SIZES.xl,
  },
});
