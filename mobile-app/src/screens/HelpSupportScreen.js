import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, PhoneCall, MessageCircle, Mail, HelpCircle, ArrowRight } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';

export default function HelpSupportScreen({ navigation }) {
    const { t } = useLanguage();
    const [supportPhone, setSupportPhone] = useState('+250 780 112 019');
    const [whatsappNumber, setWhatsappNumber] = useState('+250 780 112 019');
    const [supportEmail, setSupportEmail] = useState('support@gisenyigadgets.rw');

    useEffect(() => {
        let isMounted = true;
        supabase
            .from('platform_settings')
            .select('key, value')
            .in('key', ['supportPhone', 'whatsappNumber', 'supportEmail'])
            .then(({ data, error }) => {
                if (!error && data && isMounted) {
                    data.forEach(item => {
                        const val = typeof item.value === 'string' ? item.value.replace(/"/g, '') : item.value;
                        if (item.key === 'supportPhone' && val) setSupportPhone(val);
                        if (item.key === 'whatsappNumber' && val) setWhatsappNumber(val);
                        if (item.key === 'supportEmail' && val) setSupportEmail(val);
                    });
                }
            });
        return () => { isMounted = false; };
    }, []);

    const handleCall = () => {
        let clean = supportPhone.replace(/[^\d+]/g, '');
        if (clean.startsWith('0')) clean = '+250' + clean.slice(1);
        Linking.openURL(`tel:${clean}`);
    };

    const handleWhatsApp = () => {
        let clean = whatsappNumber.replace(/[^\d+]/g, '');
        if (clean.startsWith('0')) clean = '+250' + clean.slice(1);
        const num = clean.replace('+', '');
        const url = `https://wa.me/${num}?text=${encodeURIComponent('Hello Gisenyi Gadgets Support, I need assistance.')}`;
        Linking.openURL(url).catch(() => {
            Linking.openURL(`https://api.whatsapp.com/send?phone=${num}&text=${encodeURIComponent('Hello Gisenyi Gadgets Support, I need assistance.')}`);
        });
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${supportEmail}`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('profile.help')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>How can we help you?</Text>
                <Text style={styles.subText}>Reach out to our official Gisenyi Gadgets team via any channel below.</Text>

                {/* Call Support Card */}
                <TouchableOpacity style={styles.card} onPress={handleCall}>
                    <View style={[styles.iconWrap, { backgroundColor: '#EFF6FF' }]}>
                        <PhoneCall size={24} color="#2563EB" />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>Call Store Hotline</Text>
                        <Text style={styles.cardSub}>{supportPhone}</Text>
                    </View>
                    <ArrowRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* WhatsApp Card */}
                <TouchableOpacity style={styles.card} onPress={handleWhatsApp}>
                    <View style={[styles.iconWrap, { backgroundColor: '#F0FDF4' }]}>
                        <MessageCircle size={24} color="#16A34A" />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>Chat on WhatsApp</Text>
                        <Text style={styles.cardSub}>{whatsappNumber}</Text>
                    </View>
                    <ArrowRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* In-App Live Chat Card */}
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ChatSupport')}>
                    <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
                        <HelpCircle size={24} color="#D97706" />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>24/7 Live In-App Chat</Text>
                        <Text style={styles.cardSub}>Talk directly with customer support</Text>
                    </View>
                    <ArrowRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Email Support Card */}
                <TouchableOpacity style={styles.card} onPress={handleEmail}>
                    <View style={[styles.iconWrap, { backgroundColor: '#F3E8FF' }]}>
                        <Mail size={24} color="#9333EA" />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>Support Email</Text>
                        <Text style={styles.cardSub}>{supportEmail}</Text>
                    </View>
                    <ArrowRight size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                <View style={styles.footerNote}>
                    <Text style={styles.footerNoteText}>
                        Gisenyi Gadgets Main Store: Gisenyi Main Market & Kigali Showroom, Rwanda
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', padding: SIZES.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
    },
    backBtn: { padding: SIZES.sm },
    headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
    content: { padding: SIZES.lg, gap: 14 },
    sectionTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
    subText: { fontSize: 14, color: COLORS.textMuted, marginBottom: 10, lineHeight: 20 },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', borderRadius: 16,
        padding: 16, gap: 14,
        borderWidth: 1, borderColor: '#E2E8F0',
        ...SHADOWS.sm
    },
    iconWrap: {
        width: 48, height: 48, borderRadius: 14,
        alignItems: 'center', justifyContent: 'center'
    },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
    cardSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
    footerNote: {
        marginTop: 20, padding: 16,
        backgroundColor: '#EFF6FF', borderRadius: 12,
        borderWidth: 1, borderColor: '#BFDBFE'
    },
    footerNoteText: { fontSize: 12, color: '#1E40AF', textAlign: 'center', fontWeight: '500', lineHeight: 18 }
});

