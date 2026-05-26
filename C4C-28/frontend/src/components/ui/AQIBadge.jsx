
const AQIBadge = ({ aqi, size = 'md' }) => {
  let color = 'var(--color-text-muted)';
  let bg = '#F3F4F6';
  let label = 'Unknown';

  if (aqi === null || aqi === undefined) {
    label = 'Offline';
  } else if (aqi <= 50) {
    color = 'white';
    bg = 'var(--color-aqi-good)';
    label = 'Good';
  } else if (aqi <= 100) {
    color = 'white';
    bg = 'var(--color-aqi-satisfactory)';
    label = 'Satisfactory';
  } else if (aqi <= 200) {
    color = 'white';
    bg = 'var(--color-aqi-moderate)';
    label = 'Moderate';
  } else if (aqi <= 300) {
    color = 'white';
    bg = 'var(--color-aqi-poor)';
    label = 'Poor';
  } else if (aqi <= 400) {
    color = 'white';
    bg = 'var(--color-aqi-very-poor)';
    label = 'Very Poor';
  } else {
    color = 'white';
    bg = 'var(--color-aqi-severe)';
    label = 'Severe';
  }

  const padding = size === 'sm' ? '2px 8px' : size === 'lg' ? '8px 16px' : '4px 12px';
  const fontSize = size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ 
        backgroundColor: bg, 
        color: color, 
        padding: padding, 
        borderRadius: '4px',
        fontSize: fontSize,
        fontWeight: '600',
        display: 'inline-block'
      }}>
        {aqi !== null ? aqi : '-'}
      </span>
      <span style={{ fontSize: fontSize, color: 'var(--color-text-muted)', fontWeight: '500' }}>
        {label}
      </span>
    </div>
  );
};

export default AQIBadge;
