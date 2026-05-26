/**
 * src/pages/Settings.jsx
 * Application settings page.
 * Manages language switcher, notification toggles, user accounts summary, and database wipes.
 */

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Bell, Shield, Info, LogOut, ArrowLeft } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Settings({ patient, familyMembers, onClearData, onBack }) {
  const { t } = useLanguage();
  
  // Local states for notification preferences (synced to localStorage)
  const [notifMeds, setNotifMeds] = useState(() => {
    return localStorage.getItem('graamsehat_notif_meds') !== 'false';
  });
  
  const [notifAppt, setNotifAppt] = useState(() => {
    return localStorage.getItem('graamsehat_notif_appt') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('graamsehat_notif_meds', notifMeds.toString());
  }, [notifMeds]);

  useEffect(() => {
    localStorage.setItem('graamsehat_notif_appt', notifAppt.toString());
  }, [notifAppt]);

  const handleClearData = () => {
    const confirmWipe = window.confirm(t('settings.clearWarning'));
    if (confirmWipe) {
      onClearData();
    }
  };

  if (!patient) return null;

  return (
    <div className="page-container settings-page animate-fade-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="settings-body scrollbar-none">
        <h2 className="page-title">{t('settings.title')}</h2>

        {/* Language Selection Card */}
        <div className="settings-card glass-panel">
          <div className="card-sec-header">
            <Globe size={20} className="text-teal" />
            <h3>{t('settings.language')}</h3>
          </div>
          <div className="divider" />
          <LanguageSwitcher />
        </div>

        {/* Notifications Toggle Card */}
        <div className="settings-card glass-panel">
          <div className="card-sec-header">
            <Bell size={20} className="text-teal" />
            <h3>{t('settings.notifications')}</h3>
          </div>
          <div className="divider" />
          <div className="toggle-options-list">
            <div className="toggle-option-item">
              <span className="toggle-lbl">{t('settings.notifMeds')}</span>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={notifMeds}
                  onChange={(e) => setNotifMeds(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
            
            <div className="toggle-option-item">
              <span className="toggle-lbl">{t('settings.notifAppt')}</span>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={notifAppt}
                  onChange={(e) => setNotifAppt(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Account Metadata Card */}
        <div className="settings-card glass-panel">
          <div className="card-sec-header">
            <Shield size={20} className="text-teal" />
            <h3>{t('settings.accountInfo')}</h3>
          </div>
          <div className="divider" />
          <div className="account-details-grid">
            <div className="account-detail-row">
              <span>{t('settings.uidLabel')}</span>
              <strong>{patient.uid}</strong>
            </div>
            <div className="account-detail-row">
              <span>{t('settings.phoneLabel')}</span>
              <strong>+91-{patient.phone || 'N/A'}</strong>
            </div>
            <div className="account-detail-row">
              <span>{t('settings.familyCount')}</span>
              <strong>{familyMembers.length}</strong>
            </div>
          </div>
        </div>

        {/* Actions Button */}
        <button 
          onClick={handleClearData}
          className="btn-error clear-data-btn"
        >
          <LogOut size={20} />
          <span>{t('settings.clearBtn')}</span>
        </button>

        {/* Version Display */}
        <div className="app-version-box">
          <Info size={14} className="text-muted" style={{ marginRight: '4px' }} />
          <span>{t('settings.version')}: <strong>1.0.0 (PWA)</strong></span>
        </div>

      </div>
    </div>
  );
}
