import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { MapPin, Phone, MessageCircle, ChevronRight } from 'lucide-react-native';
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

    return (
        <View style={styles.footerWrapper}>
            <View style={styles.accentBar} />
            <View style={styles.footerInner}>
                <View style={styles.grid}>

                    {/* Brand */}
                    <View style={[styles.col, { flex: 1.5 }]}>
                        <View style={styles.brandRow}>
                            <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
                            <View>
                                <Text style={styles.brandTitle}>GISENYI GADGETS</Text>
                                <Text style={styles.brandTagline}>Tech & Electronics · Rwanda</Text>
                            </View>
                        </View>
                        <View style={styles.contactGroup}>
                            <View style={styles.contactRow}>
                                <MapPin size={12} color="#60A5FA" />
                                <Text style={styles.contactText}>Gisenyi Main Market & Kigali, Rwanda</Text>
                            </View>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${hotline}`)}>
                                <Phone size={12} color="#60A5FA" />
                                <Text style={[styles.contactText, { color: '#93C5FD' }]}>{hotline}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.contactRow} onPress={handleWhatsApp}>
                                <MessageCircle size={12} color="#4ADE80" />
                                <Text style={[styles.contactText, { color: '#4ADE80' }]}>WhatsApp Us</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Quick Links */}
                    <View style={styles.col}>
                        <Text style={styles.colTitle}>Quick Links</Text>
                        {[
                            { label: 'Home', route: 'Home' },
                            { label: 'All Products', route: 'Search' },
                            { label: 'My Orders', route: 'Orders' },
                            { label: 'Wishlist', route: 'Wishlist' },
                        ].map((link, i) => (
                            <TouchableOpacity key={i} style={styles.linkRow} onPress={() => navigation?.navigate(link.route)}>
                                <ChevronRight size={11} color="#334155" />
                                <Text style={styles.linkText}>{link.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Support */}
                    <View style={styles.col}>
                        <Text style={styles.colTitle}>Support</Text>
                        {[
                            { label: 'Live Chat', route: 'ChatSupport' },
                            { label: 'Help & FAQs', route: 'HelpSupport' },
                        ].map((link, i) => (
                            <TouchableOpacity key={i} style={styles.linkRow} onPress={() => navigation?.navigate(link.route)}>
                                <ChevronRight size={11} color="#334155" />
                                <Text style={styles.linkText}>{link.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.bottomBar}>
                    <Text style={styles.copyright}>© 2026 Gisenyi Gadgets Ltd. All Rights Reserved.</Text>
                    <Text style={styles.rwandaText}>🇷🇼 Made in Rwanda</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footerWrapper: {
        width: '100%',
        backgroundColor: '#0B1120',
        marginTop: 32,
    },
    accentBar: { height: 2, width: '100%', backgroundColor: '#2563EB' },
    footerInner: {
        maxWidth: 1180,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 28,
        paddingTop: 24,
        paddingBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 32,
        paddingBottom: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    col: { flex: 1, minWidth: 140, gap: 8 },

    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoImg: { width: 28, height: 28 },
    brandTitle: { fontSize: 12, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.4 },
    brandTagline: { fontSize: 9, color: '#60A5FA', fontWeight: '600' },

    contactGroup: { gap: 6 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    contactText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },

    colTitle: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    linkText: { fontSize: 12, color: '#64748B', fontWeight: '500' },

    bottomBar: {
        flexDirection: 'row', flexWrap: 'wrap',
        justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, gap: 8,
    },
    copyright: { fontSize: 10, color: '#334155' },
    rwandaText: { fontSize: 10, color: '#475569', fontWeight: '600' },
});
