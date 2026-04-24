import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, User, Check } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

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
  const { signUp } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const set = (key) => (val) => { setForm((f) => ({ ...f, [key]: val })); setError(''); };

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
      const { data } = await signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
      });

      if (!data.session) {
        Alert.alert(
          'Check your email! 📧',
          'We sent a verification link to your email. Please verify to login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
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
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: '#5F6368', fontSize: 14 },
  loginLink: { color: '#4285F4', fontSize: 14, fontWeight: '600' },
});
