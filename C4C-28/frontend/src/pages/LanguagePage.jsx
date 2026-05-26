import { useCallback, useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { api } from '../services/api';
import { auth } from '../services/auth';
import GovHeader from '../components/layout/GovHeader';
import Sidebar from '../components/layout/Sidebar';

const LANGUAGES = [
  { code: 'en', label: 'English',           flag: '🇬🇧', native: 'English' },
  { code: 'hi', label: 'Hindi',             flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi',           flag: '🇮🇳', native: 'मराठी' },
  { code: 'kn', label: 'Kannada',           flag: '🇮🇳', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil',             flag: '🇮🇳', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu',            flag: '🇮🇳', native: 'తెలుగు' },
];

const LanguagePage = () => {
  const user    = auth.getUser();
  const [selected, setSelected] = useState(localStorage.getItem('sv_lang') || 'en');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  const fetchLangs = useCallback(() => api.get('/languages'), []);
  const { data: langsData } = usePolling(fetchLangs, 0, true);
  // langsData?.data?.languages is an array from the backend — use as reference but show our curated list

  const handleSelect = async (code) => {
    setSelected(code);
    setSaved(false);
    setError('');
    setSaving(true);
    try {
      if (user?.id) {
        await api.put(`/languages/user/${user.id}`, { language_code: code });
      }
      localStorage.setItem('sv_lang', code);
      setSaved(true);
      // Reload page after a brief delay so all UI translations update
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Live Translation Demo ──────────────────────────────────────
  const DEMO_TEXT = "Emergency Swachh Vayu Alert: Hazardous air quality detected. AQI is 385. Stay indoors.";
  const [demoText, setDemoText]           = useState(DEMO_TEXT);
  const [demoTranslated, setDemoTranslated] = useState('');
  const [demoAudio, setDemoAudio]         = useState(null);
  const [demoLoading, setDemoLoading]     = useState(false);
  const [demoError, setDemoError]         = useState('');

  const runDemo = async () => {
    setDemoLoading(true); setDemoError(''); setDemoTranslated(''); setDemoAudio(null);
    try {
      const token = localStorage.getItem('sv_token');
      // Step 1: Translate
      const transRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/sarvam/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: demoText, target_lang: selected, source_lang: 'en' }),
      });
      const transJson = await transRes.json();
      const translated = transJson.data?.translated || demoText;
      setDemoTranslated(translated);

      // Step 2: TTS
      const ttsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'}/sarvam/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: translated, lang: selected }),
      });
      const ttsJson = await ttsRes.json();
      if (ttsJson.success && ttsJson.data?.audio_base64) {
        setDemoAudio(ttsJson.data.audio_base64);
      }
    } catch (err) {
      setDemoError(err.message);
    } finally {
      setDemoLoading(false);
    }
  };

  const playDemoAudio = () => {
    if (!demoAudio) return;
    const binary = atob(demoAudio);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'audio/wav' });
    new Audio(URL.createObjectURL(blob)).play();
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-alt)' }}>
      <GovHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole="citizen" />
        <main style={{ flex: 1, padding: '32px', minWidth: 0 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '8px' }}>
            Language Settings
          </h2>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: '28px' }}>
            Select your preferred language for alerts, dashboard labels, and SMS notifications.
          </p>

          {saved && (
            <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: '#15803D', display: 'flex', alignItems: 'center', gap: 8 }}>
              ✅ Language preference saved!
            </div>
          )}
          {error && (
            <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 14, color: '#DC2626' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', maxWidth: '800px' }}>
            {LANGUAGES.map(lang => {
              const isActive = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  disabled={saving}
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    border: isActive ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    background: isActive ? 'var(--color-primary-light)' : '#fff',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    boxShadow: isActive ? '0 4px 12px rgba(255,107,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{lang.flag}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: isActive ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                    {lang.native}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3 }}>{lang.label}</div>
                  {isActive && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                      ✓ Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="card" style={{ maxWidth: '600px', marginTop: '32px', background: '#F0F9FF', border: '1px solid #BAE6FD' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0369A1', marginBottom: 10 }}>ℹ️ Language Impact</h3>
            <ul style={{ paddingLeft: '18px', color: '#0C4A6E', fontSize: 14, lineHeight: 1.8, listStyle: 'disc' }}>
              <li>SMS alerts will be sent in your selected language</li>
              <li>Voice alerts will use regional language (when available)</li>
              <li>Dashboard labels will update on next page load</li>
              <li>Broadcasts from admin will respect your preference</li>
            </ul>
          </div>

          {/* ── Live Sarvam AI Translation Demo ── */}
          <div className="card" style={{ maxWidth: '700px', marginTop: '24px', border: '2px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-secondary)', marginBottom: 6 }}>
              🤖 Live Sarvam AI Demo
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>
              Test real-time translation + voice synthesis for the selected language: <strong>{LANGUAGES.find(l => l.code === selected)?.native || selected}</strong>
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#374151' }}>Alert text (English):</label>
              <textarea rows={2} value={demoText} onChange={e => setDemoText(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <button onClick={runDemo} disabled={demoLoading || selected === 'en'}
                style={{ padding: '9px 20px', background: demoLoading ? '#9CA3AF' : 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: demoLoading || selected === 'en' ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                {demoLoading ? '⏳ Translating...' : '🌐 Translate + Generate Voice'}
              </button>
              {selected === 'en' && <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>Select a non-English language to demo</span>}
            </div>

            {demoError && <div style={{ background: '#FEE2E2', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#DC2626', marginBottom: 12 }}>⚠️ {demoError}</div>}

            {demoTranslated && (
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px 16px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>TRANSLATED ({LANGUAGES.find(l => l.code === selected)?.label}):</div>
                <div style={{ fontSize: 15, color: '#1F2937', lineHeight: 1.6 }}>{demoTranslated}</div>
              </div>
            )}

            {demoAudio && (
              <button onClick={playDemoAudio}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#16A34A', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                🔊 Play Voice Alert ({LANGUAGES.find(l => l.code === selected)?.native})
              </button>
            )}
            {demoTranslated && !demoAudio && !demoLoading && (
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Voice unavailable — add SARVAM_API_KEY to backend .env to enable TTS.</p>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default LanguagePage;

