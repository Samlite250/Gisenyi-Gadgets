import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView as ExpoBlurView } from 'expo-blur';

export const BlurView = ({ children, intensity = 50, tint = 'light', style, ...props }) => {
  if (Platform.OS === 'web') {
    // Web fallback with CSS backdrop-filter
    const webStyle = [
      {
        backgroundColor: tint === 'light'
          ? `rgba(255, 255, 255, ${Math.min(intensity / 100, 0.95)})`
          : tint === 'dark'
          ? `rgba(0, 0, 0, ${Math.min(intensity / 100, 0.95)})`
          : `rgba(128, 128, 128, ${Math.min(intensity / 100, 0.95)})`,
        backdropFilter: `blur(${Math.max(intensity / 5, 10)}px)`,
        WebkitBackdropFilter: `blur(${Math.max(intensity / 5, 10)}px)`, // Safari support
      },
      style,
    ];

    return (
      <View style={webStyle} {...props}>
        {children}
      </View>
    );
  }

  // Native iOS/Android - use expo-blur
  return (
    <ExpoBlurView intensity={intensity} tint={tint} style={style} {...props}>
      {children}
    </ExpoBlurView>
  );
};
