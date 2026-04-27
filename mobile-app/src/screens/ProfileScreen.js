import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart, MapPin, CreditCard, Settings,
  HelpCircle, LogOut, ChevronRight, Package, Bell, Edit3, ShoppingBag, Calendar,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const MENU_ITEMS = [
  { id: 'orders', title: 'My Orders', icon: Package, color: '#4285F4', route: 'Orders' },
  { id: 'wishlist', title: 'Wishlist', icon: Heart, color: '#EA4335', route: 'Wishlist' },
  { id: 'addresses', title: 'Addresses', icon: MapPin, color: '#34A853', route: 'Addresses' },
  { id: 'payment', title: 'Payment Methods', icon: CreditCard, color: '#FBBC04', route: 'PaymentMethods' },
  { id: 'notifications', title: 'Notifications', icon: Bell, color: '#8B5CF6', route: 'Notifications' },
  { id: 'settings', title: 'Settings', icon: Settings, color: '#0EA5E9', route: 'Settings' },
  { id: 'help', title: 'Help & Support', icon: HelpCircle, color: '#F97316', route: 'HelpSupport' },
];

export default function ProfileScreen({ navigation }) {
  const { user, profile, signOut } = useAuth();
  const { wishlistItems } = useWishlist();
  const { totalItems } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Guest User';
  const displayEmail = user?.email || '';
  const avatarUrl = profile?.avatar_url;

  // Member since year from Supabase created_at
  const memberSince = user?.created_at
    ? new Date(user.created_at).getFullYear()
    : new Date().getFullYear();

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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              : <View style={[styles.avatar, styles.avatarInitials]}>
                <Text style={styles.initialsText}>{getInitials(displayName)}</Text>
              </View>
            }
          </View>
          <View style={styles.userNameWrap}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{displayEmail}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => Alert.alert('Edit Profile', 'Edit profile feature coming soon.')}
          >
            <Edit3 size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ShoppingBag size={18} color={COLORS.primaryBlue} />
            <Text style={styles.statVal}>{totalItems || 0}</Text>
            <Text style={styles.statLabel}>In Cart</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Heart size={18} color={COLORS.error} />
            <Text style={styles.statVal}>{wishlistItems?.length || 0}</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Calendar size={18} color={COLORS.primaryGreen} />
            <Text style={styles.statVal}>{memberSince}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route && navigation.navigate(item.route)}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
                  <item.icon size={18} color={item.color || COLORS.textSecondary} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: COLORS.error + '15' }]}>
                <LogOut size={18} color={COLORS.error} />
              </View>
              <Text style={[styles.menuTitle, { color: COLORS.error }]}>Sign Out</Text>
            </View>
            <ChevronRight size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  headerBanner: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 60, paddingBottom: 32,
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  avatarWrap: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)',
    overflow: 'hidden', backgroundColor: '#3B5EAB',
  },
  avatar: { width: '100%', height: '100%' },
  avatarInitials: { justifyContent: 'center', alignItems: 'center' },
  initialsText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userNameWrap: { flex: 1, gap: 3 },
  name: { fontSize: 19, fontWeight: '800', color: '#fff' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingVertical: 18, paddingHorizontal: SIZES.lg,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  statVal: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  menu: { backgroundColor: '#fff', marginTop: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.lg,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
});
