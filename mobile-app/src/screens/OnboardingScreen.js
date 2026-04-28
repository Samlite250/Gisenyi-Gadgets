import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Headphones, Watch } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Buy the best\ngadgets easily',
    description: 'Find electronics, accessories, clothes and more at the best prices.',
    icon: Smartphone,
  },
  {
    id: '2',
    title: 'Fast & Secure\nPayments',
    description: 'Multiple payment methods including Mobile Money and Cards.',
    icon: Headphones,
  },
  {
    id: '3',
    title: 'Quick Delivery\nto your Door',
    description: 'Track your orders in real-time and get them delivered fast.',
    icon: Watch,
  }
];

export default function OnboardingScreen({ navigation, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (onFinish) {
        onFinish();
      } else {
        navigation.replace('Login');
      }
    }
  };

  const CurrentIcon = SLIDES[currentIndex].icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CurrentIcon size={120} color="#0b66f8ff" strokeWidth={1} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
          <Text style={styles.description}>{SLIDES[currentIndex].description}</Text>
        </View>

        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index && styles.activeDot
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light Theme Background
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F5F5F5', // Light gray background to replace illustration space
    borderRadius: 24,
    marginBottom: 40,
    marginTop: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800', // Poppins Bold
    color: '#202124',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0', // Light Gray
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#4285F4',
  },
  button: {
    backgroundColor: '#4285F4',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    ...Platform.select({
      web: { boxShadow: '0px 4px 8px rgba(66,133,244,0.3)' },
      default: {
        shadowColor: '#4285F4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
