import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, borderColor = 'var(--color-primary)' }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid var(--color-border)',
      borderTop: `4px solid ${borderColor}`,
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="flex justify-between items-start" style={{ marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: '500' }}>
            {title}
          </h4>
          <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-secondary)' }}>
            {value}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--color-bg-alt)', padding: '12px', borderRadius: '50%' }}>
          <Icon size={24} color="var(--color-secondary)" />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2" style={{ fontSize: '14px' }}>
          {trend === 'up' && <TrendingUp size={16} color="var(--color-aqi-very-poor)" />}
          {trend === 'down' && <TrendingDown size={16} color="var(--color-accent-green)" />}
          {trend === 'neutral' && <Minus size={16} color="var(--color-text-muted)" />}
          
          <span style={{ 
            color: trend === 'up' ? 'var(--color-aqi-very-poor)' : 
                   trend === 'down' ? 'var(--color-accent-green)' : 
                   'var(--color-text-muted)',
            fontWeight: '600'
          }}>
            {trendValue}
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>from last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
