import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ShoppingBag size={80} color="#4285F4" strokeWidth={1.5} />
        <Text style={styles.title}>GISENYI</Text>
        <Text style={styles.subtitle}>GADGETS</Text>
        <Text style={styles.tagline}>Shop Smart. Live Better.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4285F4',
    marginTop: 16,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34A853',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 24,
  },
});
