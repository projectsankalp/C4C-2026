/**
 * src/pages/Welcome.jsx
 * Splash screen shown to users on launch.
 * Displays logo, localized taglines, a start button, and language selectors.
 */

import React, { useState } from 'react';
import useLanguage from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { seedDemoDataToFirestore } from '../firebase/patients';
import { Database, CheckCircle2, Loader2 } from 'lucide-react';

export default function Welcome({ onGetStarted }) {
  const { t } = useLanguage();
  const [seedingStatus, setSeedingStatus] = useState('idle'); // 'idle' | 'seeding' | 'success' | 'error'

  const handleSeedData = async () => {
    setSeedingStatus('seeding');
    try {
      await seedDemoDataToFirestore();
      setSeedingStatus('success');
      setTimeout(() => setSeedingStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setSeedingStatus('error');
      setTimeout(() => setSeedingStatus('idle'), 5000);
    }
  };

  return (
    <div className="page-container welcome-page animate-fade-in">
      <div className="welcome-main-content">
        {/* Brand Logo & Presentation */}
        <div className="logo-container animate-float">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="brand-svg-logo"
            width="120"
            height="120"
          >
            <circle cx="50" cy="50" r="45" fill="#0D9488" fillOpacity="0.1" />
            <circle cx="50" cy="50" r="38" fill="#0D9488" fillOpacity="0.2" />
            <path d="M 50 82.5 C 50 82.5 22.5 61.5 22.5 42.5 C 22.5 30 32.5 20 45 20 C 50 20 54 22.5 56.5 25.5" fill="none" stroke="#0D9488" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 60 21.5 C 62.5 20 67.5 20 72.5 20 C 85 20 95 30 95 42.5 C 95 61.5 67.5 82.5 67.5 82.5 C 67.5 82.5 59.5 76.5 51 68" fill="none" stroke="#0D9488" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 23 57.5 L 39.5 57.5 L 45 39.5 L 50 75.5 L 55.5 48.5 L 60 61 L 67 57.5 L 77 57.5" fill="none" stroke="#0D9488" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="welcome-app-name">{t('common.appName')}</h1>
          <p className="welcome-tagline">{t('common.tagline')}</p>
        </div>

        {/* Action button */}
        <div className="welcome-action-box">
          <button 
            className="btn-primary welcome-start-btn" 
            onClick={onGetStarted}
          >
            {t('common.getStarted')}
          </button>

          <button
            type="button"
            className={`btn-secondary welcome-seed-btn ${seedingStatus}`}
            onClick={handleSeedData}
            disabled={seedingStatus === 'seeding'}
            style={{ marginTop: '12px', fontSize: '14px', minHeight: '44px' }}
          >
            {seedingStatus === 'idle' && (
              <>
                <Database size={16} className="text-teal" />
                <span>Initialize Demo Data in DB</span>
              </>
            )}
            {seedingStatus === 'seeding' && (
              <>
                <Loader2 size={16} className="animate-spin text-teal" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Seeding Firestore...</span>
              </>
            )}
            {seedingStatus === 'success' && (
              <>
                <CheckCircle2 size={16} className="text-success" />
                <span className="text-success">Seeding Successful!</span>
              </>
            )}
            {seedingStatus === 'error' && (
              <span className="text-red">Error Seeding. Check console.</span>
            )}
          </button>
        </div>
      </div>

      {/* Language Selector at bottom */}
      <div className="welcome-footer">
        <span className="lang-footer-lbl">{t('welcome.selectLanguage')}</span>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
