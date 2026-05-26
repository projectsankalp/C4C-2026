/**
 * src/pages/HealthHistory.jsx
 * Screening History timeline page.
 * Lists all screening sessions, sorted newest first, using the TimelineItem component.
 */

import React from 'react';
import { ClipboardList, AlertCircle } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import TimelineItem from '../components/TimelineItem';

export default function HealthHistory({ screenings }) {
  const { t } = useLanguage();

  return (
    <div className="page-container health-history-page animate-fade-in">
      <header className="page-header">
        <div className="header-title-box">
          <h2 className="page-title">{t('history.title')}</h2>
          <p className="page-subtitle">{t('history.subtitle')}</p>
        </div>
      </header>

      <div className="history-content scrollbar-none">
        {screenings.length === 0 ? (
          <div className="history-empty-state glass-card animate-scale-in">
            <AlertCircle size={48} className="text-muted" style={{ margin: '0 auto 16px' }} />
            <p className="empty-state-text">
              {t('history.emptyState')}
            </p>
          </div>
        ) : (
          <div className="vertical-timeline-container">
            {screenings.map((screening, idx) => (
              <TimelineItem 
                key={screening.id || idx} 
                screening={screening} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
