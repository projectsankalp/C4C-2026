/**
 * GraamSehat Admin Dashboard - Lost & Found Card Component
 * Location: /src/components/LostFoundCard.jsx
 */

import React from 'react';
import { formatDate } from '../utils/formatters';
import { User, Phone, MapPin, Calendar, Fingerprint } from 'lucide-react';
import './LostFoundCard.css';

export default function LostFoundCard({ patient }) {
  return (
    <div className="glass-card lost-found-card">
      <div className="lost-found-badge">Authorized Admin view</div>
      
      <div className="lost-found-header">
        <div className="patient-avatar-wrapper">
          <User size={24} className="patient-icon" />
        </div>
        <div className="patient-main-info">
          <h3 className="patient-name">{patient.name}</h3>
          <span className="badge badge-gray">
            <Fingerprint size={12} />
            <span>UID: {patient.uid || patient.id}</span>
          </span>
        </div>
      </div>

      <div className="lost-found-body">
        <div className="lost-found-detail-row">
          <Phone size={16} className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Contact Number (Unmasked)</span>
            <span className="detail-value highlight-text">{patient.phone || 'N/A'}</span>
          </div>
        </div>

        {patient.alternatePhone && (
          <div className="lost-found-detail-row">
            <Phone size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Alternate Number</span>
              <span className="detail-value">{patient.alternatePhone}</span>
            </div>
          </div>
        )}

        <div className="lost-found-detail-row">
          <MapPin size={16} className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Location</span>
            <span className="detail-value">{patient.village || 'N/A'}, {patient.district || 'N/A'}</span>
          </div>
        </div>

        <div className="lost-found-detail-row">
          <Calendar size={16} className="detail-icon" />
          <div className="detail-content">
            <span className="detail-label">Last Screened Date</span>
            <span className="detail-value">{formatDate(patient.lastScreened)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
