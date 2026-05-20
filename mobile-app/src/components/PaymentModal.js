import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ActivityIndicator, Animated, Easing,
  ScrollView, useWindowDimensions, Platform,
} from 'react-native';
import { BlurView } from './BlurView';
import { CircleCheckBig, X, Smartphone, AlertCircle, User, Phone, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { COLORS } from '../constants/theme';

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = 120000;

export default function PaymentModal({ visible, provider, orderId, amount, onSuccess, onClose }) {
  const { width, height } = useWindowDimensions();
  const [phase, setPhase] = useState('input');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sellerInfo, setSellerInfo] = useState({ number: '', name: '' });
  const [loadingInfo, setLoadingInfo] = useState(true);
  const pollRef = useRef(null);
  const timeoutRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const isMtn = provider === 'mtn';
  const providerColor = isMtn ? '#FBC400' : '#E8002D';
  const providerBg = isMtn ? '#FFFBEB' : '#FFF1F2';
  const providerBorder = isMtn ? '#FDE68A' : '#FECDD3';
  const providerName = isMtn ? 'MTN MoMo' : 'Airtel Money';
  const providerHint = isMtn ? '078XXXXXXX' : '073XXXXXXX';

  useEffect(() => {
    if (!visible) {
      clearInterval(pollRef.current);
      clearTimeout(timeoutRef.current);
      setPhase('input');
      setPhone('');
      setError('');
      setMessage('');
      successAnim.setValue(0);
      pulseAnim.setValue(1);
      return;
    }
    // Fetch seller payment info on open
    setLoadingInfo(true);
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
      })
      .finally(() => setLoadingInfo(false));
  }, [visible, provider]);

  useEffect(() => {
    if (phase === 'processing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 750, useNativeDriver: Platform.OS !== 'web', easing: Easing.inOut(Easing.ease) }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: Platform.OS !== 'web', easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    } else if (phase === 'success') {
      pulseAnim.setValue(1);
      Animated.spring(successAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', tension: 60, friction: 8 }).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  const startPolling = (reference) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: { reference },
        });

        if (error) return; // network hiccup — keep polling

        if (data?.status === 'paid') {
          clearInterval(pollRef.current);
          clearTimeout(timeoutRef.current);
          setPhase('success');
          setTimeout(() => onSuccess(), 2200);
        } else if (data?.status === 'failed') {
          clearInterval(pollRef.current);
          clearTimeout(timeoutRef.current);
          setPhase('failed');
          setError('Payment was declined or failed. Please try again.');
        }
        // status === 'pending' → keep polling
      } catch (_) {
        // keep polling on any error
      }
    }, POLL_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      clearInterval(pollRef.current);
      if (phase !== 'success') {
        setPhase('failed');
        setError('Payment timed out. If you approved the prompt, please contact support.');
      }
    }, POLL_TIMEOUT);
  };

  const handlePay = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) {
      setError('Enter a valid phone number.');
      return;
    }
    setError('');
    setPhase('processing');
    setMessage(`Sending request to ${providerName}...`);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('initiate-payment', {
        body: { order_id: orderId, phone: cleaned, provider },
      });

      if (fnError || data?.error) {
        throw new Error(fnError?.message || data?.error || 'Payment initiation failed');
      }

      setMessage(data.message || 'Check your phone and approve the payment prompt.');
      startPolling(data.reference);
    } catch (err) {
      setPhase('failed');
      setError(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const formattedAmount = `RWF ${Number(amount).toLocaleString()}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={phase !== 'processing' ? onClose : undefined}>
      <View style={styles.overlay}>
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, { width: Math.min(width, 440), maxHeight: height * 0.92 }]}>
          <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

            {/* Header Bar */}
            <View style={styles.header}>
              <View style={[styles.providerChip, { backgroundColor: providerBg, borderColor: providerBorder }]}>
                <Smartphone size={14} color={providerColor} />
                <Text style={[styles.providerChipText, { color: providerColor }]}>{providerName}</Text>
              </View>
              {phase !== 'processing' && (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Amount Hero */}
            <View style={styles.amountHero}>
              <Text style={styles.amountLabel}>Total to Pay</Text>
              <Text style={[styles.amountValue, { color: providerColor }]}>{formattedAmount}</Text>
            </View>

            {/* Seller Info Card — shown on input phase */}
            {(phase === 'input' || phase === 'processing') && (
              <View style={[styles.sellerCard, { borderColor: providerBorder, backgroundColor: providerBg }]}>
                <View style={styles.sellerCardHeader}>
                  <ShieldCheck size={14} color={providerColor} />
                  <Text style={[styles.sellerCardTitle, { color: providerColor }]}>Paying to verified seller</Text>
                </View>
                {loadingInfo ? (
                  <ActivityIndicator size="small" color={providerColor} style={{ marginTop: 8 }} />
                ) : (
                  <View style={styles.sellerRow}>
                    <View style={[styles.sellerAvatar, { backgroundColor: providerColor + '20' }]}>
                      <User size={18} color={providerColor} />
                    </View>
                    <View style={styles.sellerDetails}>
                      <Text style={styles.sellerName}>{sellerInfo.name || 'Gisenyi Gadgets'}</Text>
                      <View style={styles.sellerNumberRow}>
                        <Phone size={12} color={COLORS.textMuted} />
                        <Text style={styles.sellerNumber}>{sellerInfo.number || '—'}</Text>
                      </View>
                    </View>
                    <View style={[styles.verifiedBadge, { backgroundColor: '#16A34A' + '18' }]}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── Input Phase ── */}
            {phase === 'input' && (
              <View style={styles.body}>
                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>Your {providerName} Number</Text>
                <View style={[styles.inputWrap, error && styles.inputError]}>
                  <View style={styles.prefixWrap}>
                    <Text style={styles.prefix}>+250</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder={providerHint}
                    placeholderTextColor="#9AA0A6"
                    value={phone}
                    onChangeText={(t) => { setPhone(t); setError(''); }}
                    keyboardType="phone-pad"
                    maxLength={13}
                  />
                </View>
                {error ? (
                  <View style={styles.errorRow}>
                    <AlertCircle size={13} color="#EA4335" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}
                <Text style={styles.hint}>
                  You'll receive a push notification on your phone. Approve it to complete your order.
                </Text>
                <TouchableOpacity
                  style={[styles.payBtn, { backgroundColor: providerColor }, loadingInfo && styles.payBtnDisabled]}
                  onPress={handlePay}
                  disabled={loadingInfo}
                  activeOpacity={0.82}
                >
                  <Text style={styles.payBtnText}>Pay {formattedAmount}</Text>
                </TouchableOpacity>
                <Text style={styles.secureNote}>🔒 Secured by MTN / Airtel API</Text>
              </View>
            )}

            {/* ── Processing Phase ── */}
            {phase === 'processing' && (
              <View style={styles.body}>
                <View style={styles.divider} />
                <View style={styles.processingCenter}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <View style={[styles.spinnerRing, { borderColor: providerColor }]}>
                      <ActivityIndicator size="large" color={providerColor} />
                    </View>
                  </Animated.View>
                  <Text style={styles.processingTitle}>{message}</Text>
                  <Text style={styles.processingHint}>Keep this screen open. Do not close the app.</Text>
                  <View style={styles.stepList}>
                    {['Payment request sent', 'Waiting for your approval', 'Confirming transaction'].map((step, i) => (
                      <View key={i} style={styles.stepItem}>
                        <View style={[styles.stepDot, { backgroundColor: i === 1 ? providerColor : '#E5E7EB' }]} />
                        <Text style={[styles.stepText, i === 1 && { color: COLORS.textPrimary, fontWeight: '600' }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* ── Success Phase ── */}
            {phase === 'success' && (
              <View style={styles.body}>
                <View style={styles.divider} />
                <View style={styles.outcomeCenter}>
                  <Animated.View style={{ transform: [{ scale: successAnim }], opacity: successAnim }}>
                    <View style={styles.successRing}>
                      <CircleCheckBig size={52} color="#16A34A" />
                    </View>
                  </Animated.View>
                  <Text style={styles.successTitle}>Payment Confirmed!</Text>
                  <Text style={styles.outcomeHint}>Your order has been placed successfully.</Text>
                  <View style={[styles.summaryPill, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                    <Text style={[styles.summaryPillText, { color: '#16A34A' }]}>{formattedAmount} paid via {providerName}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Failed Phase ── */}
            {phase === 'failed' && (
              <View style={styles.body}>
                <View style={styles.divider} />
                <View style={styles.outcomeCenter}>
                  <View style={styles.failedRing}>
                    <AlertCircle size={52} color="#EA4335" />
                  </View>
                  <Text style={styles.failedTitle}>Payment Failed</Text>
                  <Text style={styles.outcomeHint}>{error}</Text>
                  <TouchableOpacity
                    style={[styles.payBtn, { backgroundColor: providerColor, marginTop: 8 }]}
                    onPress={() => { setPhase('input'); setError(''); }}
                    activeOpacity={0.82}
                  >
                    <Text style={styles.payBtnText}>Try Again</Text>
                  </TouchableOpacity>
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  providerChipText: { fontSize: 13, fontWeight: '700' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountHero: { alignItems: 'center', marginBottom: 20 },
  amountLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted, marginBottom: 4 },
  amountValue: { fontSize: 34, fontWeight: '900', letterSpacing: -1.5 },
  sellerCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
  },
  sellerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sellerCardTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerDetails: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  sellerNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerNumber: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  verifiedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  body: { gap: 14 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 6 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    overflow: 'hidden',
    height: 54,
  },
  inputError: { borderColor: '#EA4335' },
  prefixWrap: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  prefix: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '700' },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary, fontWeight: '500', paddingHorizontal: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  errorText: { fontSize: 12, color: '#EA4335', fontWeight: '500' },
  hint: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  payBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  secureNote: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  processingCenter: { alignItems: 'center', gap: 14, paddingVertical: 12 },
  spinnerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
  },
  processingHint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  stepList: { alignSelf: 'stretch', gap: 10, paddingHorizontal: 8 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepText: { fontSize: 13, color: COLORS.textMuted },
  outcomeCenter: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  successRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#16A34A', letterSpacing: -0.5 },
  failedRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  failedTitle: { fontSize: 22, fontWeight: '900', color: '#EA4335', letterSpacing: -0.5 },
  outcomeHint: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 19 },
  summaryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  summaryPillText: { fontSize: 13, fontWeight: '700' },
});
