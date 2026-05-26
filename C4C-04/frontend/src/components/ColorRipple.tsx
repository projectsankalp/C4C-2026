import React, { useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

const ColorRipple: React.FC = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const color = `hsl(${Math.random() * 360}, 80%, 65%)`;
    
    const newRipple = { id: Date.now() + Math.random(), x, y, color };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);
  };

  return (
    <div 
      onPointerDown={handlePointerDown}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        position: 'absolute',
        top: 0, left: 0,
        background: 'transparent',
        cursor: 'crosshair',
        touchAction: 'none'
      }}
    >
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', color: 'rgba(74, 60, 49, 0.4)', textAlign: 'center' }}>
        <h2>Touch or click the screen</h2>
      </div>
      
      {ripples.map(r => (
        <div
          key={r.id}
          style={{
            position: 'absolute',
            left: r.x,
            top: r.y,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: `4px solid ${r.color}`,
            animation: 'rippleAnim 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
            pointerEvents: 'none',
            boxShadow: `0 0 20px ${r.color}, inset 0 0 20px ${r.color}`
          }}
        />
      ))}
    </div>
  );
};

export default ColorRipple;
