/**
 * src/context/LanguageContext.jsx
 * Context to manage active language, translations, and string replacement functions.
 */

import React, { createContext, useState, useEffect } from 'react';
import en from '../locales/en';
import kn from '../locales/kn';
import hi from '../locales/hi';
import ta from '../locales/ta';
import te from '../locales/te';

const translations = { en, kn, hi, ta, te };

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('graamsehat_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('graamsehat_lang', lang);
  }, [lang]);

  /**
   * Translates a dot-notation key path and handles variable interpolation.
   * @param {string} path - e.g. "dashboard.greeting"
   * @param {Object} replacements - e.g. { count: 5 }
   */
  const t = (path, replacements = {}) => {
    const parts = path.split('.');
    let current = translations[lang] || translations.en;
    
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        // Fallback to English if key doesn't exist in current language
        let fallback = translations.en;
        for (const fbPart of parts) {
          if (fallback && fallback[fbPart] !== undefined) {
            fallback = fallback[fbPart];
          } else {
            return path; // Key not found anywhere
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') return current;

    let text = current;
    Object.keys(replacements).forEach((key) => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
};
