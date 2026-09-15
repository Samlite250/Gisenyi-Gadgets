import React, { useState } from 'react';
import { useRoute } from '@react-navigation/native';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform
} from 'react-native';
import {
    Search, ShoppingCart, Heart, User, MapPin, Phone, MessageSquare,
    ShieldCheck, Truck, Sparkles, ChevronDown, Flame, Smartphone, Laptop,
    Headphones, Watch, Gamepad2, Cpu, Tag, ExternalLink, Home, ListOrdered
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SHADOWS } from '../constants/theme';

export default function WebHeader({ navigation, onSearch, activeCategory, onSelectCategory }) {
    const { user, profile } = useAuth() || {};
    const { cartItems = [], total = 0 } = useCart() || {};
    const { wishlistItems = [] } = useWishlist() || {};
    const { t, currentLanguage = 'en', changeLanguage } = useLanguage() || {};
    const language = currentLanguage || 'en';

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCat, setSelectedCat] = useState({ id: 'all', label: 'All' });
    const [showCatMenu, setShowCatMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

    const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === 'gisenyigadgets@gmail.com';

    // Safely get route information for active nav states
    let routeName = '';
    let routeCategory = null;
    try {
        const route = useRoute();
        routeName = route?.name || '';
        routeCategory = route?.params?.category || null;
    } catch (e) { }

    const effectiveCategory = (
        activeCategory ||
        routeCategory ||
        (routeName === 'Home' ? 'all' : (routeName === 'Search' && !routeCategory ? 'all' : null))
    )?.toString().toLowerCase();


    const totalCartCount = (cartItems || []).reduce((acc, item) => acc + (item?.quantity || 1), 0);
    const totalWishlistCount = wishlistItems?.length || 0;

    const categories = [
        { id: 'all', label: 'All Products', icon: Flame },
        { id: 'smartphones', label: 'Smartphones', icon: Smartphone },
        { id: 'laptops', label: 'Laptops & PCs', icon: Laptop },
        { id: 'headphones', label: 'Audio & Sound', icon: Headphones },
        { id: 'smartwatches', label: 'Smartwatches', icon: Watch },
        { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
        { id: 'accessories', label: 'Accessories', icon: Cpu },
    ];

    const handleCategorySelect = (catId) => {
        if (onSelectCategory) {
            onSelectCategory(catId);
        }
        if (navigation) {
            navigation.navigate('Search', { category: catId !== 'all' ? catId : null, query: '' });
        }
    };

    const handleNavPress = (item) => {
        if (item.route === 'Home') {
            if (onSelectCategory) onSelectCategory('all');
            navigation?.navigate('Home');
        } else if (item.route === 'Search') {
            if (onSelectCategory) onSelectCategory('all');
            navigation?.navigate('Search', { category: null, query: '' });
        } else {
            navigation?.navigate(item.route);
        }
    };

    const handleSearchSubmit = () => {
        if (onSearch && selectedCat.id === 'all') {
            onSearch(searchQuery);
        } else if (navigation) {
            navigation.navigate('Search', { query: searchQuery, category: selectedCat.id !== 'all' ? selectedCat.id : null });
        }
    };

    const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;

    return (
        <View style={styles.webHeaderWrapper}>
            {/* ─── 1. Main Brand Header ────────────────────────────────────── */}
            <View style={styles.mainHeader}>
                <View style={styles.mainHeaderInner}>
                    {/* Logo */}
                    <TouchableOpacity style={styles.logoGroup} onPress={() => navigation?.navigate('Home')} activeOpacity={0.9}>
                        <Image
                            source={require('../../assets/logo.png')}
                            style={styles.logoImg}
                            resizeMode="contain"
                        />
                        <View style={styles.logoTextGroup}>
                            <Text style={styles.logoTitle}>GISENYI GADGETS</Text>
                            <Text style={styles.logoTagline}>Rwanda's Premier Tech & Electronics Store</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Central Mega Search Bar */}
                    <View style={styles.megaSearchBox}>
                        <TouchableOpacity style={[styles.searchCatSelect, { position: 'relative' }]} onPress={() => setShowCatMenu(!showCatMenu)} activeOpacity={0.8}>
                            <Text style={styles.searchCatText}>{selectedCat.label}</Text>
                            <ChevronDown size={14} color="#64748B" />
                        </TouchableOpacity>

                        {showCatMenu && (
                            <View style={styles.catDropdown}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={styles.catOption}
                                        onPress={() => {
                                            setSelectedCat({ id: cat.id, label: cat.id === 'all' ? 'All' : cat.label.split(' ')[0] });
                                            setShowCatMenu(false);
                                        }}
                                    >
                                        <Text style={[styles.catOptionText, selectedCat.id === cat.id && { color: '#2563EB', fontWeight: '700' }]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        <View style={styles.searchDivider} />
                        <TextInput
                            style={styles.megaSearchInput}
                            placeholder="Search flagship phones, gaming laptops, smartwatches, audio accessories..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                        <TouchableOpacity style={styles.megaSearchBtn} onPress={handleSearchSubmit} activeOpacity={0.85}>
                            <Search size={18} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.megaSearchBtnText}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Header Action Icons */}
                    <View style={styles.actionRow}>
                        {/* Language Switcher */}
                        <View style={{ position: 'relative', zIndex: 50, marginRight: 8 }}>
                            <TouchableOpacity style={[styles.langBtn, { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', height: 42, justifyContent: 'center' }]} onPress={() => setShowLangMenu(!showLangMenu)}>
                                <Text style={[styles.langBtnText, { color: '#0F172A', fontWeight: '700' }]}>{language.toUpperCase()}</Text>
                                <ChevronDown size={13} color="#0F172A" />
                            </TouchableOpacity>
                            {showLangMenu && (
                                <View style={[styles.langDropdown, { top: 50 }]}>
                                    {[
                                        { code: 'en', label: '🇬🇧 English' },
                                        { code: 'fr', label: '🇫🇷 Français' },
                                        { code: 'rw', label: '🇷🇼 Kinyarwanda' },
                                    ].map((item) => (
                                        <TouchableOpacity
                                            key={item.code}
                                            style={styles.langOption}
                                            onPress={() => {
                                                changeLanguage(item.code);
                                                setShowLangMenu(false);
                                            }}
                                        >
                                            <Text style={[styles.langOptionText, language === item.code && styles.langOptionActive]}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>

                        {/* Wishlist Icon */}
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => navigation?.navigate('Wishlist')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.iconWrap}>
                                <Heart size={22} color="#1E293B" strokeWidth={2} />
                                {totalWishlistCount > 0 && (
                                    <View style={styles.badgeDot}>
                                        <Text style={styles.badgeText}>{totalWishlistCount}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.actionLabel}>Wishlist</Text>
                        </TouchableOpacity>

                        {/* Cart Icon */}
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={() => navigation?.navigate('Cart')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.iconWrap}>
                                <ShoppingCart size={22} color="#1E293B" strokeWidth={2} />
                                {totalCartCount > 0 && (
                                    <View style={[styles.badgeDot, { backgroundColor: '#3B82F6' }]}>
                                        <Text style={styles.badgeText}>{totalCartCount > 99 ? '99+' : totalCartCount}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={{ alignItems: 'flex-start' }}>
                                <Text style={styles.actionLabel}>My Cart</Text>
                                <Text style={styles.cartTotalText}>{fmt(total)}</Text>
                            </View>
                        </TouchableOpacity>

                        {/* User Account / Sign In */}
                        <TouchableOpacity
                            style={styles.accountCardBtn}
                            onPress={() => {
                                if (user) navigation?.navigate('Profile');
                                else navigation?.navigate('Login', { returnTo: 'Profile' });
                            }}
                            activeOpacity={0.85}
                        >
                            <View style={styles.avatarCircle}>
                                {user && profile?.avatar_url ? (
                                    <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
                                ) : (
                                    <User size={20} color="#3B82F6" strokeWidth={2.2} />
                                )}
                            </View>
                            <View style={styles.accountTextGroup}>
                                <Text style={styles.accountSubText}>{user ? 'Welcome back' : 'Guest Account'}</Text>
                                <Text style={styles.accountMainText}>{user ? (profile?.full_name || 'My Account') : 'Sign In / Register'}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ─── 3. Header Navbar & Category Strip ───────────────────────── */}
            <View style={styles.categoryStrip}>
                <View style={styles.categoryStripInner}>
                    {/* Main Navigation Links (Left) */}
                    <View style={styles.mainNavRow}>
                        {(() => {
                            const isHomeActive = routeName === 'Home';
                            return (
                                <TouchableOpacity
                                    style={[styles.backHomeBtn, isHomeActive ? styles.mainNavItemActive : styles.mainNavItemInactive]}
                                    onPress={() => {
                                        if (onSelectCategory) onSelectCategory('all');
                                        navigation?.navigate('Home');
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Home size={15} color={isHomeActive ? "#FFFFFF" : "#3B82F6"} strokeWidth={2.5} />
                                    <Text style={[styles.backHomeBtnText, !isHomeActive && { color: '#94A3B8', fontWeight: '600' }]}>Back to Home</Text>
                                </TouchableOpacity>
                            );
                        })()}

                        {[
                            { label: 'My Orders', route: 'Orders', icon: ListOrdered },
                        ].map((item, idx) => {
                            const isActive = routeName === item.route;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.mainNavItem, isActive ? styles.mainNavItemActive : styles.mainNavItemInactive]}
                                    onPress={() => handleNavPress(item)}
                                    activeOpacity={0.8}
                                >
                                    <item.icon size={14} color={isActive ? "#FFFFFF" : "#3B82F6"} strokeWidth={2.2} />
                                    <Text style={[styles.mainNavText, isActive ? { color: '#FFFFFF', fontWeight: '800' } : { color: '#94A3B8', fontWeight: '600' }]}>{item.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View style={styles.navDivider} />

                    {/* Category Filter Pills (Right) */}
                    <View style={styles.navLinksRow}>
                        {categories.map((cat) => {
                            const isActive = effectiveCategory === cat.id.toLowerCase();
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.navLinkItem, isActive && styles.navLinkItemActive]}
                                    onPress={() => handleCategorySelect(cat.id)}
                                >
                                    <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    webHeaderWrapper: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        zIndex: 100,
    },
    // Top Bar
    topBar: {
        backgroundColor: '#0F172A',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
    },
    topBarInner: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    badgePromo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#2563EB',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    badgePromoText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    topDivider: { width: 1, height: 14, backgroundColor: '#334155' },
    contactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    contactText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },

    topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    adminPortalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#1E293B',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    adminPortalText: { color: '#3B82F6', fontSize: 11, fontWeight: '700' },
    langBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 },
    langBtnText: { color: '#F8FAFC', fontSize: 12, fontWeight: '700' },
    langDropdown: {
        position: 'absolute',
        top: 24,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 6,
        width: 140,
        ...Platform.select({
            web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' },
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 10,
            },
        }),
        zIndex: 200,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    langOption: { paddingHorizontal: 12, paddingVertical: 8 },
    langOptionText: { fontSize: 13, color: '#334155', fontWeight: '500' },
    langOptionActive: { color: '#2563EB', fontWeight: '700' },

    // Main Header
    mainHeader: {
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        zIndex: 50, // Prevents dropdowns from sinking behind categoryStrip
    },
    mainHeaderInner: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
    },
    logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    logoImg: { width: 44, height: 44 },
    logoTextGroup: { gap: 1 },
    logoTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', letterSpacing: 0.5 },
    logoTagline: { fontSize: 11, fontWeight: '600', color: '#2563EB' },

    // Search
    megaSearchBox: {
        flex: 1,
        maxWidth: 620,
        height: 48,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 60,
    },
    searchCatSelect: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        height: '100%',
        backgroundColor: '#F1F5F9',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    searchCatText: { fontSize: 13, fontWeight: '600', color: '#334155' },
    searchDivider: { width: 1, height: 24, backgroundColor: '#CBD5E1' },
    megaSearchInput: {
        flex: 1,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#0F172A',
        height: '100%',
        outlineStyle: 'none',
    },
    megaSearchBtn: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 20,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    catDropdown: {
        position: 'absolute',
        top: 52,
        left: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 6,
        width: 160,
        ...Platform.select({
            web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.15)' },
            default: {
                shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15, shadowRadius: 10, elevation: 10
            },
        }),
        zIndex: 200,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    catOption: { paddingHorizontal: 12, paddingVertical: 8 },
    catOptionText: { fontSize: 13, color: '#334155', fontWeight: '500' },
    megaSearchBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    // Actions
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    actionItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconWrap: { position: 'relative' },
    badgeDot: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
    actionLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
    cartTotalText: { fontSize: 11, fontWeight: '800', color: '#2563EB' },

    accountCardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    avatarCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImg: { width: 34, height: 34, borderRadius: 17 },
    accountTextGroup: { gap: 1 },
    accountSubText: { fontSize: 10, color: '#64748B', fontWeight: '600' },
    accountMainText: { fontSize: 12, fontWeight: '800', color: '#0F172A' },

    // Category & Navbar Strip
    categoryStrip: {
        backgroundColor: '#0F172A',
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        paddingVertical: 6,
    },
    categoryStripInner: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 24,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: Platform.select({ web: 'space-between', default: 'flex-start' }),
        gap: 12,
    },
    mainNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexWrap: 'wrap',
    },
    mainNavItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    mainNavItemActive: {
        backgroundColor: '#2563EB', // Vibrant Blue background
    },
    mainNavItemInactive: {
        backgroundColor: '#1E293B',
    },
    backHomeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 8,
    },
    backHomeBtnText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    mainNavText: {
        fontSize: 13,
    },
    navBadgeDot: {
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    navBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
    navDivider: { width: 1, height: 20, backgroundColor: '#334155' },

    navLinksRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
    navLinkItem: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    navLinkItemActive: {
        backgroundColor: '#2563EB',
    },
    navLinkText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
    navLinkTextActive: { color: '#FFFFFF', fontWeight: '800' },
});
