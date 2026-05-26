/**
 * src/pages/Emergency.jsx
 * Emergency SOS assistance screen.
 * Displays a big red SOS trigger, PHC details based on district, and contacts list.
 */

import React from 'react';
import { PhoneCall, AlertOctagon, MapPin, Phone, ArrowLeft, ShieldAlert } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { PHC_NUMBERS } from '../utils/constants';

export default function Emergency({ patient, onBack }) {
  const { t } = useLanguage();

  if (!patient) return null;

  // Resolve PHC based on patient district
  const district = patient.district || 'Default';
  const phcInfo = PHC_NUMBERS[district] || PHC_NUMBERS['Default'];

  return (
    <div className="page-container emergency-page animate-slide-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="emergency-body scrollbar-none">
        <h2 className="page-title">{t('emergency.title')}</h2>
        <p className="page-subtitle">{t('emergency.sosExplanation')}</p>

        {/* BIG RED SOS BUTTON */}
        <div className="sos-button-wrapper">
          <a 
            href={`tel:${phcInfo.phone}`}
            className="sos-main-button animate-glow animate-pulse-radar"
            title={t('emergency.sosBtn')}
          >
            <PhoneCall size={48} className="sos-call-icon" />
            <span className="sos-btn-lbl">SOS</span>
          </a>
        </div>

        {/* Nearest PHC details card */}
        <div className="nearest-hospital-card glass-panel">
          <div className="card-sec-header">
            <MapPin size={20} className="text-red" />
            <h3>{t('emergency.nearestHospital')}</h3>
          </div>
          
          <div className="hospital-details-content">
            <h4 className="hospital-name">{phcInfo.name}</h4>
            <p className="hospital-address">{phcInfo.address}</p>
            <div className="hospital-stats-row">
              <span className="hosp-stat">
                <strong>{t('emergency.distance')}:</strong> {phcInfo.distance}
              </span>
              <span className="hosp-stat">
                <strong>{t('emergency.phone')}:</strong> {phcInfo.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency contact lists */}
        <div className="emergency-contacts-section">
          <h3 className="section-title">{t('emergency.contactList')}</h3>
          
          <div className="contacts-list-grid">
            {/* ASHA Worker Contact */}
            <div className="contact-item-card glass-card">
              <div className="contact-item-left">
                <span className="contact-role">ASHA Worker</span>
                <span className="contact-name">{patient.ashaWorkerName || 'Rupa Devi'}</span>
              </div>
              {patient.ashaWorkerPhone && (
                <a href={`tel:${patient.ashaWorkerPhone}`} className="btn-icon contact-call-btn">
                  <Phone size={18} className="text-teal" />
                </a>
              )}
            </div>

            {/* Health Center Post */}
            <div className="contact-item-card glass-card">
              <div className="contact-item-left">
                <span className="contact-role">Primary Health Post</span>
                <span className="contact-name">{phcInfo.name}</span>
              </div>
              <a href={`tel:${phcInfo.phone}`} className="btn-icon contact-call-btn">
                <Phone size={18} className="text-teal" />
              </a>
            </div>

            {/* Government Ambulance */}
            <div className="contact-item-card glass-card">
              <div className="contact-item-left">
                <span className="contact-role">Emergency Ambulance</span>
                <span className="contact-name">National helpline</span>
              </div>
              <a href="tel:108" className="btn-icon contact-call-btn bg-red-light">
                <Phone size={18} className="text-red" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
