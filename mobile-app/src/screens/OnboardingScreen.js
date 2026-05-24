import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '../components/BlurView';
import { Smartphone, Headphones, Watch } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useLanguage();

  const SLIDES = [
    {
      id: '1',
      title: t('onboarding.slide1.title'),
      description: t('onboarding.slide1.description'),
      icon: Smartphone,
      color: '#3B82F6',
    },
    {
      id: '2',
      title: t('onboarding.slide2.title'),
      description: t('onboarding.slide2.description'),
      icon: Headphones,
      color: '#10B981',
    },
    {
      id: '3',
      title: t('onboarding.slide3.title'),
      description: t('onboarding.slide3.description'),
      icon: Watch,
      color: '#F59E0B',
    }
  ];

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
  const activeColor = SLIDES[currentIndex].color;

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blob1, { backgroundColor: activeColor + '30' }]} />
      <View style={[styles.blob, styles.blob2, { backgroundColor: activeColor + '20' }]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <BlurView intensity={40} style={styles.iconGlass}>
              <CurrentIcon size={100} color={activeColor} strokeWidth={1.5} />
            </BlurView>
          </View>
          
          <BlurView intensity={70} tint="light" style={styles.textGlass}>
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
                    currentIndex === index && [styles.activeDot, { backgroundColor: activeColor }]
                  ]} 
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: activeColor }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {currentIndex === SLIDES.length - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
              </Text>
            </TouchableOpacity>
          </BlurView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safe: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    borderRadius: 1000,
  },
  blob1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  blob2: {
    width: 350,
    height: 350,
    bottom: -50,
    left: -100,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  iconGlass: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  textGlass: {
    width: '100%',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 38,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 28,
  },
  button: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

