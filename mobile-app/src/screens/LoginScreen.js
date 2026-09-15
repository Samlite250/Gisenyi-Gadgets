import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image, useWindowDimensions,
  Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Sparkles, Truck, ShieldCheck, CreditCard, Star } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { COLORS, SHADOWS } from '../constants/theme';

const AnimatedBubble = ({
  style,
  opacity = 0.15,
  size = 65,
  rotate = '0deg',
  duration = 5000,
  translateYOffset = 14,
  useDisc = false,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -translateYOffset],
  });

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        style,
        {
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      {useDisc ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 8,
            opacity,
            ...Platform.select({
              web: { boxShadow: '0px 6px 16px rgba(0,0,0,0.22)' },
              default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.22,
                shadowRadius: 8,
                elevation: 5,
              },
            }),
          }}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: '85%', height: '85%' }}
            resizeMode="contain"
          />
        </View>
      ) : (
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: size, height: size, opacity }}
          resizeMode="contain"
        />
      )}
    </Animated.View>
  );
};

const LogoBubblesBackground = () => (
  <View style={styles.bubblesContainer} pointerEvents="none">
    <AnimatedBubble
      style={{ top: -20, left: -40 }}
      size={180} opacity={0.14} rotate="-15deg"
      duration={5500} translateYOffset={16}
    />
    <AnimatedBubble
      style={{ top: '15%', right: -60 }}
      size={240} opacity={0.17} rotate="25deg"
      duration={7200} translateYOffset={22}
    />
    <AnimatedBubble
      style={{ bottom: 50, left: '6%' }}
      size={150} opacity={0.13} rotate="12deg"
      duration={6000} translateYOffset={18}
    />
    <AnimatedBubble
      style={{ bottom: -30, right: '8%' }}
      size={200} opacity={0.15} rotate="-20deg"
      duration={8000} translateYOffset={20}
    />
    <AnimatedBubble
      style={{ top: '50%', left: -30 }}
      size={130} opacity={0.11} rotate="35deg"
      duration={5000} translateYOffset={14}
    />
  </View>
);

const PanelBubblesBackground = () => (
  <View style={styles.bubblesContainer} pointerEvents="none">
    <AnimatedBubble
      style={{ top: 15, right: 20 }}
      size={65} opacity={0.15} rotate="15deg"
      duration={4200} translateYOffset={16}
    />
    <AnimatedBubble
      style={{ top: '25%', right: -10 }}
      size={75} opacity={0.17} rotate="-20deg"
      duration={5200} translateYOffset={18}
    />
    <AnimatedBubble
      style={{ top: '45%', left: -10 }}
      size={55} opacity={0.12} rotate="30deg"
      duration={3800} translateYOffset={12}
    />
    <AnimatedBubble
      style={{ bottom: '30%', right: 15 }}
      size={70} opacity={0.14} rotate="-12deg"
      duration={4800} translateYOffset={15}
    />
    <AnimatedBubble
      style={{ bottom: 15, left: 20 }}
      size={80} opacity={0.16} rotate="25deg"
      duration={5800} translateYOffset={20}
    />
    <AnimatedBubble
      style={{ bottom: 80, right: -10 }}
      size={60} opacity={0.13} rotate="-18deg"
      duration={4500} translateYOffset={14}
    />
  </View>
);

const BrandInfoPanel = () => (
  <View style={styles.brandPanel}>
    <PanelBubblesBackground />

    <View style={styles.brandHeaderGroup}>
      <Text style={styles.brandTitle}>Gisenyi Gadgets</Text>
      <Text style={styles.brandTagline}>Official Electronics & Tech Store</Text>
    </View>

    <View style={styles.featureList}>
      <View style={styles.featureItem}>
        <View style={styles.featureIconWrap}>
          <ShieldCheck size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>Genuine Tech Products</Text>
          <Text style={styles.featureDesc}>Smartphones, laptops, audio & tech accessories</Text>
        </View>
      </View>

      <View style={styles.featureItem}>
        <View style={styles.featureIconWrap}>
          <Truck size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>Fast Local Delivery</Text>
          <Text style={styles.featureDesc}>Express shipping in Rubavu, Gisenyi & Kigali</Text>
        </View>
      </View>

      <View style={styles.featureItem}>
        <View style={styles.featureIconWrap}>
          <CreditCard size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>Mobile Money & Cards</Text>
          <Text style={styles.featureDesc}>MTN MoMo, Airtel Money & Card payments</Text>
        </View>
      </View>
    </View>

    <View style={styles.brandFooterNote}>
      <Text style={styles.brandFooterText}>Rubavu, Gisenyi • Rwanda</Text>
    </View>
  </View>
);

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const returnTo = route?.params?.returnTo || null;
  const successMessage = route?.params?.message || null;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('errors.invalidInput'));
      return;
    }
    setLoading(true);
    setError('');
    setFocusedField(null);
    try {
      const data = await signIn({ email: email.trim().toLowerCase(), password });

      // Admin Security Guard: Check if logging user has admin role or email
      let isAdminUser = email.trim().toLowerCase() === 'gisenyigadgets@gmail.com';
      if (!isAdminUser && data?.user?.id) {
        const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (prof?.role === 'admin') isAdminUser = true;
      }

      if (isAdminUser) {
        if (Platform.OS === 'web') {
          window.location.href = '/admin';
          return;
        }
      }

      if (returnTo) {
        navigation.navigate(returnTo);
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    } catch (err) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDesktop && styles.containerDesktop]}>
      <LogoBubblesBackground />

      <View style={[styles.topNav, isDesktop && styles.topNavDesktop]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('Main');
          }}
        >
          <ArrowLeft size={18} color={COLORS.textPrimary} />
          <Text style={styles.backBtnText}>Continue Browsing</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.authCardWrapper, isDesktop && styles.authCardWrapperDesktop]}>
            {/* Left Column on Desktop */}
            {isDesktop && <BrandInfoPanel />}

            {/* Right Column / Form Container */}
            <View style={[styles.formColumn, isDesktop && styles.formColumnDesktop]}>
              <View style={styles.header}>
                <View style={styles.logoWrap}>
                  <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 80, height: 80 }}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>{t('auth.loginSuccess')}</Text>
                <Text style={styles.subtitle}>{t('auth.signIn')}</Text>
              </View>

              {successMessage ? (
                <View style={styles.successBanner}><Text style={styles.successText}>✓ {successMessage}</Text></View>
              ) : null}
              {error ? (
                <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>
              ) : null}

              {/* Form Card */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.email')}</Text>
                  <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
                    <Mail size={18} color={focusedField === 'email' ? COLORS.primaryBlue : '#94A3B8'} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.email')}
                      placeholderTextColor="#94A3B8"
                      value={email}
                      onChangeText={(t) => { setEmail(t); setError(''); }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('auth.password')}</Text>
                  <View style={[styles.inputWrap, focusedField === 'password' && styles.inputWrapFocused]}>
                    <Lock size={18} color={focusedField === 'password' ? COLORS.primaryBlue : '#94A3B8'} style={{ marginRight: 10 }} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.password')}
                      placeholderTextColor="#94A3B8"
                      value={password}
                      onChangeText={(t) => { setPassword(t); setError(''); }}
                      secureTextEntry={!showPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                      {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginBtn, loading && styles.btnDisabled]}
                  onPress={handleLogin} disabled={loading}
                  activeOpacity={0.88}
                >
                  <Text style={styles.loginBtnText}>{loading ? t('common.loading') : t('auth.login')}</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>{t('auth.dontHaveAccount')} </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register', { returnTo })}>
                    <Text style={styles.registerText}>{t('auth.signUp')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', position: 'relative' },
  containerDesktop: { backgroundColor: '#F1F5F9' },
  bubblesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  bubbleWrap: {
    position: 'absolute',
  },
  brandWatermark: {
    position: 'absolute',
    right: -50,
    bottom: -50,
    width: 260,
    height: 260,
    opacity: 0.05,
  },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  topNavDesktop: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' },
      default: SHADOWS.sm,
    }),
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContentDesktop: {
    paddingVertical: 40,
  },
  authCardWrapper: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 24,
    ...Platform.select({
      web: { boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.08)' },
      default: SHADOWS.md,
    }),
  },
  authCardWrapperDesktop: {
    maxWidth: 'none',
    width: 900,
    flexDirection: 'row',
    padding: 0,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { boxShadow: '0px 20px 50px rgba(15, 23, 42, 0.08)' },
      default: SHADOWS.lg,
    }),
  },

  /* Left Brand Info Panel */
  brandPanel: {
    flex: 1,
    backgroundColor: '#4285F4',
    padding: 40,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  brandHeaderGroup: {
    marginTop: 10,
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 14,
    color: '#E8F0FE',
    fontWeight: '600',
  },
  featureList: {
    gap: 24,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  featureDesc: {
    color: '#E8F0FE',
    fontSize: 12,
    marginTop: 2,
  },
  brandFooterNote: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandFooterText: {
    color: '#E8F0FE',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Right Form Column */
  formColumn: {
    width: '100%',
    padding: 20,
  },
  formColumnDesktop: {
    width: 440,
    padding: 40,
    justifyContent: 'center',
  },

  header: { alignItems: 'center', marginBottom: 28 },
  logoWrap: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  successBanner: { backgroundColor: '#D1FAE5', padding: 12, borderRadius: 12, marginBottom: 16 },
  successText: { color: '#065F46', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  errorBanner: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  form: { gap: 18 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { transition: 'border-color 0.2s ease, box-shadow 0.2s ease' },
    }),
  },
  inputWrapFocused: {
    borderColor: COLORS.primaryBlue,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: { boxShadow: '0px 0px 0px 4px rgba(59, 130, 246, 0.12)' },
    }),
  },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -2 },
  forgotText: { color: COLORS.primaryBlue, fontSize: 13, fontWeight: '600' },
  loginBtn: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    ...Platform.select({
      web: { boxShadow: '0px 4px 14px rgba(59, 130, 246, 0.35)', cursor: 'pointer' },
      default: SHADOWS.md,
    }),
  },
  btnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  footerText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  registerText: { color: COLORS.primaryBlue, fontSize: 14, fontWeight: '700' },
});


