import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, useWindowDimensions,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { BlurView } from './BlurView';
import * as ImagePicker from 'expo-image-picker';
import {
  X, Upload, User, Phone, CircleCheckBig,
  Smartphone, ShieldCheck, Copy, CheckCheck,
} from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { COLORS } from '../constants/theme';

export default function ManualPaymentModal({
  visible, provider, orderId, orderNumber, amount, onSuccess, onClose,
}) {
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState('instructions'); // instructions | upload | review | success
  const [names, setNames] = useState('');
  const [phone, setPhone] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [sellerInfo, setSellerInfo] = useState({ number: '', name: '' });

  const isMtn = provider === 'mtn';
  const providerColor = isMtn ? '#FBC400' : '#E8002D';
  const providerBg = isMtn ? '#FFFBEB' : '#FFF1F2';
  const providerBorder = isMtn ? '#FDE68A' : '#FECDD3';
  const providerName = isMtn ? 'MTN MoMo' : 'Airtel Money';
  const formattedAmount = `RWF ${Number(amount).toLocaleString()}`;

  useEffect(() => {
    if (!visible) {
      setPhase('instructions');
      setNames('');
      setPhone('');
      setScreenshot(null);
      setError('');
      return;
    }
    const numberKey = isMtn ? 'mtnNumber' : 'airtelNumber';
    const nameKey = isMtn ? 'mtnAccountName' : 'airtelAccountName';
    supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [numberKey, nameKey])
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(r => { map[r.key] = r.value; });
        setSellerInfo({ number: map[numberKey] || '', name: map[nameKey] || '' });
      });
  }, [visible, provider]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setScreenshot(result.assets[0]);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!names.trim()) { setError('Enter your full name.'); return; }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 9) { setError('Enter a valid phone number.'); return; }
    if (!screenshot) { setError('Upload your payment screenshot.'); return; }

    setUploading(true);
    setError('');
    try {
      // Upload screenshot to Supabase storage
      const ext = screenshot.uri.split('.').pop() || 'jpg';
      const fileName = `${orderId}-${Date.now()}.${ext}`;

      const response = await fetch(screenshot.uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, arrayBuffer, { contentType: `image/${ext}`, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      // Update order with manual payment details
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_type: 'manual',
          payment_status: 'unpaid',
          manual_payment_screenshot: publicUrl,
          manual_payment_phone: phone.trim(),
          manual_payment_names: names.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      setPhase('success');
      setTimeout(() => onSuccess(), 2500);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={phase !== 'uploading' ? onClose : undefined}>
      <View style={styles.overlay}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { width: Math.min(width, 440), maxHeight: height * 0.93 }]}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.providerChip, { backgroundColor: providerBg, borderColor: providerBorder }]}>
                <Smartphone size={14} color={providerColor} />
                <Text style={[styles.providerChipText, { color: providerColor }]}>{providerName}</Text>
                <Text style={styles.manualBadge}>Manual</Text>
              </View>
              {phase !== 'uploading' && (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Amount */}
            <View style={styles.amountHero}>
              <Text style={styles.amountLabel}>Total to Pay</Text>
              <Text style={[styles.amountValue, { color: providerColor }]}>{formattedAmount}</Text>
            </View>

            {/* ── Step 1: Instructions ── */}
            {phase === 'instructions' && (
              <View style={styles.body}>
                {/* Seller Card */}
                <View style={[styles.sellerCard, { borderColor: providerBorder, backgroundColor: providerBg }]}>
                  <View style={styles.sellerCardHeader}>
                    <ShieldCheck size={13} color={providerColor} />
                    <Text style={[styles.sellerCardTitle, { color: providerColor }]}>Send payment to this account</Text>
                  </View>
                  <View style={styles.sellerRow}>
                    <View style={[styles.sellerAvatar, { backgroundColor: providerColor + '25' }]}>
                      <User size={18} color={providerColor} />
                    </View>
                    <View style={styles.sellerDetails}>
                      <Text style={styles.sellerName}>{sellerInfo.name || 'Gisenyi Gadgets'}</Text>
                      <View style={styles.sellerNumberRow}>
                        <Phone size={12} color={COLORS.textMuted} />
                        <Text style={styles.sellerNumber}>{sellerInfo.number || '—'}</Text>
                      </View>
                    </View>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                </View>

                {/* Steps */}
                <View style={styles.stepCard}>
                  <Text style={styles.stepCardTitle}>How to pay manually</Text>
                  {[
                    `Open your ${providerName} app or dial *182#`,
                    `Send exactly ${formattedAmount} to ${sellerInfo.number || 'seller number above'}`,
                    'Take a screenshot of the confirmation message',
                    'Come back here and tap "I have paid"',
                    'Admin will verify and confirm your order',
                  ].map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <View style={[styles.stepNum, { backgroundColor: providerColor }]}>
                        <Text style={styles.stepNumText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: providerColor }]}
                  onPress={() => setPhase('upload')}
                  activeOpacity={0.82}
                >
                  <Text style={styles.btnText}>I Have Paid — Upload Proof</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Step 2: Upload Proof ── */}
            {phase === 'upload' && (
              <View style={styles.body}>
                <Text style={styles.sectionLabel}>Your Full Name</Text>
                <View style={[styles.inputWrap, error && !names.trim() && styles.inputError]}>
                  <User size={16} color={COLORS.textMuted} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Jean Pierre Habimana"
                    placeholderTextColor="#9AA0A6"
                    value={names}
                    onChangeText={t => { setNames(t); setError(''); }}
                  />
                </View>

                <Text style={styles.sectionLabel}>Your {providerName} Number</Text>
                <View style={[styles.inputWrap, error && !phone.trim() && styles.inputError]}>
                  <Text style={styles.prefix}>+250</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={isMtn ? '78XXXXXXX' : '73XXXXXXX'}
                    placeholderTextColor="#9AA0A6"
                    value={phone}
                    onChangeText={t => { setPhone(t); setError(''); }}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                </View>

                <Text style={styles.sectionLabel}>Payment Screenshot</Text>
                <TouchableOpacity
                  style={[styles.uploadBox, screenshot && styles.uploadBoxFilled, error && !screenshot && styles.uploadBoxError]}
                  onPress={pickImage}
                  activeOpacity={0.8}
                >
                  {screenshot ? (
                    <>
                      <Image source={{ uri: screenshot.uri }} style={styles.previewImg} />
                      <View style={styles.changeOverlay}>
                        <Text style={styles.changeText}>Tap to change</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Upload size={28} color={COLORS.textMuted} />
                      <Text style={styles.uploadText}>Tap to upload screenshot</Text>
                      <Text style={styles.uploadHint}>JPG or PNG from your gallery</Text>
                    </>
                  )}
                </TouchableOpacity>

                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : null}

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: providerColor }, uploading && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={uploading}
                  activeOpacity={0.82}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.btnText}>Submit for Review</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setPhase('instructions')} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>← Back</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Success ── */}
            {phase === 'success' && (
              <View style={styles.body}>
                <View style={styles.outcomeCenter}>
                  <View style={styles.successRing}>
                    <CircleCheckBig size={52} color="#16A34A" />
                  </View>
                  <Text style={styles.successTitle}>Submitted!</Text>
                  <Text style={styles.outcomeHint}>
                    Your payment proof has been sent to the admin for review.{'\n'}
                    Your order will be confirmed once verified — usually within 1–2 hours.
                  </Text>
                  <View style={[styles.summaryPill, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Text style={[styles.summaryPillText, { color: '#16A34A' }]}>Order #{orderNumber} — Awaiting verification</Text>
                  </View>
                </View>
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  providerChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5 },
  providerChipText: { fontSize: 13, fontWeight: '700' },
  manualBadge: { fontSize: 10, fontWeight: '700', color: '#6B7280', backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  amountHero: { alignItems: 'center', marginBottom: 18 },
  amountLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, marginBottom: 4 },
  amountValue: { fontSize: 34, fontWeight: '900', letterSpacing: -1.5 },
  body: { gap: 14 },
  sellerCard: { borderWidth: 1.5, borderRadius: 16, padding: 14 },
  sellerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sellerCardTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sellerDetails: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  sellerNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerNumber: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#F0FDF4' },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  stepCard: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 12 },
  stepCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  stepText: { fontSize: 13, color: COLORS.textSecondary, flex: 1, lineHeight: 19 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, paddingHorizontal: 14, height: 52, gap: 10 },
  inputError: { borderColor: '#EA4335' },
  prefix: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '700' },
  input: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  uploadBox: { borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', borderRadius: 16, height: 160, justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFC', overflow: 'hidden' },
  uploadBoxFilled: { borderStyle: 'solid', borderColor: '#16A34A' },
  uploadBoxError: { borderColor: '#EA4335' },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  changeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  changeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  uploadText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  uploadHint: { fontSize: 12, color: COLORS.textMuted },
  errorText: { fontSize: 12, color: '#EA4335', fontWeight: '500' },
  btn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  cancelBtn: { alignItems: 'center', paddingVertical: 6 },
  cancelText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
  outcomeCenter: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  successRing: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#16A34A', letterSpacing: -0.5 },
  outcomeHint: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  summaryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  summaryPillText: { fontSize: 13, fontWeight: '700' },
});
