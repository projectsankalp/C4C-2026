/**
 * src/pages/Appointment.jsx
 * Screen displaying the next appointment details, countdown progress, 
 * ASHA worker dialer, and notification reminder settings.
 */

import React, { useContext, useState } from 'react';
import { Phone, BellRing, AlertCircle, Calendar, ArrowLeft } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { PatientContext } from '../context/PatientContext';

export default function Appointment({ patient, onBack }) {
  const { t } = useLanguage();
  const { requestNotificationPermission } = useContext(PatientContext);
  const [reminderStatus, setReminderStatus] = useState('');

  if (!patient) return null;

  // Calculate checkup countdown days
  const getDaysInfo = () => {
    if (!patient.nextScreeningDate) return { days: 0, overdue: false };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(patient.nextScreeningDate);
    targetDate.setHours(0, 0, 0, 0);

    const diff = targetDate - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return {
      days: days > 0 ? days : 0,
      overdue: days < 0
    };
  };

  const { days: countdownDays, overdue } = getDaysInfo();

  // Calculate progress bar percentage
  const getProgressPercent = () => {
    if (!patient.lastScreeningDate || !patient.nextScreeningDate) return 50;

    const start = new Date(patient.lastScreeningDate).getTime();
    const end = new Date(patient.nextScreeningDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  const progressPercent = getProgressPercent();

  const handleSetReminder = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setReminderStatus(t('appointment.reminderSuccess'));
    } else {
      setReminderStatus(t('appointment.reminderFailed'));
    }
    setTimeout(() => setReminderStatus(''), 4000);
  };

  return (
    <div className="page-container appointment-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="appointment-main scrollbar-none">
        <h2 className="page-title">{t('appointment.title')}</h2>

        {/* Overdue alert card */}
        {overdue ? (
          <div className="appointment-alert-card bg-red-light animate-scale-in">
            <AlertCircle size={28} className="text-red" />
            <div className="alert-card-text">
              <h4>{t('appointment.overdueAlert')}</h4>
            </div>
          </div>
        ) : (
          <div className="appointment-countdown-card glass-panel">
            <Calendar size={36} className="text-teal animate-float" />
            <h3 className="countdown-number">{countdownDays}</h3>
            <p className="countdown-label">{t('appointment.countdown', { days: countdownDays })}</p>
          </div>
        )}

        {/* Visit Progress Bar */}
        <div className="appointment-progress-card glass-panel">
          <span className="progress-bar-label">{t('appointment.progressBar')}</span>
          <div className="progress-bar-track">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%`, backgroundColor: overdue ? '#EF4444' : '#0D9488' }}
            />
          </div>
          <div className="progress-bar-dates">
            <span>{patient.lastScreeningDate ? new Date(patient.lastScreeningDate).toLocaleDateString() : 'Start'}</span>
            <span>{patient.nextScreeningDate ? new Date(patient.nextScreeningDate).toLocaleDateString() : 'End'}</span>
          </div>
        </div>

        {/* ASHA contact card */}
        <div className="asha-contact-card glass-card">
          <span className="asha-card-tag">{t('appointment.ashaCardTitle')}</span>
          <div className="asha-profile-row">
            <div className="asha-avatar">
              <span>{patient.ashaWorkerName ? patient.ashaWorkerName[0] : 'A'}</span>
            </div>
            <div className="asha-name-box">
              <h4 className="asha-name">{patient.ashaWorkerName || 'ASHA Worker'}</h4>
              <p className="asha-phone-sub">{patient.ashaWorkerPhone || '+91-9988776655'}</p>
            </div>
            {patient.ashaWorkerPhone && (
              <a 
                href={`tel:${patient.ashaWorkerPhone}`}
                className="btn-icon call-asha-btn"
                aria-label={t('appointment.callAsha')}
              >
                <Phone size={20} className="text-white" />
              </a>
            )}
          </div>
        </div>

        {/* Set reminder button */}
        <button 
          onClick={handleSetReminder}
          className="btn-outline set-reminder-btn"
        >
          <BellRing size={20} style={{ marginRight: '8px' }} />
          <span>{t('appointment.setReminder')}</span>
        </button>

        {reminderStatus && (
          <p className="reminder-status-msg animate-scale-in">
            {reminderStatus}
          </p>
        )}

      </div>
    </div>
  );
}
