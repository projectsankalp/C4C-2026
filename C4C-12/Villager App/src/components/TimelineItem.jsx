/**
 * src/components/TimelineItem.jsx
 * Individual screening timeline event, supporting an expandable drawer
 * for detailed IDRS breakdowns and doctors notes.
 */

import React, { useState } from 'react';
import { Calendar, User, ChevronDown, ChevronUp, Activity, Heart, Award } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';

export default function TimelineItem({ screening }) {
  const [expanded, setExpanded] = useState(false);
  const { t, lang } = useLanguage();

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

  const getRiskText = (level) => {
    switch (level) {
      case 'RED':
        return t('dashboard.riskRed');
      case 'YELLOW':
        return t('dashboard.riskYellow');
      case 'GREEN':
      default:
        return t('dashboard.riskGreen');
    }
  };

  const formattedDate = new Date(screening.date).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const bpHalf = `${screening.bpSystolic}/${screening.bpDiastolic}`;
  const isHighBp = screening.bpSystolic >= 140 || screening.bpDiastolic >= 90;
  const isHighGlucose = screening.glucoseLevel >= 140;

  // Age group label translator
  const translateAge = (age) => {
    if (age === 'under35') return t('screening.optAge1');
    if (age === '35to49') return t('screening.optAge2');
    return t('screening.optAge3');
  };

  // Waist size label translator
  const translateWaist = (waist) => {
    if (waist === 'low') return lang === 'en' ? 'Normal Waist Size' : 'ಸಾಮಾನ್ಯ ಸೊಂಟದ ಅಳತೆ';
    if (waist === 'medium') return lang === 'en' ? 'Medium Waist Size' : 'ಮಧ್ಯಮ ಸೊಂಟದ ಅಳತೆ';
    return lang === 'en' ? 'Large Waist Size' : 'ಹೆಚ್ಚಿನ ಸೊಂಟದ ಅಳತೆ';
  };

  // Activity label translator
  const translateActivity = (act) => {
    if (act === 'vigorous') return t('screening.optActivity1');
    if (act === 'moderate') return t('screening.optActivity2');
    return t('screening.optActivity3');
  };

  // Family history label translator
  const translateFamily = (fam) => {
    if (fam === 'none') return t('screening.optFamily1');
    if (fam === 'one_parent') return t('screening.optFamily2');
    return t('screening.optFamily3');
  };

  return (
    <div className="timeline-item">
      {/* Connector line dot */}
      <div className="timeline-dot-container">
        <div 
          className="timeline-dot animate-pulse-radar"
          style={{ backgroundColor: getRiskColor(screening.riskLevel) }}
        />
      </div>

      <div className="timeline-card glass-card">
        <div className="timeline-header" onClick={() => setExpanded(!expanded)}>
          <div className="timeline-meta">
            <span className="timeline-date">
              <Calendar size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
              {formattedDate}
            </span>
            <div className="timeline-status-row">
              <span 
                className="timeline-risk-indicator" 
                style={{ color: getRiskColor(screening.riskLevel) }}
              >
                {getRiskText(screening.riskLevel)}
              </span>
            </div>
          </div>
          <button className="timeline-expand-btn">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <div className="timeline-metrics-summary">
          <div className="timeline-metric">
            <Heart size={16} className="text-red" />
            <span>BP: <strong>{bpHalf}</strong> mmHg {isHighBp && <span className="timeline-alert">*</span>}</span>
          </div>
          <div className="timeline-metric">
            <Activity size={16} className="text-teal" />
            <span>Sugar: <strong>{screening.glucoseLevel}</strong> mg/dL {isHighGlucose && <span className="timeline-alert">*</span>}</span>
          </div>
        </div>

        <div className="timeline-asha-info">
          <User size={14} className="text-muted" />
          <span>{t('history.conductedBy', { name: screening.ashaWorkerName || 'ASHA Worker' })}</span>
        </div>

        {expanded && (
          <div className="timeline-details animate-scale-in">
            <div className="divider" />
            
            <div className="details-section">
              <h4 className="details-heading">
                <Award size={16} className="text-teal" />
                {t('history.scoreLabel')}: {screening.idrsScore || 0}/100
              </h4>
              
              {screening.idrsBreakdown && (
                <div className="breakdown-grid">
                  <div className="breakdown-item">
                    <span>{translateAge(screening.idrsBreakdown.ageGroup)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>{translateWaist(screening.idrsBreakdown.waistSize)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>{translateActivity(screening.idrsBreakdown.physicalActivity)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>{translateFamily(screening.idrsBreakdown.familyHistory)}</span>
                  </div>
                </div>
              )}
            </div>

            {screening.doctorsNote && (
              <div className="details-section note-box">
                <h4 className="details-heading">{t('dashboard.docNoteTitle')}</h4>
                <p className="details-note-text">
                  {typeof screening.doctorsNote === 'object'
                    ? (screening.doctorsNote[lang] || screening.doctorsNote.en)
                    : screening.doctorsNote}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
