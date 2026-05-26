import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { t } from '../../services/i18n';
import { useNavigate } from 'react-router-dom';

const GovHeader = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const pages = [
    { name: 'Dashboard', path: '/dashboard', desc: 'View your AQI readings and alerts' },
    { name: 'Admin Control Centre', path: '/admin', desc: 'Manage nodes, view analytics' },
    { name: 'AQI Map', path: '/map', desc: 'Live heatmap of air quality' },
    { name: 'Alerts', path: '/alerts', desc: 'View and manage all alerts' },
    { name: 'Village Rankings', path: '/rankings', desc: 'See which villages have the cleanest air' },
    { name: 'Node Management', path: '/nodes', desc: 'Register and monitor sensor nodes' },
    { name: 'Language Settings', path: '/language', desc: 'Change your language preference' },
    { name: 'Login', path: '/login', desc: 'Sign in to your account' },
    { name: 'Register', path: '/register', desc: 'Create a new citizen account' },
    { name: 'About Swachh Vayu', path: '/about', desc: 'Learn about the platform' },
    { name: 'Contact Us', path: '/contact', desc: 'Get in touch with us' },
    { name: 'Privacy Policy', path: '/privacy', desc: 'Our privacy commitments' },
  ];

  const filtered = query.trim().length > 0
    ? pages.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleNav = (path) => {
    navigate(path);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container flex justify-between items-center">
        <div className="flex gap-4 items-center">
          {/* Swachh Vayu Brand Logo */}
          <div style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, #1B3A5C, #2563EB)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '22px' }}>🍃</span>
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-secondary)', margin: 0, lineHeight: '1.2' }}>
              {t('brand')}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
              {t('tagline')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center" style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder={t('search')}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
              onFocus={() => setShowResults(true)}
              style={{ 
                padding: '8px 12px', 
                paddingRight: '32px',
                border: '1px solid var(--color-border)', 
                borderRadius: '6px',
                width: '280px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
              }} 
            />
            {query ? (
              <X size={16} color="#9CA3AF" style={{ position: 'absolute', right: '10px', top: '10px', cursor: 'pointer' }} onClick={() => { setQuery(''); setShowResults(false); }} />
            ) : (
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', right: '10px', top: '10px' }} />
            )}

            {/* Search Results Dropdown */}
            {showResults && filtered.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden',
              }}>
                {filtered.map((p) => (
                  <button key={p.path} onClick={() => handleNav(p.path)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.background = '#F9FAFB'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-secondary)' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            )}
            {showResults && query.trim().length > 0 && filtered.length === 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)', zIndex: 1000,
                padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px',
              }}>
                No results found for "{query}"
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Click outside to close */}
      {showResults && <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowResults(false)} />}
    </div>
  );
};

export default GovHeader;
