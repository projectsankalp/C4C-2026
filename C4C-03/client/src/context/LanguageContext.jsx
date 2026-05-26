import { createContext, useContext, useState } from 'react';
import i18n from '../i18n/index.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
