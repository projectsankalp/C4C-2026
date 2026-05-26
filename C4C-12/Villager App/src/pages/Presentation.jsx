/**
 * src/pages/Presentation.jsx
 * Presentation screen for detailed doctor advice.
 * Displays condition explanation, patient actions checklist, and a WhatsApp share trigger.
 */

import React, { useContext } from 'react';
import { Share2, ClipboardList, CheckCircle, Calendar, ArrowLeft } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { ADVICE_TEXTS } from '../utils/constants';

export default function Presentation({ patient, onBack }) {
  const { t, lang } = useLanguage();

  if (!patient) return null;

  const risk = patient.riskLevel || 'GREEN';
  const advice = ADVICE_TEXTS[lang]?.[risk] || ADVICE_TEXTS.en[risk];

  const getRiskColor = (level) => {
    switch (level) {
      case 'RED':
        return '#EF4444';
      case 'YELLOW':
        return '#F59E0B';
      case 'GREEN':
      default:
        return '#22C55E';
    }
  };

  const getRiskBackground = (level) => {
    switch (level) {
      case 'RED':
        return 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)';
      case 'YELLOW':
        return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      case 'GREEN':
      default:
        return 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)';
    }
  };

  const getCheckupDays = () => {
    if (!patient.nextScreeningDate) return 30;
    const diff = new Date(patient.nextScreeningDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const checkupDays = getCheckupDays();

  // Generate WhatsApp Share message
  const handleShare = () => {
    const textHeader = `*GraamSehat Medical Advice - ${advice.title}*\n\n`;
    const explanation = `*Explanation:*\n${advice.explanation}\n\n`;
    const meaning = `*What this means for you:*\n${advice.meaning}\n\n`;
    const actions = `*Actions to take:*\n` + advice.actions.map((act, idx) => `${idx + 1}. ${act}`).join('\n') + `\n\n`;
    const checkup = `*Next Checkup:* Scheduled in ${checkupDays} days.`;

    const fullMessage = encodeURIComponent(textHeader + explanation + meaning + actions + checkup);
    window.open(`https://wa.me/?text=${fullMessage}`, '_blank');
  };

  return (
    <div className="page-container presentation-page animate-slide-in">
      <div className="page-header-nav absolute-header">
        <button className="btn-icon back-btn bg-white-trans" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-white" />
        </button>
      </div>

      {/* Large Coloured Risk Header */}
      <div 
        className="presentation-hero-header"
        style={{ background: getRiskBackground(risk) }}
      >
        <span className="pres-risk-tag">{t('dashboard.riskTitle')}</span>
        <h2 className="pres-risk-title">{advice.title}</h2>
      </div>

      <div className="presentation-body scrollbar-none">
        
        {/* Paragraph 1 & 2 Explanations */}
        <div className="advice-explanations glass-panel">
          <h3 className="section-card-title">{t('presentation.explanation')}</h3>
          <p className="advice-paragraph">{advice.explanation}</p>
          <p className="advice-paragraph">{advice.meaning}</p>
        </div>

        {/* 5-Step Action Checklist */}
        <div className="advice-actions-card glass-panel">
          <h3 className="section-card-title">
            <ClipboardList size={20} className="text-teal" style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} />
            {t('presentation.actionsChecklist')}
          </h3>
          <ul className="advice-actions-list">
            {advice.actions.map((action, idx) => (
              <li key={idx} className="advice-action-item">
                <CheckCircle size={20} className="action-check-icon text-teal" />
                <span className="action-item-text">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Appointment Countdown Card */}
        <div className="next-appt-reminder-box">
          <Calendar size={24} className="text-teal" />
          <p className="reminder-text">
            {t('presentation.nextApptReminder', { days: checkupDays })}
          </p>
        </div>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="btn-primary share-advice-btn"
        >
          <Share2 size={20} />
          <span>{t('presentation.shareNote')}</span>
        </button>

      </div>
    </div>
  );
}
