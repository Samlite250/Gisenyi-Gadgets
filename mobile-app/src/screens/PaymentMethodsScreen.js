import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Smartphone, Landmark, Bitcoin, Banknote, Copy, CheckCircle, Info } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

// ⚠️ Replace placeholder values with your real payment details from admin panel
const PAYMENT_OPTIONS = [
    {
        id: 'mtn',
        label: 'MTN Mobile Money',
        icon: Smartphone,
        color: '#FBC400',
        bg: '#FFFBEB',
        fields: [
            { key: 'Number', value: '+250 78X XXX XXX' },
            { key: 'Name', value: 'Gisenyi Gadgets' },
        ],
        steps: [
            'Dial *182# on your MTN line',
            'Select Option 1 (Send Money)',
            'Select Option 1 (To MTN User)',
            'Enter Mobile Number from above',
            'Enter Amount (Total order value)',
            'Enter your PIN to confirm',
            'Copy the Transaction ID from the SMS'
        ],
        note: 'Payments are typically confirmed within 5-10 minutes.',
    },
    {
        id: 'airtel',
        label: 'Airtel Money',
        icon: Smartphone,
        color: '#E8002D',
        bg: '#FFF1F2',
        fields: [
            { key: 'Number', value: '+250 73X XXX XXX' },
            { key: 'Name', value: 'Gisenyi Gadgets' },
        ],
        steps: [
            'Dial *500# on your Airtel line',
            'Select Option 1 (Send Money)',
            'Select Option 1 (To Airtel User)',
            'Enter Mobile Number from above',
            'Enter Amount (Total order value)',
            'Enter your PIN to confirm',
            'Keep the confirmation SMS for reference'
        ],
        note: 'Please ensure you send the exact total amount.',
    },
    {
        id: 'bank',
        label: 'Bank Transfer',
        icon: Landmark,
        color: '#1D4ED8',
        bg: '#EFF6FF',
        fields: [
            { key: 'Bank', value: 'Bank of Kigali' },
            { key: 'Account', value: '000 XXXX XXX' },
            { key: 'SWIFT', value: 'BKIGRWRW' },
            { key: 'Name', value: 'Gisenyi Gadgets Ltd' },
        ],
        steps: [
            'Log into your Bank portal or App',
            'Select Transfer to Other Account',
            'Enter Account Name & Number above',
            'Enter the SWIFT code if required',
            'Reference: Use your Order Number',
            'Upload a screenshot of the receipt in "My Orders"',
        ],
        note: 'Bank transfers may take up to 24 hours to clear.',
    },
    {
        id: 'crypto',
        label: 'Cryptocurrency',
        icon: Bitcoin,
        color: '#F7931A',
        bg: '#FFF7ED',
        fields: [
            { key: 'USDT (TRC-20)', value: 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
            { key: 'Bitcoin (BTC)', value: '1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
        ],
        steps: [
            'Open your Crypto Wallet (Binance, Trust, etc.)',
            'Select the currency (USDT or BTC)',
            'Select the Correct Network (TRC-20 for USDT)',
            'Scan or Paste the address from above',
            'Enter Amount in USD equivalent',
            'Take a screenshot of the transaction hash (TxID)',
        ],
        note: 'Wait for at least 3 network confirmations.',
    },
    {
        id: 'cash',
        label: 'Cash on Delivery',
        icon: Banknote,
        color: '#16A34A',
        bg: '#F0FDF4',
        fields: [
            { key: 'Zone', value: 'Gisenyi / Rubavu District' },
            { key: 'Fee', value: 'RWF 2,000 – RWF 5,000' },
        ],
        steps: [
            'Ensure you are at the shipping address',
            'Have the exact amount ready in RWF',
            'Pay the delivery agent upon receipt',
            'Sign the delivery confirmation',
        ],
        note: 'Cash on delivery is only available in select zones.',
    },
];

export default function PaymentMethodsScreen({ navigation }) {
    const [expanded, setExpanded] = useState(null);

    const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

    const copyValue = (val) => {
        Alert.alert('Copied', `"${val}" copied to clipboard.`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Instructions</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.topNotice}>
                    <Info size={18} color={COLORS.primaryBlue} />
                    <Text style={styles.topNoticeText}>
                        Select a payment method to view specific instructions and transfer details.
                    </Text>
                </View>

                {PAYMENT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const open = expanded === opt.id;
                    return (
                        <View key={opt.id} style={[styles.card, open && { borderColor: opt.color }]}>
                            <TouchableOpacity
                                style={styles.cardHeader}
                                onPress={() => toggle(opt.id)}
                                activeOpacity={0.85}
                            >
                                <View style={[styles.iconBox, { backgroundColor: opt.bg }]}>
                                    <Icon size={22} color={opt.color} />
                                </View>
                                <Text style={styles.optionLabel}>{opt.label}</Text>
                                <View style={[styles.chevron, open && styles.chevronOpen]}>
                                    <ChevronLeft
                                        size={18}
                                        color={COLORS.textMuted}
                                        style={{ transform: [{ rotate: open ? '90deg' : '-90deg' }] }}
                                    />
                                </View>
                            </TouchableOpacity>

                            {open && (
                                <View style={styles.details}>
                                    <View style={styles.divider} />

                                    <Text style={styles.sectionTitle}>Transfer Details</Text>
                                    {opt.fields.map((f) => (
                                        <View key={f.key} style={styles.fieldRow}>
                                            <Text style={styles.fieldKey}>{f.key}</Text>
                                            <TouchableOpacity
                                                style={styles.fieldValWrap}
                                                onPress={() => copyValue(f.value)}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[styles.fieldVal, { color: opt.color }]}>{f.value}</Text>
                                                <Copy size={14} color={opt.color} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}

                                    <View style={styles.dividerSmall} />

                                    <Text style={styles.sectionTitle}>Payment Steps</Text>
                                    {opt.steps.map((step, idx) => (
                                        <View key={idx} style={styles.stepRow}>
                                            <View style={[styles.stepNum, { backgroundColor: opt.color }]}>
                                                <Text style={styles.stepNumText}>{idx + 1}</Text>
                                            </View>
                                            <Text style={styles.stepText}>{step}</Text>
                                        </View>
                                    ))}

                                    <View style={[styles.noteBox, { backgroundColor: opt.bg }]}>
                                        <CheckCircle size={14} color={opt.color} />
                                        <Text style={[styles.noteText, { color: opt.color }]}>{opt.note}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}

                <View style={styles.helpBox}>
                    <Text style={styles.helpTitle}>Need help with payment?</Text>
                    <TouchableOpacity style={styles.contactBtn}>
                        <Text style={styles.contactBtnText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: SIZES.md,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    },
    backBtn: { padding: SIZES.sm },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    content: { padding: SIZES.lg, paddingBottom: 40 },

    topNotice: {
        flexDirection: 'row', gap: 10, padding: 14,
        backgroundColor: '#E0E7FF', borderRadius: 12, marginBottom: 20
    },
    topNoticeText: { flex: 1, fontSize: 13, color: '#312E81', lineHeight: 18, fontWeight: '500' },

    card: {
        backgroundColor: '#fff', borderRadius: 16,
        marginBottom: 14, borderSize: 1, borderWidth: 1.5, borderColor: '#F0F0F0',
        ...SHADOWS.sm, overflow: 'hidden'
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: SIZES.md },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    optionLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    chevron: { opacity: 0.7 },
    chevronOpen: { opacity: 1 },

    details: { paddingHorizontal: SIZES.md, paddingBottom: SIZES.md },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 14 },
    dividerSmall: { height: 1, backgroundColor: '#F9FAFB', marginVertical: 10 },

    sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },

    fieldRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    fieldKey: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
    fieldValWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    fieldVal: { fontSize: 14, fontWeight: '700' },

    stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    stepNum: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
    stepNumText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    stepText: { flex: 1, fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },

    noteBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, marginTop: 15 },
    noteText: { fontSize: 12, flex: 1, lineHeight: 18, fontWeight: '600' },

    helpBox: { marginTop: 30, alignItems: 'center', gap: 12 },
    helpTitle: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
    contactBtn: { paddingVertical: SIZES.sm, paddingHorizontal: SIZES.xl, borderRadius: 20, borderWidth: 1, borderColor: COLORS.primaryBlue },
    contactBtnText: { color: COLORS.primaryBlue, fontWeight: '700', fontSize: 13 },
});
