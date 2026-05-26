/**
 * src/components/FamilyMemberCard.jsx
 * Profile card displaying details of a linked family member, 
 * including their relation, risk badge, and a button to switch profile.
 */

import React from 'react';
import { User, ChevronRight, Calendar } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';

export default function FamilyMemberCard({ member, onSwitch }) {
  const { t } = useLanguage();

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

  const dateFormatted = member.lastCheckedDate && member.lastCheckedDate !== 'N/A'
    ? new Date(member.lastCheckedDate).toLocaleDateString()
    : 'N/A';

  return (
    <div className="family-member-card glass-card" onClick={onSwitch}>
      <div className="fam-card-left">
        <div className="fam-avatar-container">
          <User size={24} className="text-teal" />
          <div 
            className="fam-risk-dot" 
            style={{ backgroundColor: getRiskColor(member.riskLevel) }}
            title={`Risk Level: ${member.riskLevel}`}
          />
        </div>
        <div className="fam-member-details">
          <h3 className="fam-member-name">{member.name}</h3>
          <p className="fam-member-relation">
            <strong>{t('family.relationTitle')}:</strong> {member.relation}
          </p>
          <div className="fam-member-checked">
            <Calendar size={12} className="text-muted" style={{ marginRight: '4px' }} />
            <span>{t('dashboard.lastChecked', { date: dateFormatted })}</span>
          </div>
        </div>
      </div>
      <button 
        className="btn-icon fam-switch-arrow"
        aria-label={t('family.switchMember')}
      >
        <ChevronRight size={20} className="text-teal" />
      </button>
    </div>
  );
}
