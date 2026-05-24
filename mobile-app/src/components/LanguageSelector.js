import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Check, Globe, X } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function LanguageSelector() {
  const { languages, currentLanguage, changeLanguage, isChanging, t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  const openModal = () => {
    setVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleSelectLanguage = async (code) => {
    if (code !== currentLanguage) {
      await changeLanguage(code);
    }
    closeModal();
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <>
      {/* Language Selector Button */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <View style={styles.selectorLeft}>
          <View style={styles.iconBox}>
            <Globe size={20} color={COLORS.textSecondary} />
          </View>
          <View>
            <Text style={styles.selectorLabel}>{t('settings.language')}</Text>
            <Text style={styles.selectorValue}>{currentLang.nativeName}</Text>
          </View>
        </View>
        <View style={styles.flagCircle}>
          <Text style={styles.flagEmoji}>{currentLang.flag}</Text>
        </View>
      </TouchableOpacity>

      {/* Language Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <BlurView intensity={30} style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />

          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
                opacity: scaleAnim,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconCircle}>
                  <Globe size={24} color={COLORS.primaryBlue} />
                </View>
                <Text style={styles.modalTitle}>{t('language.changeLanguage')}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={styles.languageList}>
              {languages.map((language, index) => {
                const isSelected = language.code === currentLanguage;
                return (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      isSelected && styles.languageItemSelected,
                      index === languages.length - 1 && styles.languageItemLast,
                    ]}
                    onPress={() => handleSelectLanguage(language.code)}
                    disabled={isChanging}
                    activeOpacity={0.7}
                  >
                    <View style={styles.languageItemLeft}>
                      <View style={[
                        styles.flagCircleLarge,
                        isSelected && styles.flagCircleSelected
                      ]}>
                        <Text style={styles.flagEmojiLarge}>{language.flag}</Text>
                      </View>
                      <View style={styles.languageInfo}>
                        <Text style={[
                          styles.languageName,
                          isSelected && styles.languageNameSelected
                        ]}>
                          {language.nativeName}
                        </Text>
                        <Text style={styles.languageCode}>{language.name}</Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Subtitle */}
            <Text style={styles.modalSubtitle}>
              {t('settings.selectLanguage')}
            </Text>
          </Animated.View>
        </BlurView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 2,
    ...SHADOWS.light,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectorLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  flagCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.88,
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageList: {
    marginBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  languageItemSelected: {
    backgroundColor: '#EBF4FF',
  },
  languageItemLast: {
    marginBottom: 0,
  },
  languageItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagCircleLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  flagCircleSelected: {
    borderColor: COLORS.primaryBlue,
  },
  flagEmojiLarge: {
    fontSize: 28,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  languageNameSelected: {
    color: COLORS.primaryBlue,
  },
  languageCode: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
