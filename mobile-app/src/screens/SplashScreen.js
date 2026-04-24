import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={{ width: 120, height: 120 }} 
          resizeMode="contain"
        />
        <View style={styles.textWrapper}>
          <Text style={styles.title}>GISENYI</Text>
          <Text style={styles.subtitle}>GADGETS</Text>
        </View>
        
        {/* Rolling Loading Item */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
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
  loaderContainer: {
    marginTop: 40,
  },
  footer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#5F6368', // Text Gray
    fontWeight: '500',
  },
});
