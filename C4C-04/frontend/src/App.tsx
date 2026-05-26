import { useState } from 'react';
import './index.css';
import Chatbot from './components/Chatbot';
import Assessment from './components/Assessment';
import Resources from './components/Resources';
import Games from './components/Games';
import CommunityHub from './components/CommunityHub';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import EmergencyContactsModal from './components/EmergencyContactsModal';
import { supabase } from './supabaseClient';
import { useEffect } from 'react';

function App() {
  const [view, setView] = useState<'home' | 'chat' | 'assessment' | 'resources' | 'games' | 'community' | 'dashboard' | 'auth'>('home');
  const [user, setUser] = useState<any>(null);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProtectedView = (targetView: any) => {
    if (user) {
      setView(targetView);
    } else {
      setView('auth');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('home');
  };

  return (
    <div className="container">
      <nav>
        <div 
          className="nav-brand" 
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'rgba(126, 200, 227, 0.15)',
            borderRadius: '12px',
            userSelect: 'none',
            transition: 'all 0.3s ease'
          }} 
          onClick={() => setView('home')}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(126, 200, 227, 0.3)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(126, 200, 227, 0.15)'}
        >
          <img src="/logo.png" alt="MindMitra Logo" style={{ height: '70px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.5px', fontSize: '1.5rem', marginLeft: '0.5rem' }}>MindMitra</span>
        </div>
        <div>
          <button className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => handleProtectedView('dashboard')}>Dashboard</button>
          <button className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => setView('community')}>Community</button>
          <button className="btn btn-secondary" style={{ marginRight: '1rem' }} onClick={() => setView('games')}>Games</button>
          {!user ? (
            <button className="btn btn-secondary" onClick={() => setView('auth')}>Login</button>
          ) : (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowEmergencyContacts(true)} 
                style={{ marginRight: '1rem', color: '#fff', background: 'var(--accent-primary)' }}
              >
                🚨 SOS Contacts
              </button>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ color: '#7EC8E3', borderColor: 'rgba(126, 200, 227, 0.3)' }}>Logout</button>
            </>
          )}
        </div>
      </nav>

      {showEmergencyContacts && user && (
        <EmergencyContactsModal userId={user.id} onClose={() => setShowEmergencyContacts(false)} />
      )}

      {view === 'home' && (
        <main className="animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
          <h1>Accessible Mental Health<br />For Everyone</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
          MindMitra offers anonymous, multilingual emotional wellness assistance. 
          Overcome stigma and language barriers with our early intervention tools and community outreach.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => handleProtectedView('chat')}>Start Anonymous Chat</button>
          <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => handleProtectedView('dashboard')}>My Dashboard</button>
          <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setView('community')}>Community Circles</button>
          <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => handleProtectedView('assessment')}>Take Assessment</button>
          <button className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }} onClick={() => setView('games')}>Relaxation Games</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass-panel">
            <h3>SATHVA: DEEP WELLNESS AUTHENTICITY</h3>
            <p style={{ fontSize: '1rem' }}>Chat with our AI empathetic listener in English, Hindi, and regional languages.</p>
          </div>
          <div className="glass-panel">
            <h3>GAMIFIED STRESSBUSTERS</h3>
            <p style={{ fontSize: '1rem' }}>Stress releiving agents disguised in the form of games to lower stress levels.</p>
          </div>
          <div className="glass-panel">
            <h3>Early Identification</h3>
            <p style={{ fontSize: '1rem' }}>Take quick, scientifically-backed quizzes to understand your emotional state.</p>
          </div>
        </div>
      </main>
      )}

      {view === 'chat' && <Chatbot />}
      {view === 'assessment' && <Assessment />}
      {view === 'resources' && <Resources />}
      {view === 'games' && <Games />}
      {view === 'community' && <CommunityHub goToGames={() => setView('games')} />}
      {view === 'dashboard' && <Dashboard />}
      {view === 'auth' && <Auth onLoginSuccess={() => setView('dashboard')} />}
    </div>
  );
}

export default App;
