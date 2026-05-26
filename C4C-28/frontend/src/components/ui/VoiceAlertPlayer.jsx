import { useEffect, useRef, useState } from 'react';

/**
 * VoiceAlertPlayer — auto-plays TTS audio when a new emergency alert arrives.
 * Props:
 *   alerts    — array of alert objects from /api/alerts/latest
 *   userLang  — 2-letter language code ('hi', 'mr', etc.)
 */
const VoiceAlertPlayer = ({ alerts = [], userLang = 'en' }) => {
  const [playing, setPlaying]   = useState(false);
  const [status, setStatus]     = useState('');
  const audioRef                = useRef(null);
  const lastPlayedRef           = useRef(null);

  useEffect(() => {
    const newEmergency = alerts.find(
      a => a.is_new && (a.severity_level === 'emergency' || a.severity_level === 'high')
    );

    if (!newEmergency) return;
    if (newEmergency.id === lastPlayedRef.current) return; // already played
    lastPlayedRef.current = newEmergency.id;

    playAlertAudio(newEmergency.message, userLang);
  }, [alerts, userLang]);

  const playAlertAudio = async (message, lang) => {
    setStatus('Generating voice alert...');
    setPlaying(true);
    try {
      const res = await fetch('/api/sarvam/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('sv_token')}` },
        body: JSON.stringify({ text: message, lang }),
      });
      const json = await res.json();
      if (json.success && json.data.audio_base64) {
        const audioBlob  = base64ToBlob(json.data.audio_base64, 'audio/wav');
        const audioUrl   = URL.createObjectURL(audioBlob);
        const audio      = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => { setPlaying(false); setStatus(''); URL.revokeObjectURL(audioUrl); };
        setStatus('🔊 Emergency alert playing...');
      } else {
        setPlaying(false);
        setStatus('');
      }
    } catch (err) {
      setPlaying(false);
      setStatus('');
    }
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setPlaying(false);
    setStatus('');
  };

  if (!playing && !status) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      background: '#DC2626', color: '#fff', borderRadius: '12px',
      padding: '14px 20px', boxShadow: '0 8px 32px rgba(220,38,38,0.4)',
      display: 'flex', alignItems: 'center', gap: '12px',
      animation: 'slideInRight 0.3s ease',
      maxWidth: '340px',
    }}>
      <span style={{ fontSize: 24, animation: 'pulse 1s infinite' }}>🚨</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>Emergency Voice Alert</div>
        <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{status}</div>
      </div>
      <button onClick={stopAudio} style={{
        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6,
        color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: 12,
      }}>Stop</button>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(120px); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
};

function base64ToBlob(b64, mimeType) {
  const binary = atob(b64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

export default VoiceAlertPlayer;
