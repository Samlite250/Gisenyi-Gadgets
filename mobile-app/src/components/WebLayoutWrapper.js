import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import WebHeader from './WebHeader';
import WebFooter from './WebFooter';
import TrustBadges from './TrustBadges';

export default function WebLayoutWrapper({
    children,
    navigation,
    onSearch,
    activeCategory,
    onSelectCategory,
    showTrustBadges = true,
    showFooter = true,
}) {
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width >= 768;

    if (!isDesktop) {
        return (
            <View style={{ flex: 1, width: '100%' }}>
                {children}
            </View>
        );
    }

    return (
        <View style={styles.webPageOuter}>
            {/* Desktop Header */}
            <WebHeader
                navigation={navigation}
                onSearch={onSearch}
                activeCategory={activeCategory}
                onSelectCategory={onSelectCategory}
            />

            {/* Main Centered Content Container */}
            <View style={styles.webContentContainer}>
                {children}
            </View>

            {/* Trust & Feature Badges */}
            {showTrustBadges && <TrustBadges />}

            {/* Desktop Footer */}
            {showFooter && <WebFooter navigation={navigation} />}
        </View>
    );
}

const styles = StyleSheet.create({
    webPageOuter: {
        flex: 1,
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
    },
    webContentContainer: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
});
