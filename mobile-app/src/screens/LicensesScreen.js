import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, BookOpen } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const LICENSES = [
  {
    name: 'React Native',
    version: '^0.83.6',
    author: 'Meta Platforms, Inc.',
    license: 'MIT License',
    purpose: 'Core framework for building the mobile application'
  },
  {
    name: 'Expo',
    version: '^55.0.24',
    author: 'Expo',
    license: 'MIT License',
    purpose: 'Development platform and runtime for React Native'
  },
  {
    name: '@supabase/supabase-js',
    version: '^2.42.0',
    author: 'Supabase',
    license: 'MIT License',
    purpose: 'Backend database and authentication services'
  },
  {
    name: 'React Navigation',
    version: '^6.1.17',
    author: 'React Navigation',
    license: 'MIT License',
    purpose: 'Navigation library for screen routing'
  },
  {
    name: 'lucide-react-native',
    version: '^0.368.0',
    author: 'Lucide Icons',
    license: 'ISC License',
    purpose: 'Icon library for UI components'
  },
  {
    name: 'AsyncStorage',
    version: '^2.2.0',
    author: 'React Native Community',
    license: 'MIT License',
    purpose: 'Local storage for cart and wishlist persistence'
  },
  {
    name: 'react-native-gesture-handler',
    version: '~2.30.0',
    author: 'Software Mansion',
    license: 'MIT License',
    purpose: 'Touch gesture handling for smooth interactions'
  },
  {
    name: 'react-native-safe-area-context',
    version: '~5.6.2',
    author: 'Th3rdwave',
    license: 'MIT License',
    purpose: 'Safe area insets for notched devices'
  },
  {
    name: 'react-native-svg',
    version: '^15.15.3',
    author: 'React Native Community',
    license: 'MIT License',
    purpose: 'SVG rendering support for graphics'
  },
  {
    name: 'expo-image-picker',
    version: '~55.0.19',
    author: 'Expo',
    license: 'MIT License',
    purpose: 'Camera and gallery access for profile photos'
  },
  {
    name: 'expo-blur',
    version: '~55.0.14',
    author: 'Expo',
    license: 'MIT License',
    purpose: 'Glassmorphism blur effects in UI'
  }
];

export default function LicensesScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('licenses.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Intro section */}
        <View style={styles.introCard}>
          <View style={styles.introIconBox}>
            <BookOpen size={28} color={COLORS.primaryBlue} />
          </View>
          <Text style={styles.introTitle}>{t('licenses.introTitle')}</Text>
          <Text style={styles.introText}>
            {t('licenses.introText')}
          </Text>
        </View>

        {/* License cards */}
        <Text style={styles.sectionTitle}>{t('licenses.thirdPartyLibraries')}</Text>
        {LICENSES.map((lib, index) => (
          <View key={index} style={styles.licenseCard}>
            <View style={styles.licenseHeader}>
              <Text style={styles.licenseName}>{lib.name}</Text>
              <View style={styles.licenseBadge}>
                <Text style={styles.licenseType}>{lib.license}</Text>
              </View>
            </View>
            <Text style={styles.licenseVersion}>{t('licenses.version', { version: lib.version })}</Text>
            <Text style={styles.licenseAuthor}>{t('licenses.by', { author: lib.author })}</Text>
            <View style={styles.divider} />
            <Text style={styles.licensePurpose}>{lib.purpose}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>{t('licenses.mitLicenseTitle')}</Text>
          <Text style={styles.footerText}>
            {t('licenses.mitLicenseText')}
          </Text>
          <Text style={styles.footerNote}>
            {t('licenses.fullLicenseNote')}
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary
  },
  content: {
    padding: SIZES.lg,
    paddingBottom: 40
  },

  // Intro card
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  introIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5
  },
  introText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '500'
  },

  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4
  },

  // License cards
  licenseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 8
  },
  licenseBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE'
  },
  licenseType: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryBlue,
    letterSpacing: 0.3
  },
  licenseVersion: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 2
  },
  licenseAuthor: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 12
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10
  },
  licensePurpose: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontStyle: 'italic'
  },

  // Footer card
  footerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 10
  },
  footerText: {
    fontSize: 13,
    color: '#15803D',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500'
  },
  footerNote: {
    fontSize: 12,
    color: '#16A34A',
    fontStyle: 'italic',
    fontWeight: '600'
  },

  bottomSpacer: {
    height: 20
  }
});
