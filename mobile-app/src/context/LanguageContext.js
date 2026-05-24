import React, { createContext, useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { saveLanguage } from '../locales/i18n';

const LanguageContext = createContext();

export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
  },
  {
    code: 'rw',
    name: 'Kinyarwanda',
    nativeName: 'Ikinyarwanda',
    flag: '🇷🇼',
  },
];

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = async (languageCode) => {
    try {
      setIsChanging(true);
      await i18n.changeLanguage(languageCode);
      await saveLanguage(languageCode);
      setCurrentLanguage(languageCode);

      // Show success message
      Alert.alert(
        t('common.success'),
        t('language.languageChanged'),
        [{ text: t('common.done') }]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert(
        t('common.error'),
        t('errors.unknown'),
        [{ text: t('common.done') }]
      );
    } finally {
      setIsChanging(false);
    }
  };

  const getCurrentLanguageData = () => {
    return LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
  };

  const value = {
    currentLanguage,
    currentLanguageData: getCurrentLanguageData(),
    languages: LANGUAGES,
    changeLanguage,
    isChanging,
    t, // Expose translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
