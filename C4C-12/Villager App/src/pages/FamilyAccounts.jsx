/**
 * src/pages/FamilyAccounts.jsx
 * Screen displaying the active patient's card at the top (highlighted)
 * and a list of linked family members with quick profile switching and add buttons.
 */

import React from 'react';
import { UserPlus, ArrowLeft, User, Calendar } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';
import FamilyMemberCard from '../components/FamilyMemberCard';

export default function FamilyAccounts({ patient, familyMembers, onSwitch, onNavigate, onBack }) {
  const { t } = useLanguage();

  if (!patient) return null;

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

  const getRiskLabel = (level) => {
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

  const activeDateFormatted = patient.lastScreeningDate
    ? new Date(patient.lastScreeningDate).toLocaleDateString()
    : 'N/A';

  return (
    <div className="page-container family-accounts-page animate-fade-in">
      <div className="page-header-nav">
        <button className="btn-icon back-btn" onClick={onBack} aria-label={t('common.goBack')}>
          <ArrowLeft size={24} className="text-teal" />
        </button>
      </div>

      <div className="family-main scrollbar-none">
        <div className="family-header-row">
          <h2 className="page-title">{t('family.title')}</h2>
          <button 
            className="btn-primary add-family-header-btn"
            onClick={() => onNavigate('addFamily')}
          >
            <UserPlus size={18} />
            <span>Add</span>
          </button>
        </div>
        <p className="page-subtitle">{t('family.subtitle')}</p>

        {/* Current Active Patient Profile (Highlighted at top) */}
        <div className="active-patient-profile-card gradient-primary animate-scale-in">
          <div className="active-profile-header">
            <div className="active-avatar">
              <User size={28} className="text-teal" />
            </div>
            <span className="profile-active-tag">{t('common.relationSelf')}</span>
          </div>
          
          <h3 className="active-profile-name">{patient.name}</h3>
          
          <div className="active-profile-meta-row">
            <div className="meta-badge-box">
              <span className="meta-badge-lbl">Health ID:</span>
              <strong className="meta-badge-val">{patient.uid}</strong>
            </div>
            <div className="meta-badge-box">
              <span className="meta-badge-lbl">Status:</span>
              <strong 
                className="meta-badge-val"
                style={{ color: getRiskColor(patient.riskLevel) }}
              >
                {getRiskLabel(patient.riskLevel)}
              </strong>
            </div>
          </div>
          
          <div className="divider" style={{ opacity: 0.2 }} />
          <div className="active-profile-checked-date">
            <Calendar size={14} style={{ marginRight: '6px' }} />
            <span>{t('dashboard.lastChecked', { date: activeDateFormatted })}</span>
          </div>
        </div>

        {/* Linked Family Members List */}
        <div className="family-members-section">
          <h3 className="section-title">Linked Members ({familyMembers.length})</h3>
          
          {familyMembers.length === 0 ? (
            <div className="empty-family-box glass-panel animate-scale-in">
              <UserPlus size={32} className="text-muted" style={{ margin: '0 auto 12px' }} />
              <p className="empty-family-text">No family members linked yet.</p>
              <button 
                className="btn-outline add-first-member-btn"
                onClick={() => onNavigate('addFamily')}
              >
                Link Family Member
              </button>
            </div>
          ) : (
            <div className="family-list-grid">
              {familyMembers.map((member, idx) => (
                <FamilyMemberCard
                  key={member.memberUID || idx}
                  member={member}
                  onSwitch={() => onSwitch(member.memberUID)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
