/**
 * src/pages/ShareReport.jsx
 * Screen enabling patients to share their health summary reports.
 * Provides WhatsApp links, clipboard copies, and print-to-PDF options.
 */

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Printer, Check, ArrowLeft, ClipboardList } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import { generateHealthSummary } from '../utils/reportGenerator';

export default function ShareReport({ patient, medicines, onBack }) {
  const { t, lang } = useLanguage();
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (patient) {
      const summary = generateHealthSummary(patient, medicines, lang);
      setReportText(summary);
    }
  }, [patient, medicines, lang]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(reportText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (!patient) return null;

  return (
    <div className="page-container share-report-page animate-slide-in">
      <div className="page-header-nav no-print">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="share-report-body scrollbar-none">
        
        {/* Printable medical report template */}
        <div className="printable-report-card print-only">
          <div className="print-report-header">
            <h2>GRAAM SEHAT HEALTH CARD</h2>
            <p>Village Health Screening Service</p>
          </div>
          <div className="print-divider" />
          <div className="print-report-fields">
            <p><strong>Patient Name:</strong> {patient.name}</p>
            <p><strong>Health ID (UID):</strong> {patient.uid}</p>
            <p><strong>Registered Phone:</strong> {patient.phone}</p>
            <p><strong>Village:</strong> {patient.village}</p>
            <p><strong>District:</strong> {patient.district}</p>
            <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
            <p><strong>Last Screening:</strong> {patient.lastScreeningDate ? new Date(patient.lastScreeningDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Next Appointment:</strong> {patient.nextScreeningDate ? new Date(patient.nextScreeningDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="print-divider" />
          <h3>Core Health Readings</h3>
          <table className="print-metrics-table">
            <thead>
              <tr>
                <th>Risk Score (IDRS)</th>
                <th>Blood Pressure</th>
                <th>Blood Glucose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{patient.idrsScore}/100</td>
                <td>{patient.bpSystolic}/{patient.bpDiastolic} mmHg</td>
                <td>{patient.glucoseLevel} mg/dL</td>
              </tr>
            </tbody>
          </table>
          <div className="print-divider" />
          <h3>Doctor's Advice Summary</h3>
          <p className="print-advice-text">
            {patient.doctorsNote ? (patient.doctorsNote[lang] || patient.doctorsNote.en) : 'No advice logged.'}
          </p>
          <div className="print-divider" />
          <h3>Active Medicines</h3>
          <ul className="print-meds-list">
            {medicines.map((m, idx) => (
              <li key={idx}>{m.name || m.medicineName} — {m.dose}</li>
            ))}
          </ul>
        </div>

        {/* User preview dashboard element (hidden when printed) */}
        <div className="no-print share-ui-layout">
          <h2 className="page-title">{t('share.title')}</h2>
          <p className="page-subtitle">{t('share.explanation')}</p>

          {/* Code summary preview box */}
          <div className="report-preview-box glass-panel">
            <div className="preview-box-header">
              <ClipboardList size={16} className="text-teal" />
              <span>Report Preview</span>
            </div>
            <pre className="report-preview-content">{reportText}</pre>
          </div>

          {/* Action Row */}
          <div className="share-actions-grid">
            <button 
              className="btn-primary share-act-btn whatsapp-color"
              onClick={handleWhatsApp}
            >
              <Share2 size={20} />
              <span>{t('share.whatsappBtn')}</span>
            </button>

            <button 
              className="btn-secondary share-act-btn"
              onClick={handleCopy}
            >
              {copied ? <Check size={20} className="text-success" /> : <Copy size={20} />}
              <span>{copied ? t('share.copiedText') : t('share.copyBtn')}</span>
            </button>

            <button 
              className="btn-outline share-act-btn"
              onClick={handlePrint}
            >
              <Printer size={20} />
              <span>{t('share.pdfBtn')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
