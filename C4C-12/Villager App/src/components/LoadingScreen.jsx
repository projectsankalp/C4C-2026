/**
 * src/components/LoadingScreen.jsx
 * Centered loader screen featuring the brand styling and messages.
 */

import React from 'react';
import useLanguage from '../hooks/useLanguage';

export default function LoadingScreen({ message }) {
  const { t } = useLanguage();

  return (
    <div className="loading-screen-container">
      <div className="loader-box">
        <div className="teal-spinner animate-spin-slow"></div>
        <p className="loader-text">{message || t('common.loading')}</p>
      </div>
    </div>
  );
}
