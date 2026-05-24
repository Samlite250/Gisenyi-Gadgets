import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Platform,
  TextInput, Image, ActivityIndicator, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft, MapPin, Smartphone, Banknote, CircleCheckBig,
  Landmark, Bitcoin, Zap, Upload, User, Copy, Check,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { orderLogger } from '../utils/logger';
import PaymentModal from '../components/PaymentModal';

const getPaymentMethods = (t) => [
  { id: 'mtn',    name: t('checkout.mtnMomo'),         icon: Smartphone, color: '#FBC400', bg: '#FFFBEB', border: '#FDE68A',  description: t('checkout.payViaMtn') },
  { id: 'airtel', name: t('checkout.airtelMoney'),     icon: Smartphone, color: '#E8002D', bg: '#FFF1F2', border: '#FECDD3',  description: t('checkout.payViaAirtel') },
  { id: 'bank',   name: t('checkout.bankTransfer'),    icon: Landmark,   color: '#0EA5E9', bg: '#F0F9FF', border: '#BFDBFE',  description: t('checkout.bankTransferDesc') },
  { id: 'crypto', name: t('checkout.crypto'),          icon: Bitcoin,    color: '#F7931A', bg: '#FFF7ED', border: '#FED7AA',  description: t('checkout.cryptoDesc') },
  { id: 'cash',   name: t('checkout.cashOnDelivery'),  icon: Banknote,   color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',  description: t('checkout.cashOnDeliveryDesc') },
];

const MOMO_PROVIDERS = ['mtn', 'airtel'];

// ─── Recipient card styles ────────────────────────────────────────────────────
const rcStyles = StyleSheet.create({
  card:         { borderWidth: 1.5, borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff' },
  accent:       { height: 3 },
  body:         { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, paddingVertical: 14 },
  avatar:       { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 19, fontWeight: '900' },
  info:         { flex: 1, gap: 6 },
  sendLabel:    { fontSize: 10, fontWeight: '700', color: '#9AA0A6', textTransform: 'uppercase', letterSpacing: 0.6 },
  recipientName:{ fontSize: 15, fontWeight: '800', color: '#0F172A' },
  dataRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dataValue:    { fontSize: 14, fontWeight: '700' },
  copyCircle:   { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
});

// ─── Recipient card ───────────────────────────────────────────────────────────
function RecipientCard({ color, bg, border, name, number, amount, onCopyNumber, onCopyAmount, copyKey, copied, copiedAmount, t }) {
  const numCopied = copied === copyKey;
  return (
    <View style={[rcStyles.card, { borderColor: border }]}>
      <View style={[rcStyles.accent, { backgroundColor: color }]} />
      <View style={rcStyles.body}>
        {/* Avatar */}
        <View style={[rcStyles.avatar, { backgroundColor: color + '22' }]}>
          <Text style={[rcStyles.avatarLetter, { color }]}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        {/* Info column */}
        <View style={rcStyles.info}>
          <Text style={rcStyles.sendLabel}>{t('checkout.sendTo')}</Text>
          <Text style={rcStyles.recipientName}>{name}</Text>

          {/* Phone number row */}
          <View style={rcStyles.dataRow}>
            <Text style={[rcStyles.dataValue, { color }]}>{number}</Text>
            <TouchableOpacity
              style={[rcStyles.copyCircle, { backgroundColor: numCopied ? '#F0FDF4' : bg, borderColor: numCopied ? '#BBF7D0' : border }]}
              onPress={onCopyNumber}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              {numCopied
                ? <Check size={13} color="#16A34A" />
                : <Copy size={13} color={color} />}
            </TouchableOpacity>
          </View>

          {/* Amount row — only in manual mode */}
          {amount && (
            <View style={[rcStyles.dataRow, { marginTop: 2 }]}>
              <Text style={[rcStyles.dataValue, { color, fontSize: 15, fontWeight: '900' }]}>{amount}</Text>
              <TouchableOpacity
                style={[rcStyles.copyCircle, { backgroundColor: copiedAmount ? '#F0FDF4' : bg, borderColor: copiedAmount ? '#BBF7D0' : border }]}
                onPress={onCopyAmount}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                {copiedAmount
                  ? <Check size={13} color="#16A34A" />
                  : <Copy size={13} color={color} />}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function CheckoutScreen({ navigation }) {
  const { user, profile } = useAuth();
  const { cartItems, subtotal, shippingFee, total, promoDiscount, activePromo, clearCart } = useCart();
  const { t } = useLanguage();

  const [selectedPayment, setSelectedPayment] = useState('mtn');
  const [paymentMode, setPaymentMode]         = useState('automatic'); // 'automatic' | 'manual'
  const [placing, setPlacing]                 = useState(false);
  const [settings, setSettings]               = useState({});

  // Automatic-mode Paypack modal
  const [pendingOrderId, setPendingOrderId]       = useState(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState(null);
  const [showPaymentModal, setShowPaymentModal]   = useState(false);

  // Manual-mode inline form
  const [payerName, setPayerName]         = useState('');
  const [payerPhone, setPayerPhone]       = useState('');
  const [screenshot, setScreenshot]       = useState(null);
  const [formError, setFormError]         = useState('');

  // Copy feedback: tracks which key was just copied ('number' | 'amount' | null)
  const [copied, setCopied] = useState(null);
  const copyToClipboard = (value, key) => {
    Clipboard.setString(String(value));
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  React.useEffect(() => {
    supabase.from('platform_settings').select('*').then(({ data }) => {
      if (!data) return;
      const s = {};
      data.forEach(r => { s[r.key] = r.value; });
      setSettings(s);
    });
  }, []);

  // Clear manual form when user switches method or mode
  React.useEffect(() => {
    setPayerName('');
    setPayerPhone('');
    setScreenshot(null);
    setFormError('');
  }, [selectedPayment, paymentMode]);

  const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;

  const displayName    = profile?.full_name || user?.user_metadata?.full_name || t('checkout.customer');
  const displayPhone   = profile?.phone || '—';
  const displayAddress = profile?.address
    ? `${profile.address}, ${profile.city || 'Gisenyi'}`
    : t('checkout.noAddressSet');

  const toDbPayment = (id) => {
    if (id === 'cash') return 'cash';
    if (MOMO_PROVIDERS.includes(id)) return 'momo';
    return 'card';
  };

  const estimatedDelivery = () => {
    const d = new Date();
    d.setDate(d.getDate() + (selectedPayment === 'cash' ? 5 : 3));
    return d.toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // ─── Create base order ────────────────────────────────────────────────────
  const createOrder = async () => {
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        payment_method: toDbPayment(selectedPayment),
        payment_status: 'unpaid',
        subtotal, shipping_fee: shippingFee, total,
        notes: activePromo ? `Promo: ${activePromo} (-${fmt(promoDiscount)})` : null,
        shipping_address: { name: displayName, phone: displayPhone, address: displayAddress },
        estimated_delivery: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      })
      .select().single();

    if (error) throw error;

    const items = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.images?.[0] || null,
      price: item.price,
      quantity: item.quantity,
      selected_color: item.selectedColor || null,
      selected_storage: item.selectedStorage || null,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(items);
    if (itemsError) throw itemsError;

    return order;
  };

  // ─── Upload screenshot + attach to order ─────────────────────────────────
  const attachManualProof = async (orderId) => {
    // Use XHR so the browser sets the correct Content-Type on the blob response
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = reject;
      xhr.open('GET', screenshot.uri);
      xhr.send();
    });
    const mimeType = (blob.type && blob.type !== 'application/octet-stream')
      ? blob.type
      : (screenshot.mimeType || 'image/jpeg');
    const ext      = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const fileName = `proof-${orderId}-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('payment-screenshots')
      .upload(fileName, blob, { contentType: mimeType, upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_type: 'manual',
        payment_status: 'unpaid',
        manual_payment_screenshot: publicUrl,
        manual_payment_phone: payerPhone.trim(),
        manual_payment_names: payerName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (updateError) throw updateError;
  };

  // ─── Main CTA handler ─────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!cartItems.length) {
      Alert.alert(t('checkout.emptyCart'), t('checkout.addItemsFirst'));
      return;
    }

    // Validate manual form before touching the DB
    if (MOMO_PROVIDERS.includes(selectedPayment) && paymentMode === 'manual') {
      if (!payerName.trim())                                     { setFormError(t('checkout.enterMomoName')); return; }
      if (payerPhone.replace(/\D/g, '').length < 9)              { setFormError(t('checkout.enterPayerPhone')); return; }
      if (!screenshot)                                           { setFormError(t('checkout.uploadScreenshot')); return; }
    }

    setPlacing(true);
    setFormError('');
    try {
      const order = await createOrder();

      if (MOMO_PROVIDERS.includes(selectedPayment)) {
        if (paymentMode === 'automatic') {
          // Hand off to Paypack modal
          setPendingOrderId(order.id);
          setPendingOrderNumber(order.order_number);
          setShowPaymentModal(true);
        } else {
          // Upload proof atomically, then go straight to success
          await attachManualProof(order.id);
          navigation.replace('OrderSuccess', {
            orderId: order.order_number,
            estimatedDelivery: estimatedDelivery(),
            total,
          });
        }
      } else {
        navigation.replace('OrderSuccess', {
          orderId: order.order_number,
          estimatedDelivery: estimatedDelivery(),
          total,
        });
      }
    } catch (err) {
      orderLogger.error('Order placement failed', err);
      Alert.alert(t('checkout.error'), err.message || t('checkout.orderFailed'));
    } finally {
      setPlacing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    navigation.replace('OrderSuccess', {
      orderId: pendingOrderNumber,
      estimatedDelivery: estimatedDelivery(),
      total,
    });
  };

  const pickScreenshot = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('checkout.permissionNeeded'), t('checkout.allowPhotoAccess'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setScreenshot(result.assets[0]);
      setFormError('');
    }
  };

  // ─── Derived values for the active MoMo provider ─────────────────────────
  const activeMomo = PAYMENT_METHODS.find(m => m.id === selectedPayment);
  const momoAcctName   = selectedPayment === 'mtn'
    ? (settings.mtnAccountName   || 'Gisenyi Gadgets')
    : (settings.airtelAccountName || 'Gisenyi Gadgets');
  const momoAcctNumber = selectedPayment === 'mtn'
    ? (settings.mtnNumber   || '—')
    : (settings.airtelNumber || '—');
  const momoInstructions = selectedPayment === 'mtn'
    ? settings.mtnInstructions
    : settings.airtelInstructions;

  const isManualMomo = MOMO_PROVIDERS.includes(selectedPayment) && paymentMode === 'manual';
  const PAYMENT_METHODS = getPaymentMethods(t);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Delivery Address ── */}
        <Text style={styles.sectionTitle}>{t('checkout.deliveryAddress')}</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <MapPin size={18} color={COLORS.primaryBlue} />
            <Text style={styles.cardName}>{displayName}</Text>
            <TouchableOpacity><Text style={styles.changeText}>{t('checkout.change')}</Text></TouchableOpacity>
          </View>
          <Text style={styles.cardSub}>{displayAddress}</Text>
          <Text style={styles.cardSub}>{displayPhone}</Text>
        </View>

        {/* ── Payment Method ── */}
        <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
        <View style={styles.payList}>
          {PAYMENT_METHODS.map((m) => {
            const isActive = selectedPayment === m.id;
            const isMomo   = MOMO_PROVIDERS.includes(m.id);

            return (
              <View key={m.id} style={[styles.payCard, isActive && { borderColor: m.color }]}>

                {/* Row */}
                <TouchableOpacity
                  style={styles.payRow}
                  onPress={() => setSelectedPayment(m.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.payIcon, { backgroundColor: m.bg }]}>
                    <m.icon size={21} color={m.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payName, isActive && { color: m.color }]}>{m.name}</Text>
                    <Text style={styles.paySub}>{m.description}</Text>
                  </View>
                  <View style={[styles.radio, isActive && { borderColor: m.color }]}>
                    {isActive && <View style={[styles.radioDot, { backgroundColor: m.color }]} />}
                  </View>
                </TouchableOpacity>

                {/* Expanded panel */}
                {isActive && (
                  <View style={[styles.panel, { borderTopColor: m.border }]}>

                    {isMomo ? (
                      <>
                        {/* Mode toggle */}
                        <View style={styles.modeRow}>
                          {[
                            { key: 'automatic', label: t('checkout.automatic'), Icon: Zap },
                            { key: 'manual',    label: t('checkout.manual'),    Icon: Upload },
                          ].map(({ key, label, Icon }) => (
                            <TouchableOpacity
                              key={key}
                              style={[styles.modeBtn, paymentMode === key && { backgroundColor: m.color, borderColor: m.color }]}
                              onPress={() => setPaymentMode(key)}
                              activeOpacity={0.8}
                            >
                              <Icon size={13} color={paymentMode === key ? '#fff' : COLORS.textSecondary} />
                              <Text style={[styles.modeBtnText, paymentMode === key && { color: '#fff' }]}>{label}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <View style={styles.sep} />

                        {/* ── Automatic ── */}
                        {paymentMode === 'automatic' && (
                          <View style={styles.autoPanel}>
                            <RecipientCard
                              color={m.color} bg={m.bg} border={m.border}
                              name={momoAcctName} number={momoAcctNumber}
                              copyKey="auto-number" copied={copied}
                              onCopyNumber={() => copyToClipboard(momoAcctNumber, 'auto-number')}
                              t={t}
                            />
                            <View style={[styles.infoBox, { backgroundColor: m.bg, borderColor: m.border }]}>
                              <Text style={styles.infoBoxText}>
                                {t('checkout.automaticPaymentInfo', { paymentMethod: m.name })}
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* ── Manual ── */}
                        {paymentMode === 'manual' && (
                          <View style={styles.manualPanel}>

                            {/* Step 1 — where to pay */}
                            <View style={styles.stepHeader}>
                              <View style={[styles.stepBadge, { backgroundColor: m.color }]}>
                                <Text style={styles.stepBadgeText}>1</Text>
                              </View>
                              <Text style={styles.stepTitle}>{t('checkout.makePayment')}</Text>
                            </View>
                            <RecipientCard
                              color={m.color} bg={m.bg} border={m.border}
                              name={momoAcctName} number={momoAcctNumber}
                              amount={fmt(total)} rawAmount={total}
                              copyKey="manual-number" copied={copied}
                              onCopyNumber={() => copyToClipboard(momoAcctNumber, 'manual-number')}
                              onCopyAmount={() => copyToClipboard(total, 'amount')}
                              copiedAmount={copied === 'amount'}
                              t={t}
                            />
                            {momoInstructions ? (
                              <View style={[styles.stepsBox, { borderLeftColor: m.color }]}>
                                <Text style={styles.stepsText}>
                                  {momoInstructions.replace(/enter amount/gi, `Enter Amount: ${fmt(total)}`)}
                                </Text>
                              </View>
                            ) : null}

                            <View style={styles.sep} />

                            {/* Step 2 — fill form */}
                            <View style={styles.stepHeader}>
                              <View style={[styles.stepBadge, { backgroundColor: m.color }]}>
                                <Text style={styles.stepBadgeText}>2</Text>
                              </View>
                              <Text style={styles.stepTitle}>{t('checkout.confirmPayment')}</Text>
                            </View>

                            <View style={[styles.inputRow, formError && !payerName.trim() && styles.inputError]}>
                              <User size={15} color={COLORS.textMuted} />
                              <TextInput
                                style={styles.input}
                                placeholder={t('checkout.momoAccountName')}
                                placeholderTextColor="#9AA0A6"
                                value={payerName}
                                onChangeText={text => { setPayerName(text); setFormError(''); }}
                              />
                            </View>

                            <View style={[styles.inputRow, formError && payerPhone.replace(/\D/g,'').length < 9 && !payerPhone && styles.inputError]}>
                              <Text style={styles.prefix}>+250</Text>
                              <TextInput
                                style={styles.input}
                                placeholder={m.id === 'mtn' ? '78XXXXXXX' : '73XXXXXXX'}
                                placeholderTextColor="#9AA0A6"
                                value={payerPhone}
                                onChangeText={text => { setPayerPhone(text); setFormError(''); }}
                                keyboardType="phone-pad"
                                maxLength={13}
                              />
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.uploadBox,
                                screenshot        && styles.uploadBoxDone,
                                formError && !screenshot && styles.uploadBoxError,
                              ]}
                              onPress={pickScreenshot}
                              activeOpacity={0.8}
                            >
                              {screenshot ? (
                                <>
                                  <Image source={{ uri: screenshot.uri }} style={styles.previewImg} />
                                  <View style={styles.overlay}>
                                    <Text style={styles.overlayText}>{t('checkout.tapToChange')}</Text>
                                  </View>
                                </>
                              ) : (
                                <>
                                  <View style={[styles.uploadCircle, { backgroundColor: m.bg }]}>
                                    <Upload size={20} color={m.color} />
                                  </View>
                                  <Text style={styles.uploadLabel}>{t('checkout.uploadPaymentScreenshot')}</Text>
                                  <Text style={styles.uploadSub}>{t('checkout.pngOrJpg')}</Text>
                                </>
                              )}
                            </TouchableOpacity>

                            {formError ? (
                              <Text style={styles.errorText}>{formError}</Text>
                            ) : null}
                          </View>
                        )}
                      </>
                    ) : (
                      /* Non-MoMo instructions */
                      <Text style={styles.staticText}>
                        {m.id === 'bank'   ? (settings.bankInstructions   || t('checkout.bankNotConfigured'))
                        : m.id === 'crypto' ? (settings.cryptoInstructions || t('checkout.cryptoNotConfigured'))
                        : t('checkout.payDeliveryAgent')}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* ── Order Summary ── */}
        <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
        <View style={styles.card}>
          {cartItems.map((item) => (
            <View key={item.cartItemId} style={styles.summaryRow}>
              <Text style={styles.summaryItem} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryAmt}>{fmt(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
            <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('checkout.shipping')}</Text>
            <Text style={[styles.summaryValue, shippingFee === 0 && { color: '#16A34A' }]}>
              {shippingFee === 0 ? t('checkout.free') : fmt(shippingFee)}
            </Text>
          </View>
          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.discount')} ({activePromo})</Text>
              <Text style={[styles.summaryValue, { color: COLORS.error }]}>−{fmt(promoDiscount)}</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
          <Text style={styles.totalAmount}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, placing && { opacity: 0.55 }]}
          onPress={handlePlaceOrder}
          disabled={placing}
          activeOpacity={0.85}
        >
          {placing
            ? <ActivityIndicator color="#fff" />
            : <>
                <CircleCheckBig size={20} color="#fff" />
                <Text style={styles.placeBtnText}>
                  {isManualMomo ? t('checkout.placeOrderAndSubmit') : t('checkout.placeOrder')}
                </Text>
              </>
          }
        </TouchableOpacity>
      </View>

      <PaymentModal
        visible={showPaymentModal}
        provider={selectedPayment}
        orderId={pendingOrderId}
        amount={total}
        onSuccess={() => {
          setShowPaymentModal(false);
          clearCart();
          navigation.replace('OrderSuccess', { orderId: pendingOrderId, orderNumber: pendingOrderNumber });
        }}
        onClose={() => setShowPaymentModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F8F9FA' },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle:  { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  iconBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  scroll:       { padding: SIZES.lg, paddingBottom: 130 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12, marginTop: 8, letterSpacing: -0.4 },

  card:       { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', ...SHADOWS.sm },
  cardRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  cardName:   { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  changeText: { color: COLORS.primaryBlue, fontSize: 13, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4 },
  cardSub:    { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, paddingLeft: 28 },

  // Payment method cards
  payList: { gap: 10, marginBottom: 16 },
  payCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#F1F5F9', overflow: 'hidden', ...SHADOWS.sm },
  payRow:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  payIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  payName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  paySub:  { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  radio:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  radioDot:    { width: 10, height: 10, borderRadius: 5 },

  // Expanded panel
  panel: { borderTopWidth: 1, padding: 14, backgroundColor: '#FAFAFA', gap: 14 },

  // Mode toggle
  modeRow:     { flexDirection: 'row', gap: 10 },
  modeBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  modeBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  sep: { height: 1, backgroundColor: '#EBEBEB' },

  // Recipient panels
  autoPanel:   { gap: 12 },
  manualPanel: { gap: 12 },

  infoBox:     { borderWidth: 1.5, borderRadius: 10, padding: 11 },
  infoBoxText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  // Steps
  stepHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBadge:     { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  stepBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  stepTitle:     { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary },
  stepsBox:      { borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 4 },
  stepsText:     { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, fontWeight: '500' },

  // Form
  inputRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 48, backgroundColor: '#fff' },
  inputError: { borderColor: '#EA4335' },
  prefix:     { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary },
  input:      { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },

  uploadBox:      { borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB', borderRadius: 12, height: 140, justifyContent: 'center', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', overflow: 'hidden' },
  uploadBoxDone:  { borderStyle: 'solid', borderColor: '#16A34A' },
  uploadBoxError: { borderColor: '#EA4335' },
  uploadCircle:   { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  uploadLabel:    { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  uploadSub:      { fontSize: 11, color: COLORS.textMuted },
  previewImg:     { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'center', alignItems: 'center' },
  overlayText:    { color: '#fff', fontSize: 13, fontWeight: '700' },

  errorText: { fontSize: 12, color: '#EA4335', fontWeight: '600', marginTop: -4 },

  staticText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20, fontWeight: '500' },

  // Order summary
  summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  summaryItem:  { fontSize: 13, color: COLORS.textPrimary, flex: 1, fontWeight: '500' },
  summaryAmt:   { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  summaryValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '700' },
  divider:      { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  // Footer
  footer:       { padding: SIZES.lg, paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.lg, borderTopWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#fff', ...SHADOWS.lg },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  totalLabel:   { fontSize: 15, fontWeight: '600', color: COLORS.textSecondary },
  totalAmount:  { fontSize: 24, fontWeight: '900', color: COLORS.primaryBlue, letterSpacing: -0.5 },
  placeBtn:     { backgroundColor: COLORS.primaryBlue, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...SHADOWS.md },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
});
