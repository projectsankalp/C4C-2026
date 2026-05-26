/**
 * GraamSehat Admin Dashboard - Alert Banner Component
 * Location: /src/components/AlertBanner.jsx
 */

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function AlertBanner({ message, type = 'warning', onClose }) {
  // Types: error, warning, success, info
  
  const getIcon = () => {
    switch (type) {
      case 'error': return <AlertCircle size={20} />;
      case 'success': return <CheckCircle2 size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getClassName = () => {
    switch (type) {
      case 'error': return 'alert-banner alert-error';
      case 'success': return 'alert-banner alert-success';
      case 'warning': return 'alert-banner alert-warning';
      default: return 'alert-banner alert-info';
    }
  };

  return (
    <div className={getClassName()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
        {getIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: 'inherit',
            fontWeight: '600',
            fontSize: '0.875rem' 
          }}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
