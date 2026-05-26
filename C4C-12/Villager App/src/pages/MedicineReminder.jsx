/**
 * src/pages/MedicineReminder.jsx
 * Screen showing scheduled medicines, intake checkers, and compliance streaks.
 * Utilizes Dexie useLiveQuery to display compliance in real-time.
 */

import React, { useContext, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Award, ArrowLeft, Pill, X } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { PatientContext } from '../context/PatientContext';
import { db } from '../db/localDB';
import MedicineCard from '../components/MedicineCard';
import { MEDICINE_DESCRIPTIONS } from '../utils/constants';

export default function MedicineReminder({ patient, medicines, streak, onBack }) {
  const { t, lang } = useLanguage();
  const { markMedicineTaken } = useContext(PatientContext);
  const [infoMedicine, setInfoMedicine] = useState(null);

  if (!patient) return null;

  // Reactively query medicine logs for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = useLiveQuery(async () => {
    return await db.medicineLogs
      .where('uid')
      .equals(patient.uid)
      .filter(log => log.takenDate === todayStr)
      .toArray();
  }, [patient.uid, todayStr]) || [];

  const handleMarkTaken = (medId) => {
    markMedicineTaken(medId);
  };

  const handleOpenInfo = (med) => {
    // Resolve description key by ID or matching substrings
    let key = med.id || '';
    if (!MEDICINE_DESCRIPTIONS[lang]?.[key]) {
      const nameLower = (med.name || '').toLowerCase();
      if (nameLower.includes('metformin')) key = 'metformin_500';
      else if (nameLower.includes('amlodipine')) key = 'amlodipine_5';
      else if (nameLower.includes('atenolol')) key = 'atenolol_50';
      else if (nameLower.includes('ors')) key = 'ors_sachet';
      else if (nameLower.includes('iron')) key = 'iron_tablets';
      else if (nameLower.includes('folic')) key = 'folic_acid';
    }
    
    const description = MEDICINE_DESCRIPTIONS[lang]?.[key] || 
      MEDICINE_DESCRIPTIONS.en[key] || 
      'Prescribed medical supplement for blood sugar or pressure management.';
      
    setInfoMedicine({
      name: med.name || med.medicineName,
      description
    });
  };

  return (
    <div className="page-container medicine-reminder-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="medicine-main scrollbar-none">
        <h2 className="page-title">{t('medicine.title')}</h2>

        {/* Streak card */}
        <div className="streak-indicator-card gradient-primary animate-scale-in">
          <div className="streak-avatar">
            <Award size={36} className="text-white animate-float" />
          </div>
          <div className="streak-text-box">
            <h3 className="streak-title">{t('medicine.streakCounter', { count: streak })}</h3>
            <p className="streak-tagline">{t('medicine.streakTag')}</p>
          </div>
        </div>

        {/* Medicine list */}
        <div className="medicine-list-container">
          {medicines.length === 0 ? (
            <div className="empty-medicine-card glass-panel">
              <Pill size={32} className="text-muted" style={{ margin: '0 auto 12px' }} />
              <p className="empty-meds-desc">No active medicines prescribed. Follow doctor\'s general advice.</p>
            </div>
          ) : (
            medicines.map((med, idx) => {
              const medId = med.id || med.name || idx.toString();
              const isTaken = todayLogs.some(log => log.medicineId === medId);
              
              return (
                <MedicineCard
                  key={medId}
                  medicine={med}
                  isTakenToday={isTaken}
                  onMarkTaken={() => handleMarkTaken(medId)}
                  onInfoClick={() => handleOpenInfo(med)}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Info Modal */}
      {infoMedicine && (
        <div className="modal-overlay animate-fade-in" onClick={() => setInfoMedicine(null)}>
          <div className="modal-card glass-panel animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{infoMedicine.name}</h3>
              <button 
                className="btn-icon close-modal-btn" 
                onClick={() => setInfoMedicine(null)}
                aria-label={t('medicine.modalClose')}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="medicine-desc-txt">{infoMedicine.description}</p>
            </div>
            <div className="modal-footer">
              <button className="btn-primary modal-ok-btn" onClick={() => setInfoMedicine(null)}>
                {t('medicine.modalClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
