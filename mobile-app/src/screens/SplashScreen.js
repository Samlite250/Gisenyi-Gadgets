import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

// Custom Gisenyi Gadgets Logo matching the design
const GisenyiLogo = ({ size = 120 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* The Blue Bag Body */}
    <Rect x="20" y="45" width="60" height="45" rx="8" fill="#4285F4" />
    
    {/* The White Line inside the bag */}
    <Path d="M 20 60 L 80 60" stroke="#FFFFFF" strokeWidth="4" />

    {/* The Green 'G' Handle */}
    <Path 
      d="M 65 45 V 30 C 65 18.954 56.046 10 45 10 C 33.954 10 25 18.954 25 30 V 45" 
      stroke="#34A853" 
      strokeWidth="12" 
      strokeLinecap="round"
      fill="none"
    />
    {/* Inner part of G */}
    <Path 
      d="M 50 30 H 65 V 45" 
      stroke="#34A853" 
      strokeWidth="12" 
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export default function SplashScreen({ navigation, onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else {
        navigation.replace('Onboarding');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation, onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GisenyiLogo size={100} />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>GISENYI</Text>
          <Text style={styles.subtitle}>GADGETS</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.tagline}>Shop Smart. Live Better.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light Theme Background
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    marginTop: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800', // Poppins Bold equivalent
    color: '#4285F4',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#34A853',
    letterSpacing: 1,
    marginTop: -8,
  },
  footer: {
    marginBottom: 40,
  },
  tagline: {
    fontSize: 16,
    color: '#5F6368', // Text Gray
    fontWeight: '500',
  },
});
