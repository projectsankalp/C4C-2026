import React, { useEffect, useState } from 'react';

interface Balloon {
  id: number;
  left: string;
  color: string;
  speed: number;
  size: number;
  popped: boolean;
}

const colors = ['#E29578', '#D4A373', '#E8D5C4', '#C0824B', '#BFA89E'];

const BalloonPop: React.FC = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBalloons(prev => {
        if (prev.length > 20) return prev; // Limit max balloons
        const newBalloon: Balloon = {
          id: Date.now() + Math.random(),
          left: `${Math.random() * 80 + 10}%`,
          color: colors[Math.floor(Math.random() * colors.length)],
          speed: Math.random() * 5 + 5, // 5s to 10s float speed
          size: Math.random() * 20 + 50, // 50px to 70px
          popped: false
        };
        return [...prev, newBalloon];
      });
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    
    // Play a soft synthetic pop sound
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Ignore audio errors if blocked by browser
    }

    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== id));
    }, 200);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'absolute', top: 0, left: 0 }}>
      {balloons.map(b => (
        <div
          key={b.id}
          onPointerDown={() => !b.popped && popBalloon(b.id)}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            bottom: '-100px',
            left: b.left,
            width: `${b.size}px`,
            height: `${b.size * 1.2}px`,
            backgroundColor: b.color,
            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            boxShadow: 'inset -5px -5px 15px rgba(74, 60, 49, 0.1), inset 5px 5px 15px rgba(255,255,255,0.8)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease-out, opacity 0.15s',
            transform: b.popped ? 'scale(1.5)' : 'scale(1)',
            opacity: b.popped ? 0 : 0.9,
            animation: b.popped ? 'none' : `floatUp ${b.speed}s linear infinite`,
            zIndex: 5
          }}
        >
          {/* Balloon knot */}
          {!b.popped && (
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0',
              height: '0',
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: `10px solid ${b.color}`
            }} />
          )}
        </div>
      ))}
      <div style={{ position: 'absolute', bottom: '2rem', width: '100%', textAlign: 'center', color: 'rgba(74, 60, 49, 0.4)', pointerEvents: 'none' }}>
        Tap the balloons to pop them
      </div>
    </div>
  );
};

export default BalloonPop;
