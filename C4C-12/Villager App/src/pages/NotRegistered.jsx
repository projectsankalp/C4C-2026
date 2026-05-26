/**
 * src/pages/NotRegistered.jsx
 * Screen shown when an entered Health ID is not registered.
 * Submits a request document to Firestore and informs the villager.
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Send } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { logUnregisteredRequest } from '../firebase/auth';

export default function NotRegistered({ unregisteredUID, onBack }) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-submit request with default empty phone on mount
  useEffect(() => {
    if (unregisteredUID) {
      logUnregisteredRequest(unregisteredUID, '');
    }
  }, [unregisteredUID]);

  const handleManualPhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone) return;

    setLoading(true);
    const success = await logUnregisteredRequest(unregisteredUID, phone);
    setLoading(false);
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="page-container not-registered-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="not-registered-main">
        <div className="warning-badge-wrapper animate-float">
          <div className="warning-outer-ring">
            <AlertCircle size={64} className="warning-icon text-yellow" />
          </div>
        </div>

        <h2 className="not-registered-title">{t('notRegistered.warning')}</h2>
        <p className="not-registered-explanation">{t('notRegistered.explanation')}</p>
        <p className="not-registered-subtext">{t('notRegistered.subtext')}</p>

        {/* Optional Phone Entry Form */}
        {!submitted ? (
          <form onSubmit={handleManualPhoneSubmit} className="unregistered-phone-form glass-card">
            <label htmlFor="user-phone">{t('settings.phoneLabel')}</label>
            <div className="phone-input-row">
              <input
                id="user-phone"
                type="tel"
                placeholder="Enter your phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
              />
              <button 
                type="submit" 
                className={`btn-primary send-phone-btn ${loading ? 'btn-loading' : ''}`}
                disabled={phone.length < 10}
              >
                <Send size={18} />
              </button>
            </div>
            <p className="field-helper-text">Providing your phone helps the ASHA worker call you.</p>
          </form>
        ) : (
          <div className="request-logged-badge animate-scale-in">
            <span>Request Updated with Phone!</span>
          </div>
        )}

        <button 
          onClick={onBack}
          className="btn-secondary not-registered-back-btn"
        >
          {t('notRegistered.goBack')}
        </button>
      </div>
    </div>
  );
}
