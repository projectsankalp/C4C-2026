import React from 'react';

const Resources: React.FC = () => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Community Outreach & Resources</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel">
          <h3>National Helplines</h3>
          <ul style={{ listStyleType: 'none', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '1rem' }}>
              <strong>KIRAN:</strong> 1800-599-0019 <br/>
              <small>(24/7 Toll-Free Mental Health Helpline)</small>
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong>AASRA:</strong> +91-9820466726 <br/>
              <small>(Suicide Prevention and Counseling)</small>
            </li>
            <li>
              <strong>Vandrevala Foundation:</strong> 9999 666 555 <br/>
              <small>(Multilingual Support)</small>
            </li>
          </ul>
        </div>
        
        <div className="glass-panel">
          <h3>Educational Articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Understanding Anxiety vs Normal Stress</a>
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Debunking Mental Health Myths in India</a>
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>How to Support a Friend in Distress</a>
            <a href="#" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>The Importance of Early Intervention</a>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h3>Join the Community</h3>
        <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Participate in anonymous peer support groups to share experiences and coping strategies.</p>
        <button className="btn btn-primary">Find a Group</button>
      </div>
    </div>
  );
};

export default Resources;
