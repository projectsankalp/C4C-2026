import React, { useState } from 'react';
import CircleFeed from './CircleFeed';

export type CircleType = 'student' | 'professional' | 'homemaker' | 'wellness' | null;

const CommunityHub: React.FC<{ goToGames: () => void }> = ({ goToGames }) => {
  const [activeCircle, setActiveCircle] = useState<CircleType>(null);

  if (activeCircle) {
    return <CircleFeed circleType={activeCircle} goBack={() => setActiveCircle(null)} />;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', marginTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Community Circles</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto' }}>
          Connect anonymously, share your experiences, and find support in a stigma-free environment.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass-panel" onClick={() => setActiveCircle('student')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h3>Student Circle</h3>
          <p style={{ fontSize: '0.9rem' }}>Share academic experiences, manage study-life balance, and support one another.</p>
        </div>

        <div className="glass-panel" onClick={() => setActiveCircle('professional')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💼</div>
          <h3>Working Professionals</h3>
          <p style={{ fontSize: '0.9rem' }}>Discuss workplace experiences, productivity, and maintaining work-life balance.</p>
        </div>

        <div className="glass-panel" onClick={() => setActiveCircle('homemaker')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
          <h3>Homemakers & Parents</h3>
          <p style={{ fontSize: '0.9rem' }}>Share daily experiences, parenting journeys, and household routines.</p>
        </div>

        <div className="glass-panel" onClick={() => setActiveCircle('wellness')} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
          <h3>Open Wellness</h3>
          <p style={{ fontSize: '0.9rem' }}>Inclusive community for uplifting discussions and positive interactions.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(192, 130, 75, 0.1), rgba(212, 154, 137, 0.1))' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🪷</div>
        <h3>Wellness Activity Corner</h3>
        <p style={{ marginBottom: '1.5rem' }}>Take a quick break with calming activities to refresh your mind.</p>
        <button className="btn btn-primary" onClick={goToGames}>Explore Relaxation Games</button>
      </div>
    </div>
  );
};

export default CommunityHub;
