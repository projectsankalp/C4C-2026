import { useState } from 'react';
import { Settings, Globe, LogIn, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AccessibilityBar = () => {
  const [fontSize, setFontSize] = useState(100);

  const changeFontSize = (delta) => {
    const newSize = Math.max(80, Math.min(130, fontSize + delta));
    setFontSize(newSize);
    document.documentElement.style.fontSize = newSize + '%';
  };

  const setHighContrast = (mode) => {
    if (mode === 'dark') {
      document.body.style.filter = 'invert(1) hue-rotate(180deg)';
      document.body.setAttribute('data-contrast', 'dark');
    } else {
      document.body.style.filter = 'none';
      document.body.removeAttribute('data-contrast');
    }
  };

  const skipToMain = (e) => {
    e.preventDefault();
    const main = document.querySelector('main') || document.querySelector('[role="main"]');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1C1E', color: 'white', fontSize: '12px', padding: '4px 0' }}>
      <div className="container flex justify-between items-center">
        <div className="flex gap-4">
          <a href="#main-content" onClick={skipToMain} style={{ color: 'white', cursor: 'pointer' }}>Skip to main content</a>
          <span style={{ color: '#6B7280' }}>|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('Screen reader mode is supported. Please use your assistive technology (JAWS, NVDA, VoiceOver) to navigate this website.'); }} style={{ color: 'white', cursor: 'pointer' }}>Screen Reader Access</a>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2 items-center">
            <button onClick={() => changeFontSize(-10)} title="Decrease font size"
              style={{ background: 'none', border: '1px solid #4B5563', color: 'white', padding: '2px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '12px', transition: 'all 0.2s' }}
              onMouseEnter={e => e.target.style.background = '#4B5563'} onMouseLeave={e => e.target.style.background = 'none'}>A-</button>
            <button onClick={() => { setFontSize(100); document.documentElement.style.fontSize = '100%'; }} title="Reset font size"
              style={{ background: 'none', border: '1px solid #4B5563', color: 'white', padding: '2px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '12px', transition: 'all 0.2s' }}
              onMouseEnter={e => e.target.style.background = '#4B5563'} onMouseLeave={e => e.target.style.background = 'none'}>A</button>
            <button onClick={() => changeFontSize(10)} title="Increase font size"
              style={{ background: 'none', border: '1px solid #4B5563', color: 'white', padding: '2px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '12px', transition: 'all 0.2s' }}
              onMouseEnter={e => e.target.style.background = '#4B5563'} onMouseLeave={e => e.target.style.background = 'none'}>A+</button>
          </div>
          <span style={{ color: '#6B7280' }}>|</span>
          <div className="flex gap-2">
            <button onClick={() => setHighContrast('normal')} title="Normal contrast"
              style={{ background: 'white', color: 'black', border: 'none', padding: '2px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '12px', transition: 'all 0.2s' }}>A</button>
            <button onClick={() => setHighContrast('dark')} title="High contrast"
              style={{ background: 'black', color: 'white', border: '1px solid white', padding: '2px 8px', cursor: 'pointer', borderRadius: '3px', fontSize: '12px', transition: 'all 0.2s' }}>A</button>
          </div>
          <span style={{ color: '#6B7280' }}>|</span>
          <Link to="/language" className="flex gap-2 items-center" style={{ color: 'white', textDecoration: 'none' }}>
            <Globe size={14} />
            <span>Language</span>
          </Link>
          <span style={{ color: '#6B7280' }}>|</span>
          <Link to="/login" className="flex gap-2 items-center" style={{ color: 'white', textDecoration: 'none' }}>
            <LogIn size={14} />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityBar;
