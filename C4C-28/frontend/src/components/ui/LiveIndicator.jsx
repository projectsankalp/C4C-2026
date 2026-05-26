import { useEffect, useState } from 'react';

const LiveIndicator = ({ lastUpdated, isFresh = true }) => {
  const [ago, setAgo] = useState('');

  useEffect(() => {
    const update = () => {
      if (!lastUpdated) return;
      const secs = Math.floor((Date.now() - new Date(lastUpdated)) / 1000);
      if (secs < 60) setAgo(`${secs}s ago`);
      else setAgo(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  const color = isFresh ? '#16A34A' : '#DC2626';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', backgroundColor: color,
        boxShadow: isFresh ? `0 0 0 3px ${color}33` : 'none',
        animation: isFresh ? 'pulse 2s infinite' : 'none',
        display: 'inline-block'
      }} />
      {isFresh ? `Live · ${ago}` : `Stale · ${ago}`}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </span>
  );
};

export default LiveIndicator;
