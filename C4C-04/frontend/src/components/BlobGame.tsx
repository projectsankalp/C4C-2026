import React, { useState, useRef, useEffect } from 'react';

interface BlobData {
  id: number;
  x: number;
  y: number;
  r: number;
  baseR: number;
  color1: string;
  color2: string;
  vx: number;
  vy: number;
  phase: number;
}

const BlobGame: React.FC = () => {
  const [blobs, setBlobs] = useState<BlobData[]>([]);
  const draggingId = useRef<number | null>(null);
  const reqRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize blobs with more premium aesthetics
    const initialBlobs = Array.from({ length: 2 }).map((_, i) => ({
      id: i,
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
      y: (window.innerHeight - 80) / 2 + (Math.random() - 0.5) * 300,
      baseR: Math.random() * 20 + 70,
      r: 70,
      color1: `hsl(${Math.random() * 60 + 180}, 90%, 65%)`, // cyan/blue
      color2: `hsl(${Math.random() * 60 + 240}, 90%, 55%)`, // purple/blue
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      phase: Math.random() * Math.PI * 2
    }));
    setBlobs(initialBlobs);
  }, []);

  const onPointerDown = (id: number, e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    draggingId.current = id;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (draggingId.current === null) return;
    const id = draggingId.current;
    
    const rect = containerRef.current?.getBoundingClientRect();
    const offsetX = rect ? rect.left : 0;
    const offsetY = rect ? rect.top : 0;

    setBlobs(prev => prev.map(b => {
      if (b.id === id) {
        // Calculate velocity based on movement
        const targetX = e.clientX - offsetX;
        const targetY = e.clientY - offsetY;
        const vx = (targetX - b.x) * 0.5;
        const vy = (targetY - b.y) * 0.5;
        return { ...b, x: targetX, y: targetY, vx, vy };
      }
      return b;
    }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (draggingId.current !== null) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      draggingId.current = null;
    }
  };

  useEffect(() => {
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 16, 2);
      lastTime = time;

      const rect = containerRef.current?.getBoundingClientRect();
      const w = rect ? rect.width : window.innerWidth;
      const h = rect ? rect.height : window.innerHeight - 80;

      setBlobs(prev => {
        const next = [...prev];
        for (let i = 0; i < next.length; i++) {
          let b = { ...next[i] };
          
          // Breathing effect
          b.phase += 0.05 * dt;
          b.r = b.baseR + Math.sin(b.phase) * 10;

          if (next[i].id === draggingId.current) {
            // Apply damping to dragged item velocity so it doesn't fly infinitely
            b.vx *= 0.8;
            b.vy *= 0.8;
            next[i] = b;
            continue;
          }
          
          // Gentle floating physics
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Bounce off walls with squish factor
          if (b.x < b.r) { b.x = b.r; b.vx *= -0.8; }
          if (b.x > w - b.r) { b.x = w - b.r; b.vx *= -0.8; }
          if (b.y < b.r) { b.y = b.r; b.vy *= -0.8; }
          if (b.y > h - b.r) { b.y = h - b.r; b.vy *= -0.8; }

          // Attraction to center
          b.vx += (w / 2 - b.x) * 0.0001 * dt;
          b.vy += (h / 2 - b.y) * 0.0001 * dt;
          
          // Friction
          b.vx *= 0.99;
          b.vy *= 0.99;

          next[i] = b;
        }
        return next;
      });
      reqRef.current = requestAnimationFrame(animate);
    };
    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current!);
  }, []);

  return (
    <div 
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0, left: 0,
        overflow: 'hidden',
        background: 'transparent',
        filter: 'url(#premium-goo)',
        touchAction: 'none'
      }}
    >
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', color: 'rgba(74, 60, 49, 0.4)', textAlign: 'center', zIndex: -1 }}>
        <h2>Play with the fluid</h2>
        <p style={{fontSize: '0.9rem', opacity: 0.7}}>Throw them around!</p>
      </div>

      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="premium-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -15" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      {blobs.map(b => {
        // Calculate stretch based on velocity
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const stretch = Math.min(speed * 0.05, 0.5);
        const angle = Math.atan2(b.vy, b.vx);

        return (
          <div
            key={b.id}
            onPointerDown={(e) => onPointerDown(b.id, e)}
            style={{
              position: 'absolute',
              left: b.x,
              top: b.y,
              width: b.r * 2,
              height: b.r * 2,
              background: `radial-gradient(circle at 30% 30%, ${b.color1}, ${b.color2})`,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}rad) scaleX(${1 + stretch}) scaleY(${1 - stretch * 0.5})`,
              cursor: draggingId.current === b.id ? 'grabbing' : 'grab',
              touchAction: 'none',
              pointerEvents: 'auto',
              boxShadow: 'inset -10px -10px 30px rgba(74, 60, 49, 0.1), 0 0 40px rgba(74, 60, 49, 0.05)'
            }}
          />
        );
      })}
    </div>
  );
};

export default BlobGame;
