import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image, useWindowDimensions,
  Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Check, ArrowLeft, Sparkles, Truck, ShieldCheck, Gift, Star } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SHADOWS } from '../constants/theme';

const GoogleIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </Svg>
);

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
          <Gift size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>Member Account</Text>
          <Text style={styles.featureDesc}>Track orders, manage profile & quick checkout</Text>
        </View>
      </View>
    </View>

    <View style={styles.brandFooterNote}>
      <Text style={styles.brandFooterText}>Rubavu, Gisenyi • Rwanda</Text>
    </View>
  </View>
);

// Field component with focus highlight
const Field = ({ icon: Icon, value, onChangeText, onFocus, onBlur, isFocused, placeholder, secureEntry, keyType }) => (
  <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
    <Icon size={18} color={isFocused ? COLORS.primaryBlue : '#94A3B8'} style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureEntry}
      keyboardType={keyType || 'default'}
      autoCapitalize={keyType === 'email-address' ? 'none' : 'words'}
      autoCorrect={false}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </View>
);

export default function RegisterScreen({ navigation, route }) {
  const { signUp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const returnTo = route?.params?.returnTo || null;

  const set = (key) => (val) => { setForm((f) => ({ ...f, [key]: val })); setError(''); };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || t('auth.googleSignInFailed'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    if (!form.fullName.trim()) return t('auth.errors.fullNameRequired');
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return t('auth.errors.invalidEmail');
    if (form.password.length < 6) return t('auth.errors.passwordTooShort');
    if (form.password !== form.confirmPassword) return t('auth.errors.passwordsDoNotMatch');
    if (!agreed) return t('auth.errors.mustAgreeToTerms');
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setFocusedField(null);
    try {
      await signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
      });

      navigation.replace('Login', { message: t('auth.accountCreatedMessage'), returnTo });
    } catch (e) {
      setError(e.message || t('auth.errors.registrationFailed'));
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
          contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
          keyboardShouldPersistTaps="handled"
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
                <Text style={styles.title}>{t('auth.createAccount')}</Text>
                <Text style={styles.subtitle}>{t('auth.signUpToGetStarted')}</Text>
              </View>

              {error ? (
                <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>
              ) : null}

              <View style={styles.form}>
                <Field
                  icon={User}
                  value={form.fullName}
                  onChangeText={set('fullName')}
                  placeholder={t('auth.fullName')}
                  isFocused={focusedField === 'fullName'}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                />
                <Field
                  icon={Mail}
                  value={form.email}
                  onChangeText={set('email')}
                  placeholder={t('auth.email')}
                  keyType="email-address"
                  isFocused={focusedField === 'email'}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
                <Field
                  icon={Lock}
                  value={form.password}
                  onChangeText={set('password')}
                  placeholder={t('auth.password')}
                  secureEntry
                  isFocused={focusedField === 'password'}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <Field
                  icon={Lock}
                  value={form.confirmPassword}
                  onChangeText={set('confirmPassword')}
                  placeholder={t('auth.confirmPassword')}
                  secureEntry
                  isFocused={focusedField === 'confirmPassword'}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                />

                {/* Terms Checkbox */}
                <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.75}>
                  <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                    {agreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={styles.checkboxText}>
                    {t('auth.agreeToTerms')} <Text style={styles.linkText}>{t('auth.termsAndConditions')}</Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.registerBtn, loading && { opacity: 0.6 }]}
                  onPress={handleRegister} disabled={loading} activeOpacity={0.88}
                >
                  <Text style={styles.registerBtnText}>{loading ? t('auth.signingUp') : t('auth.signUp')}</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={[styles.googleBtn, googleLoading && { opacity: 0.6 }]}
                  onPress={handleGoogleSignIn}
                  disabled={googleLoading}
                  activeOpacity={0.88}
                >
                  <GoogleIcon size={20} />
                  <Text style={styles.googleBtnText}>
                    {googleLoading ? t('auth.openingGoogle') : t('auth.continueWithGoogle')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>{t('auth.alreadyHaveAccount')} </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login', { returnTo })}>
                    <Text style={styles.loginLink}>{t('auth.signIn')}</Text>
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
    color: '#0F172A',
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollDesktop: {
    paddingVertical: 40,
  },
  authCardWrapper: {
    width: '100%',
    maxWidth: 460,
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
    width: 920,
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
    width: 460,
    padding: 36,
    justifyContent: 'center',
  },

  header: { alignItems: 'center', marginBottom: 24 },
  logoWrap: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  errorBanner: {
    backgroundColor: '#FEE2E2', borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  errorText: { color: '#EA4335', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  form: { gap: 16 },
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
    borderColor: '#4285F4',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: { boxShadow: '0px 0px 0px 4px rgba(66, 133, 244, 0.12)' },
    }),
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
    ...Platform.select({
      web: { outlineStyle: 'none' },
    }),
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 6 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#CBD5E1',
    marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  checkboxText: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  linkText: { color: '#4285F4', fontWeight: '700' },
  registerBtn: {
    backgroundColor: '#4285F4',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '0px 4px 14px rgba(66, 133, 244, 0.35)', cursor: 'pointer' },
      default: SHADOWS.md,
    }),
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF', gap: 12,
    ...Platform.select({
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' },
      default: SHADOWS.sm,
    }),
  },
  googleBtnText: { color: '#0F172A', fontSize: 15, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  footerText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  loginLink: { color: '#4285F4', fontSize: 14, fontWeight: '700' },
});


