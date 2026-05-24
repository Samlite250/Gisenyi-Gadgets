import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image
} from 'react-native';
import { BlurView } from '../components/BlurView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES } from '../constants/theme';


export default function LoginScreen({ navigation, route }) {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const successMessage = route?.params?.message || null;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t('errors.invalidInput'));
      return;
    }
    setLoading(true);
    setError('');
    setFocusedField(null); // Clear focus on submit
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/logo.png')}
                style={{ width: 100, height: 100 }}
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

          {/* Glass Form Card */}
          <BlurView intensity={70} tint="light" style={styles.formCard}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <View style={[styles.inputWrap, focusedField === 'email' && styles.inputWrapFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.email')}
                    placeholderTextColor={COLORS.textMuted}
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
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.password')}
                    placeholderTextColor={COLORS.textMuted}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setError(''); }}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                    {showPassword ? <EyeOff size={18} color={COLORS.textSecondary} /> : <Eye size={18} color={COLORS.textSecondary} />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.btnDisabled]}
                onPress={handleLogin} disabled={loading}
              >
                <Text style={styles.loginBtnText}>{loading ? t('common.loading') : t('auth.login')}</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('auth.dontHaveAccount')} </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerText}>{t('auth.signUp')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
  logoWrap: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary },
  successBanner: { backgroundColor: '#D1FAE5', padding: 12, borderRadius: 8, marginBottom: 12 },
  successText: { color: '#065F46', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  errorBanner: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: COLORS.error, fontSize: 13, textAlign: 'center' },
  formCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 8,
    paddingHorizontal: 16, height: 52,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  inputWrapFocused: {
    borderBottomColor: COLORS.primaryBlue,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    outlineStyle: 'none', // Remove web focus ring
  },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: COLORS.textSecondary, fontSize: 12 },
  loginBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: 8,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: COLORS.textSecondary, fontSize: 14 },
  registerText: { color: COLORS.primaryBlue, fontSize: 14, fontWeight: '600' },
});
