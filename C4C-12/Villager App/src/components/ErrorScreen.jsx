/**
 * src/components/ErrorScreen.jsx
 * Full-screen error handler showing problems and providing retry paths.
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';

export default function ErrorScreen({ message, onRetry, onBack }) {
  const { t } = useLanguage();

  return (
    <div className="error-screen-container">
      <div className="error-box glass-card animate-scale-in">
        <AlertCircle size={48} className="text-red animate-bounce-spring" style={{ margin: '0 auto 16px' }} />
        <h3 className="error-title">{t('common.error')}</h3>
        <p className="error-message">{message || 'Something went wrong.'}</p>
        
        <div className="error-actions">
          {onRetry && (
            <button className="btn-primary" onClick={onRetry}>
              Retry
            </button>
          )}
          {onBack && (
            <button className="btn-secondary" onClick={onBack}>
              {t('common.goBack')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
