import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';

export const BlurView = ({ children, intensity = 50, tint = 'light', style, ...props }) => {
  if (Platform.OS === 'web' || Platform.OS === 'android') {
    // Web & Android fallback to clean semi-transparent background for 100% stability
    const fallbackStyle = [
      {
        backgroundColor: tint === 'light'
          ? `rgba(255, 255, 255, ${Math.min((intensity || 50) / 100 + 0.35, 0.95)})`
          : `rgba(15, 23, 42, ${Math.min((intensity || 50) / 100 + 0.35, 0.95)})`,
        ...(Platform.OS === 'web' ? {
          backdropFilter: `blur(${Math.max(intensity / 5, 10)}px)`,
          WebkitBackdropFilter: `blur(${Math.max(intensity / 5, 10)}px)`,
        } : {}),
      },
      style,
    ];

    return (
      <View style={fallbackStyle} {...props}>
        {children}
      </View>
    );
  }

  // Native iOS - use expo-blur
  return (
    <ExpoBlurView intensity={intensity} tint={tint} style={style} {...props}>
      {children}
    </ExpoBlurView>
  );
};
