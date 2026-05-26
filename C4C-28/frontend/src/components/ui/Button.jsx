
const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, style, className = '', type = 'button', disabled = false }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    opacity: disabled ? 0.6 : 1,
    letterSpacing: '0.3px',
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: '14px' },
    md: { padding: '10px 16px', fontSize: '16px' },
    lg: { padding: '14px 24px', fontSize: '18px' }
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-secondary)',
      border: '1px solid var(--color-secondary)'
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'white'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-muted)'
    }
  };

  // User-provided style is spread LAST so it can override variant defaults
  const combinedStyle = { ...baseStyle, ...sizes[size], ...variants[variant], ...style };

  return (
    <button type={type} style={combinedStyle} onClick={onClick} className={className} disabled={disabled}>
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

export default Button;
