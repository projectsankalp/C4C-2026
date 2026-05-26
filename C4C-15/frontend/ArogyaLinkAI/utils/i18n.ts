import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from '../locales/en.json';
import ml from '../locales/ml.json';
import kn from '../locales/kn.json';

const resources = {
  en: { translation: en },
  ml: { translation: ml },
  kn: { translation: kn },
};

const initI18n = async () => {
  let savedLanguage = await SecureStore.getItemAsync('language');

  if (!savedLanguage) {
    const deviceLocales = Localization.getLocales();
    if (deviceLocales && deviceLocales.length > 0) {
      savedLanguage = deviceLocales[0].languageCode;
    }
  }

  // Fallback to English if the language is not supported
  if (!['en', 'ml', 'kn'].includes(savedLanguage || '')) {
    savedLanguage = 'en';
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4', // Crucial for React Native
    resources,
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React handles escaping
    },
  });
};

initI18n();

export default i18n;
