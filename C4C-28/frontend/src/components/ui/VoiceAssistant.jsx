import { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Send } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const STT_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'kn', label: 'Kannada' },
  { code: 'te', label: 'Telugu' },
];

const VoiceAssistant = ({ lang = 'hi', isOpen = false, onToggle }) => {
  const [state, setState]            = useState('idle');
  const [transcript, setTranscript]  = useState('');
  const [reply, setReply]            = useState('');
  const [error, setError]            = useState('');
  const [textInput, setTextInput]    = useState('');
  const [speakLang, setSpeakLang]    = useState('en'); // language user is SPEAKING in
  const mediaRecRef                  = useRef(null);
  const chunksRef                    = useRef([]);
  const audioRef                     = useRef(null);

  const token = localStorage.getItem('sv_token') || '';
  // Reply language = user's preferred display language
  const replyLang = localStorage.getItem('sv_lang') || lang;

  const startRecording = async () => {
    setError(''); setTranscript(''); setReply('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const rec = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); processAudio(); };
      mediaRecRef.current = rec;
      rec.start(250);
      setState('recording');
      setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, 8000);
    } catch (err) {
      setError('Microphone access denied. Type your question below instead.');
      setState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecRef.current?.state === 'recording') mediaRecRef.current.stop();
  };

  const processAudio = async () => {
    setState('processing');
    try {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      if (audioBlob.size < 1000) {
        setError('Recording too short. Speak for at least 1 second.');
        setState('idle');
        return;
      }
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('lang', replyLang);       // reply language
      formData.append('stt_lang', speakLang);    // what user is speaking

      const res  = await fetch(`${API_BASE}/sarvam/voice-assistant`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      handleResponse(json);
    } catch (err) {
      setError('Network error. Try typing your question instead.');
      setState('idle');
    }
  };

  const sendTextQuery = async () => {
    const question = textInput.trim();
    if (!question) return;
    setError(''); setTranscript(question); setReply(''); setTextInput('');
    setState('processing');
    try {
      const res = await fetch(`${API_BASE}/sarvam/voice-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ text: question, lang: replyLang }),
      });
      handleResponse(await res.json());
    } catch (err) {
      setError('Network error. Make sure backend is running.');
      setState('idle');
    }
  };

  const handleResponse = (json) => {
    if (json.success) {
      setTranscript(json.data.transcript || '');
      setReply(json.data.reply_text || '');
      if (json.data.audio_base64) {
        playAudio(json.data.audio_base64);
      } else {
        setState('idle');
      }
    } else {
      setError(json.message || 'Could not get answer. Try typing instead.');
      setState('idle');
    }
  };

  const playAudio = (b64) => {
    setState('speaking');
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    audio.onended = () => { setState('idle'); URL.revokeObjectURL(url); };
  };

  const stopSpeaking = () => {
    if (audioRef.current) audioRef.current.pause();
    setState('idle');
  };

  const stateConfig = {
    idle:       { label: 'Ask about AQI',  color: '#1B3A5C', icon: <Mic size={22} /> },
    recording:  { label: 'Listening...',   color: '#DC2626', icon: <MicOff size={22} /> },
    processing: { label: 'Thinking...',    color: '#F59E0B', icon: <Volume2 size={22} /> },
    speaking:   { label: 'Speaking...',    color: '#16A34A', icon: <Volume2 size={22} /> },
  };
  const cfg = stateConfig[state];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '90px', right: '24px', zIndex: 9998,
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px',
      boxShadow: '0 16px 48px rgba(0,0,0,0.15)', width: '340px',
      overflow: 'hidden', animation: 'fadeInUp 0.25s ease',
    }}>
      {/* Header */}
      <div style={{ background: 'var(--color-secondary, #1B3A5C)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>🍃 Vayu Assistant</div>
          <div style={{ color: '#93C5FD', fontSize: 11, marginTop: 2 }}>Ask about air quality</div>
        </div>
        <button onClick={onToggle} style={{ background: 'transparent', border: 'none', color: '#93C5FD', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      {/* Chat area */}
      <div style={{ padding: '14px 16px', minHeight: '90px', maxHeight: '200px', overflowY: 'auto' }}>
        {transcript && (
          <div style={{ background: '#F3F4F6', borderRadius: '12px 12px 4px 12px', padding: '10px 14px', marginBottom: 10, fontSize: 13, color: '#374151' }}>
            <span style={{ fontSize: 10, color: '#9CA3AF', display: 'block', marginBottom: 3 }}>You asked:</span>
            {transcript}
          </div>
        )}
        {reply && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', marginBottom: 10, fontSize: 13, color: '#1E40AF' }}>
            <span style={{ fontSize: 10, color: '#60A5FA', display: 'block', marginBottom: 3 }}>Vayu Assistant:</span>
            {reply}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEE2E2', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#DC2626' }}>⚠️ {error}</div>
        )}
        {state === 'idle' && !transcript && !error && (
          <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 12 }}>
            Type or speak your question<br />
            <em style={{ color: '#6B7280' }}>"What is the AQI today?"</em>
          </p>
        )}
        {state === 'processing' && (
          <div style={{ textAlign: 'center', color: '#F59E0B', fontSize: 13, padding: '12px 0' }}>
            <div style={{ fontSize: 24, marginBottom: 6, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
            <p>Processing...</p>
          </div>
        )}
      </div>

      {/* Text input */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8 }}>
        <input
          type="text" placeholder="Type a question..."
          value={textInput} onChange={e => setTextInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendTextQuery(); }}
          disabled={state !== 'idle'}
          style={{
            flex: 1, padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8,
            fontSize: 13, outline: 'none', color: '#374151',
            background: state !== 'idle' ? '#F9FAFB' : '#fff',
          }}
        />
        <button onClick={sendTextQuery}
          disabled={state !== 'idle' || !textInput.trim()}
          style={{
            width: 38, height: 38, borderRadius: 8, border: 'none',
            background: textInput.trim() && state === 'idle' ? 'var(--color-primary, #FF6B00)' : '#E5E7EB',
            color: '#fff', cursor: textInput.trim() && state === 'idle' ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        ><Send size={16} /></button>
      </div>

      {/* Divider + language selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '4px 16px 6px', fontSize: 11, color: '#9CA3AF' }}>
        <span>— or speak in:</span>
        <select value={speakLang} onChange={e => setSpeakLang(e.target.value)}
          style={{ fontSize: 11, border: '1px solid #E5E7EB', borderRadius: 4, padding: '2px 4px', color: '#374151', background: '#fff', cursor: 'pointer' }}>
          {STT_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <span>—</span>
      </div>

      {/* Mic button */}
      <div style={{ padding: '4px 16px 14px', display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button
          onClick={state === 'idle' ? startRecording : state === 'recording' ? stopRecording : state === 'speaking' ? stopSpeaking : undefined}
          disabled={state === 'processing'}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none',
            background: cfg.color, color: '#fff',
            cursor: state === 'processing' ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: state === 'recording' ? '0 0 0 8px rgba(220,38,38,0.2)' : '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s',
            animation: state === 'recording' ? 'pulseRing 1.5s infinite' : 'none',
          }}
        >{cfg.icon}</button>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{cfg.label}</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>
            {state === 'recording' ? 'Tap to stop' : 'Tap to speak'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { transform: translateY(20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes pulseRing { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.3); } 50% { box-shadow: 0 0 0 12px rgba(220,38,38,0.05); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;
