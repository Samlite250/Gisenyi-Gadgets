import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function RegisterScreen({ navigation }) {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (val) => { setForm((f) => ({ ...f, [key]: val })); setError(''); };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      Alert.alert(
        'Account Created! 🎉',
        'Please check your email to verify your account, then sign in.',
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ icon: Icon, label, field, placeholder, secureEntry, keyType, extra }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <Icon size={18} color={COLORS.textSecondary} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={form[field]}
          onChangeText={set(field)}
          secureTextEntry={secureEntry && !showPw}
          keyboardType={keyType || 'default'}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
          autoCorrect={false}
        />
        {extra}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Gisenyi Gadgets and start shopping</Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Field icon={User} label="Full Name" field="fullName" placeholder="Samuel Niyomugabo" />
            <Field icon={Phone} label="Phone (optional)" field="phone" placeholder="+250 788 000 000" keyType="phone-pad" />
            <Field icon={Mail} label="Email Address" field="email" placeholder="you@example.com" keyType="email-address" />
            <Field
              icon={Lock} label="Password" field="password"
              placeholder="Min. 6 characters" secureEntry
              extra={
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={18} color={COLORS.textSecondary} /> : <Eye size={18} color={COLORS.textSecondary} />}
                </TouchableOpacity>
              }
            />
            <Field icon={Lock} label="Confirm Password" field="confirmPassword" placeholder="Repeat password" secureEntry />

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister} disabled={loading} activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
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
  scroll: { flexGrow: 1, padding: SIZES.lg, paddingBottom: SIZES.xl },
  backBtn: {
    width: 44, height: 44, backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  title: { fontSize: SIZES.fontXxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SIZES.xs },
  subtitle: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SIZES.lg },
  errorBanner: {
    backgroundColor: `${COLORS.error}15`, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, marginBottom: SIZES.md,
    borderWidth: 1, borderColor: `${COLORS.error}30`,
  },
  errorText: { color: COLORS.error, fontSize: SIZES.fontSm, fontWeight: '500', textAlign: 'center' },
  form: { gap: SIZES.sm },
  inputGroup: { gap: SIZES.xs },
  label: { fontSize: SIZES.fontSm, fontWeight: '600', color: COLORS.textSecondary, marginLeft: 2 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SIZES.md, height: 54,
  },
  icon: { marginRight: SIZES.sm },
  input: { flex: 1, color: COLORS.textPrimary, fontSize: SIZES.fontMd },
  registerBtn: {
    backgroundColor: COLORS.primaryBlue, borderRadius: SIZES.radiusLg,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginTop: SIZES.xs, ...SHADOWS.md,
  },
  registerBtnText: { color: '#fff', fontSize: SIZES.fontMd, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: SIZES.sm },
  footerText: { color: COLORS.textSecondary, fontSize: SIZES.fontMd },
  loginLink: { color: COLORS.primaryBlue, fontSize: SIZES.fontMd, fontWeight: '700' },
});
