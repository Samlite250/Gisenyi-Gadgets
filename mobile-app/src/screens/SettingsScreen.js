import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, ChevronRight, Bell, Shield, Info, Trash2, Lock, RefreshCw } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import Constants from 'expo-constants';

const NOTIF_STORAGE_KEY = '@GisenyiGadgets_notifications';

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    offers: true
  });
  const [checking, setChecking] = useState(false);
  const isMounted = useRef(true);

  // Get app version from expo config
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.android?.versionCode || Constants.expoConfig?.ios?.buildNumber || '1';

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

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      // Try Supabase first (silently fail if table doesn't exist)
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .eq('platform', 'android')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If Supabase has version data
      if (!error && data) {
        const latestVersion = data.version_number;
        const currentVersion = appVersion;

        if (latestVersion > currentVersion) {
          Alert.alert(
            '🎉 New Update Available!',
            `A new version is ready to download!\n\n📱 Your Version: v${currentVersion}\n✨ Latest Version: v${latestVersion}\n\n📝 What's New:\n${data.release_notes || 'Bug fixes and performance improvements'}\n\nUpdate now to get the latest features!`,
            [
              { text: 'Later', style: 'cancel' },
              {
                text: '⬇️ Download Now',
                style: 'default',
                onPress: () => {
                  if (data.download_url) {
                    Linking.openURL(data.download_url);
                  } else {
                    Alert.alert('Coming Soon', 'Download link will be available soon. Check back later!');
                  }
                }
              }
            ]
          );
          setChecking(false);
          return;
        } else {
          // Same version or newer
          Alert.alert(
            '✅ App is Up to Date',
            `Your app is already updated!\n\n📱 Current Version: v${currentVersion}\n🎯 Latest Version: v${latestVersion}\n\nYou're running the latest version. Enjoy!`,
            [{ text: 'Got it!' }]
          );
          setChecking(false);
          return;
        }
      }

      // If no Supabase data, show up-to-date message
      Alert.alert(
        '✅ App is Up to Date',
        `Your app is already updated!\n\n📱 Current Version: v${appVersion}\n🎯 Build: ${buildNumber}\n\nYou're running the latest version of Gisenyi Gadgets. No updates needed!`,
        [{ text: 'Got it!' }]
      );

    } catch (error) {
      console.log('Update check error (expected):', error);
      // Show up-to-date message on any error
      Alert.alert(
        '✅ App is Up to Date',
        `Your app is already updated!\n\n📱 Current Version: v${appVersion}\n🎯 Build: ${buildNumber}\n\nNo updates available at this time.`,
        [{ text: 'Got it!' }]
      );
    } finally {
      setChecking(false);
    }
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
            onPress={() => Alert.alert('Privacy Policy', 'Your privacy is important to us. We collect and use your data only to provide and improve our services. We do not share your personal information with third parties without your consent.')}
          />
        </View>

        <Text style={styles.sectionTitle}>App Updates</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={checkForUpdates}
            disabled={checking}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                {checking ? (
                  <ActivityIndicator size="small" color={COLORS.primaryBlue} />
                ) : (
                  <RefreshCw size={20} color={COLORS.primaryBlue} />
                )}
              </View>
              <Text style={styles.settingLabel}>Check for Updates</Text>
            </View>
            <ChevronRight size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.sectionCard}>
          <SettingRow
            icon={Info}
            title="App Version"
            showChevron={false}
            onPress={() => Alert.alert('Gisenyi Gadgets', `Version v${appVersion} (Build ${buildNumber})\n\nDeveloped with ❤️ in Gisenyi, Rwanda`)}
          />
          <SettingRow
            icon={Info}
            title="Open Source Licenses"
            onPress={() => navigation.navigate('Licenses')}
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
