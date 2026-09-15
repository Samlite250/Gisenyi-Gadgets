import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { MapPin, Phone, MessageCircle, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function WebFooter({ navigation }) {
    const [hotline, setHotline] = useState('+250780112019');
    const [whatsapp, setWhatsapp] = useState('+250780112019');

    useEffect(() => {
        let isSubscribed = true;
        supabase
            .from('platform_settings')
            .select('key, value')
            .in('key', ['supportPhone', 'whatsappNumber'])
            .then(({ data }) => {
                if (isSubscribed && data) {
                    data.forEach(item => {
                        const val = typeof item.value === 'string' ? item.value.replace(/"/g, '') : item.value;
                        if (item.key === 'supportPhone' && val) setHotline(val);
                        if (item.key === 'whatsappNumber' && val) setWhatsapp(val);
                    });
                }
            });
        return () => { isSubscribed = false; };
    }, []);

    const handleWhatsApp = () => {
        let clean = whatsapp.replace(/[^\d+]/g, '');
        if (clean.startsWith('0')) clean = '+250' + clean.slice(1);
        Linking.openURL(`https://wa.me/${clean.replace('+', '')}?text=${encodeURIComponent('Hello Gisenyi Gadgets, I need help.')}`);
    };

    const quickLinks = [
        { label: 'Home', route: 'Home' },
        { label: 'All Products', route: 'Search' },
        { label: 'My Orders', route: 'Orders' },
        { label: 'Wishlist', route: 'Wishlist' },
    ];

    const supportLinks = [
        { label: 'Live Chat Support', route: 'ChatSupport' },
        { label: 'Help & FAQs', route: 'HelpSupport' },
    ];

    const payments = [
        { name: 'MTN MoMo', color: '#FACC15' },
        { name: 'Airtel Money', color: '#EF4444' },
        { name: 'Cash on Delivery', color: '#10B981' },
    ];

    return (
        <View style={styles.footerWrapper}>
            {/* Top accent line */}
            <View style={styles.accentBar} />

            <View style={styles.footerInner}>
                <View style={styles.grid}>

                    {/* Brand Column */}
                    <View style={[styles.col, { flex: 1.4 }]}>
                        <View style={styles.brandRow}>
                            <View style={styles.logoWrap}>
                                <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
                            </View>
                            <View>
                                <Text style={styles.brandTitle}>GISENYI GADGETS</Text>
                                <Text style={styles.brandTagline}>Tech & Electronics Store · Rwanda</Text>
                            </View>
                        </View>

                        <Text style={styles.aboutText}>
                            Your trusted destination for flagship smartphones, laptops, audio, and authentic accessories.
                        </Text>

                        <View style={styles.contactGroup}>
                            <View style={styles.contactRow}>
                                <MapPin size={13} color="#60A5FA" />
                                <Text style={styles.contactText}>Gisenyi Main Market & Kigali, Rwanda</Text>
                            </View>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${hotline}`)}>
                                <Phone size={13} color="#60A5FA" />
                                <Text style={[styles.contactText, styles.contactLink]}>{hotline}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow} onPress={handleWhatsApp}>
                                <MessageCircle size={13} color="#4ADE80" />
                                <Text style={[styles.contactText, { color: '#4ADE80' }]}>WhatsApp Us</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quick Links */}
                    <View style={styles.col}>
                        <Text style={styles.colTitle}>Quick Links</Text>
                        <View style={styles.linkList}>
                            {quickLinks.map((link, i) => (
                                <TouchableOpacity key={i} style={styles.linkRow} onPress={() => navigation?.navigate(link.route)}>
                                    <ChevronRight size={12} color="#334155" />
                                    <Text style={styles.linkText}>{link.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Support */}
                    <View style={styles.col}>
                        <Text style={styles.colTitle}>Support</Text>
                        <View style={styles.linkList}>
                            {supportLinks.map((link, i) => (
                                <TouchableOpacity key={i} style={styles.linkRow} onPress={() => navigation?.navigate(link.route)}>
                                    <ChevronRight size={12} color="#334155" />
                                    <Text style={styles.linkText}>{link.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Payment Methods */}
                        <Text style={[styles.colTitle, { marginTop: 20 }]}>We Accept</Text>
                        <View style={styles.payRow}>
                            {payments.map((p, i) => (
                                <View key={i} style={styles.payBadge}>
                                    <Text style={[styles.payText, { color: p.color }]}>{p.name}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.sslRow}>
                            <ShieldCheck size={13} color="#4ADE80" />
                            <Text style={styles.sslText}>256-Bit Secure Checkout</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <Text style={styles.copyright}>© 2026 Gisenyi Gadgets Ltd. All Rights Reserved.</Text>
                    <View style={styles.rwandaChip}>
                        <Text style={styles.rwandaText}>🇷🇼 Made in Rwanda</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footerWrapper: {
        width: '100%',
        backgroundColor: '#0B1120',
        marginTop: 40,
    },
    accentBar: {
        height: 3,
        width: '100%',
        backgroundColor: '#2563EB',
    },
    footerInner: {
        maxWidth: 1180,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 28,
        paddingTop: 44,
        paddingBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 40,
        paddingBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    col: { flex: 1, minWidth: 160, gap: 12 },

    // Brand
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoWrap: {
        width: 42, height: 42, borderRadius: 10,
        backgroundColor: '#1E293B',
        alignItems: 'center', justifyContent: 'center',
    },
    logoImg: { width: 30, height: 30 },
    brandTitle: { fontSize: 14, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },
    brandTagline: { fontSize: 10, color: '#60A5FA', fontWeight: '600', marginTop: 1 },
    aboutText: { fontSize: 12, color: '#64748B', lineHeight: 18 },

    // Contact
    contactGroup: { gap: 8 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    contactText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
    contactLink: { color: '#93C5FD' },

    // Links
    colTitle: { fontSize: 12, fontWeight: '800', color: '#CBD5E1', letterSpacing: 0.8, textTransform: 'uppercase' },
    linkList: { gap: 7 },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    linkText: { fontSize: 13, color: '#64748B', fontWeight: '500' },

    // Payments
    payRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
    payBadge: {
        paddingHorizontal: 9, paddingVertical: 4,
        backgroundColor: '#0F172A',
        borderRadius: 5, borderWidth: 1, borderColor: '#1E293B',
    },
    payText: { fontSize: 10, fontWeight: '700' },

    // SSL
    sslRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    sslText: { fontSize: 11, color: '#4ADE80', fontWeight: '600' },

    // Bottom
    bottomBar: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 20, gap: 10,
    },
    copyright: { fontSize: 11, color: '#334155' },
    rwandaChip: {
        paddingHorizontal: 10, paddingVertical: 4,
        backgroundColor: '#0F172A', borderRadius: 20,
        borderWidth: 1, borderColor: '#1E293B',
    },
    rwandaText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
});
