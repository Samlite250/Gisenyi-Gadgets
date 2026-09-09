import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, ShieldCheck, CreditCard, Headphones } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

export default function TrustBadges() {
    const badges = [
        {
            icon: Zap,
            title: 'Fast Express Shipping',
            desc: 'Same-day / 24h delivery across Gisenyi, Kigali, Musanze & nationwide',
            color: '#3B82F6',
            bg: '#EFF6FF',
        },
        {
            icon: ShieldCheck,
            title: '100% Genuine Tech',
            desc: 'Official manufacturer warranty & authentic products guaranteed',
            color: '#10B981',
            bg: '#ECFDF5',
        },
        {
            icon: CreditCard,
            title: 'Flexible Local Payments',
            desc: 'Pay via MTN Mobile Money, Airtel Money, Cards or Cash on Delivery',
            color: '#8B5CF6',
            bg: '#F5F3FF',
        },
        {
            icon: Headphones,
            title: '24/7 Expert Support',
            desc: 'Local gadget technical assistance & live chat customer support',
            color: '#F59E0B',
            bg: '#FFFBEB',
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {badges.map((b, idx) => (
                    <View key={idx} style={styles.card}>
                        <View style={[styles.iconBox, { backgroundColor: b.bg }]}>
                            <b.icon size={26} color={b.color} strokeWidth={2.2} />
                        </View>
                        <View style={styles.textGroup}>
                            <Text style={styles.title}>{b.title}</Text>
                            <Text style={styles.desc}>{b.desc}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E2E8F0',
        marginVertical: 20,
    },
    grid: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 20,
    },
    card: {
        flex: 1,
        minWidth: 240,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textGroup: { flex: 1, gap: 3 },
    title: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
    desc: { fontSize: 12, color: '#64748B', lineHeight: 16, fontWeight: '500' },
});
