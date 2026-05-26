import React, { useState } from 'react';
import BalloonPop from './BalloonPop';
import ColorRipple from './ColorRipple';
import BlobGame from './BlobGame';

const Games: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'hub' | 'balloon' | 'ripple' | 'blob'>('hub');

  if (activeGame === 'balloon') return (
    <div className="animate-fade-in" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)' }}>
      <button className="btn btn-secondary" style={{ margin: '1rem', position: 'absolute', zIndex: 10 }} onClick={() => setActiveGame('hub')}>← Back to Games</button>
      <BalloonPop />
    </div>
  );
  
  if (activeGame === 'ripple') return (
    <div className="animate-fade-in" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)' }}>
      <button className="btn btn-secondary" style={{ margin: '1rem', position: 'absolute', zIndex: 10 }} onClick={() => setActiveGame('hub')}>← Back to Games</button>
      <ColorRipple />
    </div>
  );
  
  if (activeGame === 'blob') return (
    <div className="animate-fade-in" style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)' }}>
      <button className="btn btn-secondary" style={{ margin: '1rem', position: 'absolute', zIndex: 10 }} onClick={() => setActiveGame('hub')}>← Back to Games</button>
      <BlobGame />
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
      <h1>Relax & Play</h1>
      <p style={{ maxWidth: '600px', margin: '0 auto 3rem auto', color: 'var(--text-secondary)' }}>
        Take a moment for yourself. Enjoy these soothing interactive experiences designed to help you relax, focus, and find calm.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        
        <div className="glass-panel" onClick={() => setActiveGame('balloon')} style={{ cursor: 'pointer', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎈</div>
          <h3>Balloon Pop</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>A light and playful game where you pop floating balloons. Very satisfying.</p>
        </div>

        <div className="glass-panel" onClick={() => setActiveGame('ripple')} style={{ cursor: 'pointer', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌈</div>
          <h3>Color Ripple</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Create soft, flowing color waves and ripple effects to promote calmness.</p>
        </div>

        <div className="glass-panel" onClick={() => setActiveGame('blob')} style={{ cursor: 'pointer', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🫧</div>
          <h3>Blob Merge</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>A soothing experience dragging soft floating blobs that smoothly merge.</p>
        </div>

      </div>
    </div>
  );
};

export default Games;
