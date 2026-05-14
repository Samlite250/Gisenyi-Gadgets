import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation, onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else {
        navigation.replace('Onboarding');
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation, onFinish]);

  return (
    <View style={styles.container}>
      {/* Abstract Background Shapes */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <View style={[styles.blob, styles.blob3]} />

      <SafeAreaView style={styles.safe}>
        <BlurView intensity={60} tint="light" style={styles.glassCard}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.title}>GISENYI</Text>
              <Text style={styles.subtitle}>GADGETS</Text>
            </View>
            
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4285F4" />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.tagline}>Shop Smart. Live Better.</Text>
          </View>
        </BlurView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.6,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: '#E0F2FE',
    top: -50,
    left: -50,
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: '#DCFCE7',
    bottom: 50,
    right: -30,
  },
  blob3: {
    width: 200,
    height: 200,
    backgroundColor: '#EFF6FF',
    top: height * 0.3,
    right: 20,
  },
  glassCard: {
    width: width * 0.85,
    height: height * 0.6,
    borderRadius: 32,
    padding: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logo: {
    width: 90,
    height: 90,
  },
  textWrapper: {
    marginTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 1,
    marginTop: -8,
  },
  loaderContainer: {
    marginTop: 48,
  },
  footer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
