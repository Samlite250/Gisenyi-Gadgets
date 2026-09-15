import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import { MapPin, Phone, ShieldCheck } from 'lucide-react-native';
import { supabase } from '../services/supabase';

export default function WebFooter({ navigation }) {
    const [hotline, setHotline] = useState('+250 780 112 019');

    useEffect(() => {
        let isSubscribed = true;
        supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'supportPhone')
            .maybeSingle()
            .then(({ data }) => {
                if (isSubscribed && data?.value) {
                    const val = typeof data.value === 'string' ? data.value.replace(/"/g, '') : data.value;
                    if (val) setHotline(val);
                }
            });
        return () => { isSubscribed = false; };
    }, []);

    return (
        <View style={styles.footerWrapper}>
            <View style={styles.footerInner}>
                <View style={styles.grid}>
                    {/* Column 1: Brand & Contact */}
                    <View style={[styles.col, { flex: 1.2 }]}>
                        <View style={styles.brandRow}>
                            <Image source={require('../../assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
                            <View>
                                <Text style={styles.brandTitle}>GISENYI GADGETS</Text>
                                <Text style={styles.brandTagline}>Tech & Electronics Store</Text>
                            </View>
                        </View>
                        <Text style={styles.aboutText}>
                            Rwanda's trusted destination for flagship smartphones, laptops, audio gear, and authentic accessories.
                        </Text>

                        <View style={styles.contactList}>
                            <View style={styles.contactRow}>
                                <MapPin size={14} color="#3B82F6" />
                                <Text style={styles.contactText}>Gisenyi Main Market & Kigali Showroom, Rwanda</Text>
                            </View>
                            <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${hotline}`)}>
                                <Phone size={14} color="#3B82F6" />
                                <Text style={styles.contactText}>Hotline: {hotline}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Column 2: Quick Links */}
                    <View style={styles.col}>
                        <Text style={styles.colTitle}>Quick Links</Text>
                        <View style={styles.linkList}>
                            {[
                                { label: 'Home', route: 'Home' },
                                { label: 'All Products', route: 'Search' },
                                { label: 'Shopping Cart', route: 'Cart' },
                                { label: 'Wishlist', route: 'Wishlist' },
                                { label: 'Track Order', route: 'Orders' },
                            ].map((link, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.linkItem}
                                    onPress={() => navigation?.navigate(link.route)}
                                >
                                    <Text style={styles.linkText}>{link.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Column 3: Customer Care */}
                    <View style={styles.col}>
                        <Text style={styles.colTitle}>Customer Care</Text>
                        <View style={styles.linkList}>
                            {[
                                { label: '24/7 Live Chat', route: 'ChatSupport' },
                                { label: 'Help & FAQs', route: 'HelpSupport' },
                                { label: 'Shipping Policy', route: 'HelpSupport' },
                                { label: 'Return Policy', route: 'HelpSupport' },
                                { label: 'Terms & Conditions', route: 'Licenses' },
                            ].map((link, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.linkItem}
                                    onPress={() => navigation?.navigate(link.route)}
                                >
                                    <Text style={styles.linkText}>{link.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Column 4: Payment & Security */}
                    <View style={[styles.col, { flex: 1.1 }]}>
                        <Text style={styles.colTitle}>Payments & Security</Text>
                        <View style={styles.paymentBadgesRow}>
                            {[
                                { name: 'MTN MoMo', color: '#FACC15' },
                                { name: 'Airtel Money', color: '#EF4444' },
                                { name: 'Visa', color: '#3B82F6' },
                                { name: 'Mastercard', color: '#F97316' },
                                { name: 'Cash on Delivery', color: '#10B981' },
                            ].map((p, idx) => (
                                <View key={idx} style={styles.payBadge}>
                                    <Text style={[styles.payBadgeText, { color: p.color }]}>{p.name}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.sslBox}>
                            <ShieldCheck size={18} color="#10B981" />
                            <Text style={styles.sslTitle}>256-Bit Secure Checkout</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Copyright Bar */}
                <View style={styles.bottomBar}>
                    <Text style={styles.copyrightText}>
                        © 2026 Gisenyi Gadgets Ltd. All Rights Reserved.
                    </Text>
                    <Text style={styles.rwandaBadge}>Made in Rwanda</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    footerWrapper: {
        width: '100%',
        backgroundColor: '#0F172A',
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingTop: 40,
        paddingBottom: 24,
        marginTop: 40,
    },
    footerInner: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 32,
        paddingBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    col: { flex: 1, minWidth: 180, gap: 14 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoImg: { width: 38, height: 38 },
    brandTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
    brandTagline: { fontSize: 11, color: '#3B82F6', fontWeight: '600' },
    aboutText: { fontSize: 13, color: '#94A3B8', lineHeight: 19, fontWeight: '400' },
    contactList: { gap: 8, marginTop: 2 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactText: { fontSize: 12, color: '#CBD5E1', flex: 1, lineHeight: 16 },

    colTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
    linkList: { gap: 8 },
    linkItem: { paddingVertical: 2 },
    linkText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

    paymentBadgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    payBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155'
    },
    payBadgeText: { fontSize: 11, fontWeight: '700' },

    sslBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1E293B',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    sslTitle: { fontSize: 12, fontWeight: '600', color: '#CBD5E1' },

    bottomBar: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        gap: 12,
    },
    copyrightText: { fontSize: 12, color: '#64748B' },
    rwandaBadge: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
});
