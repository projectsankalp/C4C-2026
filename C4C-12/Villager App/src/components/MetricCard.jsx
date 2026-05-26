/**
 * src/components/MetricCard.jsx
 * Single health reading display card.
 * Designed for low-literacy users with high readability and icons.
 */

import React from 'react';

export default function MetricCard({ title, value, subValue, icon: IconComponent, status, onClick }) {
  const getStatusClass = () => {
    switch (status) {
      case 'RED':
      case 'high':
      case 'danger':
        return 'metric-status-red';
      case 'YELLOW':
      case 'warning':
        return 'metric-status-yellow';
      case 'GREEN':
      case 'normal':
      case 'success':
        return 'metric-status-green';
      default:
        return '';
    }
  };

  return (
    <div className={`metric-card-container ${onClick ? 'interactive' : ''}`} onClick={onClick}>
      <div className="metric-card-header">
        <div className="metric-icon-wrapper">
          <IconComponent size={20} className="metric-icon" />
        </div>
        <span className="metric-card-title">{title}</span>
      </div>
      <div className="metric-card-body">
        <h3 className="metric-value">{value}</h3>
        {subValue && (
          <span className={`metric-subvalue ${getStatusClass()}`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
