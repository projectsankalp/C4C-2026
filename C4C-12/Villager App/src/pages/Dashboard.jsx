/**
 * src/pages/Dashboard.jsx
 * Main dashboard screen.
 * Displays patient details, risk status card, quick metrics grid, advice previews, and action buttons.
 */

import React, { useContext } from 'react';
import { Bell, Heart, Activity, Calendar, ClipboardCheck, ArrowRight, BookOpen, Share2, AlertOctagon } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import RiskBadge from '../components/RiskBadge';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ patient, screenings, medicines, streak, onNavigate }) {
  const { t, lang } = useLanguage();

  if (!patient) return null;

  // Extract initials for avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'GS';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Truncate Doctor Note helper
  const getTruncatedAdvice = () => {
    let note = '';
    if (patient.doctorsNote) {
      if (typeof patient.doctorsNote === 'string') {
        note = patient.doctorsNote;
      } else if (typeof patient.doctorsNote === 'object') {
        note = patient.doctorsNote[lang] || patient.doctorsNote.en || patient.doctorsNote.explanation || '';
      }
    }
    if (!note) return 'Follow healthy lifestyle habits and visit local sub-centre for screenings.';
    return note.length > 90 ? `${note.substring(0, 90)}...` : note;
  };

  // Blood Sugar status label
  const getSugarStatusLabel = (level) => {
    const gl = parseInt(level, 10);
    if (gl >= 140) return t('dashboard.metricSugarHigh');
    return t('dashboard.metricSugarNormal');
  };

  // Days until next checkup calculation
  const getCheckupCountdownDays = () => {
    if (!patient.nextScreeningDate) return 0;
    const diff = new Date(patient.nextScreeningDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const checkupDays = getCheckupCountdownDays();

  // Highlight language labels
  const getLangBadgeLabel = (code) => {
    const maps = { en: 'EN', kn: 'ಕನ್ನಡ', hi: 'हिंदी', ta: 'தமிழ்', te: 'తెలుగు' };
    return maps[code] || code.toUpperCase();
  };

  return (
    <div className="page-container dashboard-page animate-fade-in">
      {/* Top Bar Navigation */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="avatar-circle">
            <span>{getInitials(patient.name)}</span>
          </div>
          <div className="patient-meta-greeting">
            <span className="greeting-sub">{t('dashboard.greeting')}</span>
            <h2 className="greeting-name">{patient.name}</h2>
          </div>
        </div>
        <div className="header-right">
          <span className="header-lang-badge">
            {getLangBadgeLabel(lang)}
          </span>
          <button 
            className="btn-icon notification-bell"
            onClick={() => onNavigate('appointment')}
            aria-label="Notifications"
          >
            <Bell size={24} className="text-teal" />
          </button>
        </div>
      </header>

      <div className="dashboard-content-scroll scrollbar-none">
        
        {/* Section 1: Risk Status Card */}
        <section className="dashboard-section section-risk-badge">
          <RiskBadge
            riskLevel={patient.riskLevel}
            idrsScore={patient.idrsScore}
            lastScreeningDate={patient.lastScreeningDate}
            onClick={() => onNavigate('presentation')}
          />
        </section>

        {/* Section 2: Quick Metrics (2x2 Grid) */}
        <section className="dashboard-section section-metrics">
          <div className="metrics-grid-2x2">
            <MetricCard
              title={t('dashboard.metricBp')}
              value={`${patient.bpSystolic}/${patient.bpDiastolic}`}
              subValue="mmHg"
              icon={Heart}
              status={patient.bpSystolic >= 140 || patient.bpDiastolic >= 90 ? 'RED' : 'GREEN'}
              onClick={() => onNavigate('history')}
            />
            <MetricCard
              title={t('dashboard.metricSugar')}
              value={`${patient.glucoseLevel} mg/dL`}
              subValue={getSugarStatusLabel(patient.glucoseLevel)}
              icon={Activity}
              status={patient.glucoseLevel >= 140 ? 'RED' : 'GREEN'}
              onClick={() => onNavigate('history')}
            />
            <MetricCard
              title={t('dashboard.metricCheckup')}
              value={checkupDays <= 0 ? 'Overdue' : t('dashboard.metricCheckupDays', { days: checkupDays })}
              subValue={checkupDays <= 0 ? 'ASHA alert' : 'Days left'}
              icon={Calendar}
              status={checkupDays <= 0 ? 'RED' : checkupDays <= 30 ? 'YELLOW' : 'GREEN'}
              onClick={() => onNavigate('appointment')}
            />
            <MetricCard
              title={t('dashboard.metricMeds')}
              value={t('dashboard.metricMedsCount', { count: medicines.length })}
              subValue={`${streak} day streak`}
              icon={ClipboardCheck}
              status={medicines.length > 0 ? 'YELLOW' : 'GREEN'}
              onClick={() => onNavigate('medicine')}
            />
          </div>
        </section>

        {/* Section 3: Doctor's Note Preview */}
        <section className="dashboard-section section-doctors-advice">
          <div className="glass-card advice-preview-card" onClick={() => onNavigate('presentation')}>
            <h3 className="section-card-title">{t('dashboard.docNoteTitle')}</h3>
            <p className="advice-preview-text">
              {getTruncatedAdvice()}
            </p>
            <div className="read-more-link">
              <span>{t('dashboard.readFullNote')}</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </section>

        {/* Section 4: Quick Actions (Horizontal scrollable) */}
        <section className="dashboard-section section-quick-actions">
          <h3 className="section-title">{t('dashboard.quickActions')}</h3>
          <div className="quick-actions-horizontal scrollbar-none">
            <button className="action-btn-item" onClick={() => onNavigate('appointment')}>
              <div className="action-icon-box bg-teal-light">
                <Calendar size={22} className="text-teal" />
              </div>
              <span className="action-lbl">{t('dashboard.actionBook')}</span>
            </button>

            <button className="action-btn-item" onClick={() => onNavigate('medicine')}>
              <div className="action-icon-box bg-yellow-light">
                <ClipboardCheck size={22} className="text-yellow" />
              </div>
              <span className="action-lbl">{t('dashboard.actionMeds')}</span>
            </button>

            <button className="action-btn-item" onClick={() => onNavigate('share')}>
              <div className="action-icon-box bg-teal-light">
                <Share2 size={22} className="text-teal" />
              </div>
              <span className="action-lbl">{t('dashboard.actionShare')}</span>
            </button>

            <button className="action-btn-item" onClick={() => onNavigate('emergency')}>
              <div className="action-icon-box bg-red-light">
                <AlertOctagon size={22} className="text-red" />
              </div>
              <span className="action-lbl">{t('dashboard.actionEmergency')}</span>
            </button>

            <button className="action-btn-item" onClick={() => onNavigate('education')}>
              <div className="action-icon-box bg-teal-light">
                <BookOpen size={22} className="text-teal" />
              </div>
              <span className="action-lbl">{t('dashboard.actionEducation')}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
