import React from 'react';
import { View } from 'react-native';

// expo-blur has no web implementation — render a plain white/frosted View instead
export function BlurView({ children, style, tint, intensity, ...props }) {
  const bg =
    tint === 'dark'
      ? `rgba(0,0,0,${Math.min((intensity || 50) / 100, 0.7)})`
      : `rgba(255,255,255,${Math.min(0.4 + (intensity || 50) / 200, 0.95)})`;

  return (
    <View style={[{ backgroundColor: bg }, style]} {...props}>
      {children}
    </View>
  );
}
