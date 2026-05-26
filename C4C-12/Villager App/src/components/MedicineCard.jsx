/**
 * src/components/MedicineCard.jsx
 * Card showing medicine details, dosage, next due time, 
 * and a checkbox / button to mark as taken today.
 */

import React from 'react';
import { Pill, Info, CheckCircle2, Clock } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';

export default function MedicineCard({ medicine, isTakenToday, onMarkTaken, onInfoClick }) {
  const { t } = useLanguage();

  return (
    <div className={`medicine-card ${isTakenToday ? 'taken' : ''}`}>
      <div className="med-card-header">
        <div className="med-info-left">
          <div className="med-icon-container">
            <Pill size={24} className="med-icon" />
          </div>
          <div className="med-name-section">
            <h3 className="med-name">{medicine.name || medicine.medicineName}</h3>
            <p className="med-details">
              <strong>{t('medicine.dosage')}:</strong> {medicine.defaultDose || medicine.dose}
            </p>
          </div>
        </div>
        <button 
          className="btn-icon info-btn" 
          onClick={onInfoClick}
          aria-label="Info about medicine"
        >
          <Info size={20} />
        </button>
      </div>

      <div className="med-card-footer">
        <div className="med-due-time">
          <Clock size={14} className="text-muted" style={{ marginRight: '4px' }} />
          <span>{t('medicine.nextDue')}: <strong>{isTakenToday ? t('medicine.alreadyTaken') : (medicine.frequency || 'Daily')}</strong></span>
        </div>

        {isTakenToday ? (
          <div className="med-taken-badge">
            <CheckCircle2 size={16} className="text-success" />
            <span>{t('medicine.alreadyTaken')}</span>
          </div>
        ) : (
          <button 
            className="btn-primary med-action-btn"
            onClick={onMarkTaken}
          >
            {t('medicine.markTaken')}
          </button>
        )}
      </div>
    </div>
  );
}
