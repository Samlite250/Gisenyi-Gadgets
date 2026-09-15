import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle2, X, ShoppingCart } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function Toast() {
    const { toast, hideToast } = useCart();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (toast?.visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: -100,
                    duration: 250,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ]).start();
        }
    }, [toast?.visible]);

    if (!toast?.visible) return null;

    const product = toast?.product;
    const imageUri = product?.images?.[0] || product?.image;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                },
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.toastCard}>
                <View style={styles.iconContainer}>
                    <CheckCircle2 size={22} color="#10B981" />
                </View>

                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.productImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <ShoppingCart size={16} color={COLORS.textMuted} />
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {toast?.message || 'Added to Cart!'}
                    </Text>
                    {product?.name ? (
                        <Text style={styles.subtitle} numberOfLines={1}>
                            {product.name}
                        </Text>
                    ) : null}
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={hideToast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 35,
        left: 16,
        right: 16,
        zIndex: 99999,
        alignItems: 'center',
    },
    toastCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        maxWidth: 500,
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        ...SHADOWS.lg,
        ...(Platform.OS === 'web'
            ? {
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            }
            : {}),
    },
    iconContainer: {
        marginRight: 10,
    },
    productImage: {
        width: 36,
        height: 36,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#F1F5F9',
    },
    placeholderImage: {
        width: 36,
        height: 36,
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#F1F5F9',
        justify: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    closeBtn: {
        padding: 4,
        marginLeft: 8,
    },
});
