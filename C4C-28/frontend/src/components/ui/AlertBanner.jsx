import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

const AlertBanner = ({ type = 'warning', message, title, onClose }) => {
  const styles = {
    warning: {
      bg: '#FFFbeb',
      border: '#F59E0B',
      text: '#B45309',
      icon: <AlertTriangle size={20} color="#F59E0B" />
    },
    error: {
      bg: '#FEF2F2',
      border: '#DC2626',
      text: '#991B1B',
      icon: <XCircle size={20} color="#DC2626" />
    },
    success: {
      bg: '#F0FDF4',
      border: '#16A34A',
      text: '#166534',
      icon: <CheckCircle size={20} color="#16A34A" />
    },
    info: {
      bg: '#EFF6FF',
      border: '#3B82F6',
      text: '#1E40AF',
      icon: <Info size={20} color="#3B82F6" />
    }
  };

  const currentStyle = styles[type];

  return (
    <div style={{
      backgroundColor: currentStyle.bg,
      borderLeft: `4px solid ${currentStyle.border}`,
      padding: '16px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '16px'
    }}>
      <div style={{ marginTop: '2px' }}>
        {currentStyle.icon}
      </div>
      <div style={{ flex: 1 }}>
        {title && <h4 style={{ margin: '0 0 4px 0', color: currentStyle.text, fontWeight: '600' }}>{title}</h4>}
        <p style={{ margin: 0, color: currentStyle.text, fontSize: '14px' }}>{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: currentStyle.text, opacity: 0.7 }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
