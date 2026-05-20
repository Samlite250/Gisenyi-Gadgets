import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '../components/BlurView';
import { Mail, Lock, User, Check } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

const GoogleIcon = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </Svg>
);

// Move Field component outside to prevent focus loss on re-render
const Field = ({ icon: Icon, value, onChangeText, onFocus, onBlur, isFocused, placeholder, secureEntry, keyType }) => (
  <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
    <Icon size={20} color="#9AA0A6" style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#9AA0A6"
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

export default function RegisterScreen({ navigation }) {
  const { signUp, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const set = (key) => (val) => { setForm((f) => ({ ...f, [key]: val })); setError(''); };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const validate = () => {
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!agreed) return 'You must agree to the Terms & Conditions.';
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

      Alert.alert(
        'Account Created!',
        'Your account has been created. Please sign in to continue.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }],
        { cancelable: false }
      );
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 100, height: 100 }} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>
          </View>

          {error ? (
            <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>
          ) : null}

          {/* Glass Form Card */}
          <BlurView intensity={70} tint="light" style={styles.formCard}>
            <View style={styles.form}>
            <Field 
              icon={User} 
              value={form.fullName} 
              onChangeText={set('fullName')} 
              placeholder="Full Name" 
              isFocused={focusedField === 'fullName'}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
            />
            <Field 
              icon={Mail} 
              value={form.email} 
              onChangeText={set('email')} 
              placeholder="Email" 
              keyType="email-address" 
              isFocused={focusedField === 'email'}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            <Field 
              icon={Lock} 
              value={form.password} 
              onChangeText={set('password')} 
              placeholder="Password" 
              secureEntry 
              isFocused={focusedField === 'password'}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <Field 
              icon={Lock} 
              value={form.confirmPassword} 
              onChangeText={set('confirmPassword')} 
              placeholder="Confirm Password" 
              secureEntry 
              isFocused={focusedField === 'confirmPassword'}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
            />

            {/* Terms Checkbox */}
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.linkText}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.6 }]}
              onPress={handleRegister} disabled={loading} activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleBtn, googleLoading && { opacity: 0.6 }]}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
              activeOpacity={0.85}
            >
              <GoogleIcon size={20} />
              <Text style={styles.googleBtnText}>
                {googleLoading ? 'Opening Google...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
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
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 40, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  logoWrap: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#202124', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#5F6368' },
  errorBanner: {
    backgroundColor: '#FEE2E2', borderRadius: 8,
    padding: 12, marginBottom: 20,
  },
  errorText: { color: '#EA4335', fontSize: 13, textAlign: 'center' },
  formCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  form: { gap: 16 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 8,
    paddingHorizontal: 16, height: 52,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  inputWrapFocused: {
    borderBottomColor: '#4285F4',
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    color: '#202124',
    fontSize: 15,
    outlineStyle: 'none', // Remove web focus ring
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#9AA0A6',
    marginRight: 10, justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#4285F4', borderColor: '#4285F4' },
  checkboxText: { color: '#5F6368', fontSize: 13 },
  linkText: { color: '#4285F4' },
  registerBtn: {
    backgroundColor: '#4285F4', borderRadius: 8,
    height: 52, justifyContent: 'center', alignItems: 'center',
    marginTop: 8,
  },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dividerText: { color: '#5F6368', fontSize: 12 },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#FFFFFF', gap: 12,
  },
  googleBtnText: { color: '#202124', fontSize: 15, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: '#5F6368', fontSize: 14 },
  loginLink: { color: '#4285F4', fontSize: 14, fontWeight: '600' },
});
