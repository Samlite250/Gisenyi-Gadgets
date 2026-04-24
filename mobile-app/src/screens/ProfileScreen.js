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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.userInfo}>
            <View style={styles.avatarWrap}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.userNameWrap}>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.email}>{displayEmail}</Text>
            </View>
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
                <item.icon size={20} color={COLORS.textSecondary} />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuLeft}>
              <LogOut size={20} color={COLORS.error} />
              <Text style={[styles.menuTitle, { color: COLORS.error }]}>Logout</Text>
            </View>
            <ChevronRight size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBanner: {
    backgroundColor: COLORS.primaryBlue,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: SIZES.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userNameWrap: {
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  menu: {
    marginTop: SIZES.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
});
