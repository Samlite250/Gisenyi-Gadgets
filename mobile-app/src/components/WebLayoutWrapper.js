import React from 'react';
import { View, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
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

    const hoverStyle = `
    @property --bg-angle {
      syntax: "<angle>";
      initial-value: 0deg;
      inherits: false;
    }
    
    @keyframes spinBorder {
      100% { --bg-angle: 360deg; }
    }
    
    [data-hover="true"] {
      transition: transform 0.25s ease, box-shadow 0.25s ease !important;
    }
    
    [data-hover="true"]:hover {
      border-color: transparent !important;
      background: 
        linear-gradient(#ffffff, #ffffff) padding-box,
        conic-gradient(from var(--bg-angle), #4285F4 0%, #34A853 50%, #4285F4 100%) border-box !important;
      animation: spinBorder 2s linear infinite !important;
      transform: translateY(-4px) !important;
      box-shadow: 0 8px 16px -6px rgba(66, 133, 244, 0.3) !important;
      z-index: 10;
    }
    `;

    return (
        <View style={styles.webPageOuter}>
            {Platform.OS === 'web' && <style>{hoverStyle}</style>}
            {/* Sticky Desktop Header */}
            <View style={styles.stickyHeaderContainer}>
                <WebHeader
                    navigation={navigation}
                    onSearch={onSearch}
                    activeCategory={activeCategory}
                    onSelectCategory={onSelectCategory}
                />
            </View>

            {/* Single ScrollView owns ALL vertical scrolling on desktop */}
            <ScrollView
                style={styles.pageScroller}
                contentContainerStyle={styles.pageScrollerContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Centered content column */}
                <View style={styles.webContentContainer}>
                    {children}
                </View>

                {/* Trust & Feature Badges */}
                {showTrustBadges && <TrustBadges />}

                {/* Desktop Footer */}
                {showFooter && <WebFooter navigation={navigation} />}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    webPageOuter: {
        width: '100%',
        height: Platform.OS === 'web' ? '100vh' : '100%',
        backgroundColor: '#F8FAFC',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    stickyHeaderContainer: {
        zIndex: 1000,
        width: '100%',
        backgroundColor: '#FFFFFF',
        // position sticky via web style below
        ...(Platform.OS === 'web' ? { position: 'sticky', top: 0 } : {}),
    },
    pageScroller: {
        flex: 1,
    },
    pageScrollerContent: {
        flexGrow: 1,
    },
    webContentContainer: {
        maxWidth: 1280,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
    },
});

