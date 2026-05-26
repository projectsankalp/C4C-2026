/**
 * src/components/LanguageSwitcher.jsx
 * Custom selector for the 5 supported Indian languages:
 * English, Kannada, Hindi, Tamil, and Telugu.
 * Uses large touch targets for easy usability.
 */

import React from 'react';
import useLanguage from '../hooks/useLanguage';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const options = [
    { code: 'en', label: 'EN' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'te', label: 'తెలుగు' }
  ];

  return (
    <div className="language-switcher-container">
      <div className="lang-switcher-grid">
        {options.map((opt) => {
          const isActive = lang === opt.code;
          return (
            <button
              key={opt.code}
              onClick={() => setLang(opt.code)}
              className={`lang-btn ${isActive ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
