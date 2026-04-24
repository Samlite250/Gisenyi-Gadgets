import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ShoppingBag, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      // RootNavigator auto-redirects on auth state change — no manual navigation needed
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <ShoppingBag size={44} color={COLORS.primaryBlue} strokeWidth={1.5} />
            </View>
            <Text style={styles.brand}>Gisenyi Gadgets</Text>
            <Text style={styles.title}>Welcome Back! 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue shopping</Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Lock size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <EyeOff size={18} color={COLORS.textSecondary} />
                    : <Eye size={18} color={COLORS.textSecondary} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  scrollContent: { flexGrow: 1, padding: SIZES.lg, paddingBottom: SIZES.xl },
  header: { alignItems: 'center', marginTop: SIZES.xl, marginBottom: SIZES.xl },
  logoWrap: {
    width: 80, height: 80,
    backgroundColor: `${COLORS.primaryBlue}18`,
    borderRadius: SIZES.radiusXl,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 1, borderColor: `${COLORS.primaryBlue}30`,
  },
  brand: { fontSize: SIZES.fontLg, fontWeight: '700', color: COLORS.primaryBlue, marginBottom: SIZES.xs },
  title: { fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SIZES.xs },
  subtitle: { fontSize: SIZES.fontMd, color: COLORS.textSecondary },
  errorBanner: {
    backgroundColor: `${COLORS.error}15`,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1, borderColor: `${COLORS.error}30`,
  },
  errorText: { color: COLORS.error, fontSize: SIZES.fontSm, fontWeight: '500', textAlign: 'center' },
  form: { gap: SIZES.md },
  inputGroup: { gap: SIZES.xs },
  label: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.textSecondary, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.md, height: 54,
  },
  inputIcon: { marginRight: SIZES.sm },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: SIZES.fontMd },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { color: COLORS.primaryBlue, fontSize: SIZES.fontSm, fontWeight: '600' },
  loginBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusLg,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginTop: SIZES.xs, ...SHADOWS.md,
  },
  btnDisabled: { opacity: 0.6 },
  loginBtnText: { color: COLORS.textPrimary, fontSize: SIZES.fontMd, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textSecondary, fontSize: SIZES.fontSm },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: SIZES.sm },
  footerText: { color: COLORS.textSecondary, fontSize: SIZES.fontMd },
  registerText: { color: COLORS.primaryBlue, fontSize: SIZES.fontMd, fontWeight: '700' },
});
