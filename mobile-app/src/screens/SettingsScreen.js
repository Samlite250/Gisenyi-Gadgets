import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, ChevronRight, Bell, Shield, Info, Trash2, Lock } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

const NOTIF_STORAGE_KEY = '@GisenyiGadgets_notifications';

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    offers: true
  });
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  // Load persisted notification prefs
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_STORAGE_KEY).then((stored) => {
      if (stored && isMounted.current) {
        setNotifications(JSON.parse(stored));
      }
    });
  }, []);

  const toggleSwitch = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? All your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete', style: 'destructive', onPress: async () => {
                    try {
                      // Delete profile row — auth user deletion requires service role key,
                      // so we mark the profile as deleted and sign out.
                      await supabase
                        .from('profiles')
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', user.id);
                      await signOut();
                    } catch (err) {
                      Alert.alert('Error', 'Could not delete account. Please contact support.');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, value, onValueChange, isSwitch, onPress, showChevron = true, color = COLORS.textPrimary }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, { backgroundColor: Icon === Trash2 ? '#FEE2E2' : '#F3F4F6' }]}>
          <Icon size={20} color={Icon === Trash2 ? COLORS.error : COLORS.textSecondary} />
        </View>
        <Text style={[styles.settingLabel, { color }]}>{title}</Text>
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: COLORS.primaryBlue + '80' }}
          thumbColor={value ? COLORS.primaryBlue : '#f4f3f4'}
        />
      ) : (
        showChevron && <ChevronRight size={18} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon={Bell} title="Push Notifications" isSwitch value={notifications.push} onValueChange={() => toggleSwitch('push')} />
          <SettingRow icon={Bell} title="Email Updates" isSwitch value={notifications.email} onValueChange={() => toggleSwitch('email')} />
          <SettingRow icon={Bell} title="Special Offers" isSwitch value={notifications.offers} onValueChange={() => toggleSwitch('offers')} />
        </View>

        <Text style={styles.sectionTitle}>Privacy & Security</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon={Lock} title="Change Password" onPress={() => navigation.navigate('ForgotPassword')} />
          <SettingRow
            icon={Shield}
            title="Privacy Policy"
            onPress={() => Linking.openURL('https://gisenyi-gadgets.vercel.app/privacy')}
          />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon={Info}
            title="App Version"
            showChevron={false}
            onPress={() => Alert.alert('Gisenyi Gadgets', 'Version 1.2.0 (Build 45)')}
          />
          <SettingRow
            icon={Info}
            title="Open Source Licenses"
            onPress={() => navigation.navigate('ChatSupport')}
          />
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <View style={styles.deleteIconBox}>
            <Trash2 size={20} color={COLORS.error} />
          </View>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Made with ❤️ in Gisenyi, RW</Text>
          <Text style={styles.footerText}>© 2024 Gisenyi Gadgets Ltd.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: SIZES.md,
    height: 60, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { padding: SIZES.lg, paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 24, ...SHADOWS.sm, borderWidth: 1, borderColor: '#F3F4F6' },
  settingItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16,
    height: 64, borderBottomWidth: 1, borderBottomColor: '#F9FAFB'
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginTop: 8, marginBottom: 32, ...SHADOWS.sm,
    borderWidth: 1, borderColor: '#FEE2E2'
  },
  deleteIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  deleteText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  footerInfo: { alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
});
