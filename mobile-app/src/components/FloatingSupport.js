import React, { useEffect, useRef } from 'react';
import { 
  TouchableOpacity, StyleSheet, View, Text, 
  Animated, Easing 
} from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function FloatingSupport() {
  const navigation = useNavigation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Show label briefly after mount
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(labelAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(labelAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.labelWrap, { opacity: labelAnim, transform: [{ translateY: labelAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
        <View style={styles.label}>
          <Text style={styles.labelText}>How can we help?</Text>
        </View>
        <View style={styles.labelArrow} />
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity 
          style={styles.fab} 
          activeOpacity={0.9} 
          onPress={() => navigation.navigate('ChatSupport')}
        >
          <MessageCircle size={26} color="#fff" strokeWidth={2.5} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 9999,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
    elevation: 8,
    ...Platform.select({
      default: { shadowColor: COLORS.primaryBlue },
      web: { boxShadow: `0px 4px 12px rgba(66, 133, 244, 0.4)` }
    }),
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  labelWrap: {
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  label: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  labelArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1F2937',
    marginRight: 22,
  },
});
