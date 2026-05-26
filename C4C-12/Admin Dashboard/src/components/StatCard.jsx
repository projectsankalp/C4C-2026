/**
 * GraamSehat Admin Dashboard - Stat Card Component
 * Location: /src/components/StatCard.jsx
 */

import React from 'react';
import './StatCard.css';

export default function StatCard({ title, value, icon: Icon, subtext, type = 'default' }) {
  // Types: default, critical, success, warning
  return (
    <div className={`glass-card stat-card stat-card-${type}`}>
      <div className="stat-card-main">
        <div className="stat-card-details">
          <span className="stat-title">{title}</span>
          <h3 className="stat-value">{value}</h3>
        </div>
        <div className={`stat-icon-wrapper stat-icon-${type}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      {subtext && (
        <div className="stat-card-footer">
          <span className="stat-subtext">{subtext}</span>
        </div>
      )}
    </div>
  );
}
