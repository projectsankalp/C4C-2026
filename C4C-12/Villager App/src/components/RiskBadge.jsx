/**
 * src/components/RiskBadge.jsx
 * Big GREEN/YELLOW/RED status card representing the patient's combined risk level.
 * Features bold colors, large text, and prominent risk score representation.
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';

export default function RiskBadge({ riskLevel, idrsScore, lastScreeningDate, onClick }) {
  const { t } = useLanguage();

  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'RED':
        return {
          bgClass: 'risk-card-red',
          textKey: 'dashboard.riskRed',
          color: '#EF4444',
          icon: AlertOctagon
        };
      case 'YELLOW':
        return {
          bgClass: 'risk-card-yellow',
          textKey: 'dashboard.riskYellow',
          color: '#F59E0B',
          icon: AlertTriangle
        };
      case 'GREEN':
      default:
        return {
          bgClass: 'risk-card-green',
          textKey: 'dashboard.riskGreen',
          color: '#22C55E',
          icon: ShieldCheck
        };
    }
  };

  const { bgClass, textKey, icon: IconComponent } = getRiskStyles();
  const dateFormatted = lastScreeningDate
    ? new Date(lastScreeningDate).toLocaleDateString()
    : 'N/A';

  return (
    <div className={`risk-status-card ${bgClass}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="risk-card-main">
        <div className="risk-card-left">
          <IconComponent size={36} className="risk-icon" />
          <h2 className="risk-card-title">{t(textKey)}</h2>
          <p className="risk-card-date">
            {t('dashboard.lastChecked', { date: dateFormatted })}
          </p>
        </div>
        <div className="risk-card-right">
          <div className="risk-score-circle">
            <span className="risk-score-val">{idrsScore || 0}</span>
            <span className="risk-score-lbl">IDRS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
