import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMic, FiMicOff, FiX, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5000';

/* ── Fallback keyword map (used when Gemini is unavailable) ─────────────── */
const FALLBACK_COMMANDS = [
  [['home', 'ghar', 'main', 'homepage'],                  '/'],
  [['shop', 'products', 'catalog', 'browse', 'buy'],      '/collections'],
  [['categories', 'category', 'collections'],             '/categories'],
  [['seller', 'artisan', 'dashboard', 'sell', 'upload'],  '/seller'],
  [['profile', 'account', 'my account'],                  '/profile'],
  [['login', 'sign in', 'log in'],                        '/login'],
  [['signup', 'register', 'sign up'],                     '/login?signup=true'],
  [['artisans', 'community', 'rooms', 'forum'],           '/artisans'],
  [['help', 'support', 'contact'],                        '/help'],
  [['cart', 'bag', 'basket'],                             'OPEN_CART'],
];

const fallbackMatch = (text) => {
  const lower = text.toLowerCase();
  for (const [kws, route] of FALLBACK_COMMANDS) {
    if (kws.some((kw) => lower.includes(kw))) return route;
  }
  return null;
};

const VoiceNav = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [showBubble, setShowBubble]     = useState(false);
  const [supported, setSupported]       = useState(true);
  const recognitionRef = useRef(null);
  const bubbleTimer    = useRef(null);

  /* ── Check browser support once on mount ─────────────────────────────── */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  /* ── Execute route or open cart ─────────────────────────────────────── */
  const executeRoute = useCallback((route, label) => {
    if (!route) {
      toast(`Didn't catch that — try: "home", "shop", "cart"`, { icon: '🤔' });
      return;
    }
    if (route === 'OPEN_CART') {
      window.dispatchEvent(new CustomEvent('karighar:open-cart'));
      toast.success('Opening cart', { icon: '🛒' });
    } else {
      toast.success(`→ ${label || route}`, { icon: '🎙️', duration: 2000 });
      navigate(route);
    }
  }, [navigate]);

  /* ── Send transcript to Gemini via backend ──────────────────────────── */
  const parseWithGemini = useCallback(async (text) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/api/voice/parse`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      executeRoute(data.route, data.label);
    } catch {
      // Network failure — fall back to keyword match
      const fallback = fallbackMatch(text);
      executeRoute(fallback, fallback?.replace('/', '') || text);
    } finally {
      setIsProcessing(false);
    }
  }, [executeRoute]);

  /* ── Start speech recognition ────────────────────────────────────────── */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error('Voice navigation not supported. Use Chrome or Edge.');
      return;
    }

    // Stop any previous instance cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (_) {}
    }

    const recognition         = new SR();
    recognition.lang          = 'en-IN';       // Indian English
    recognition.continuous    = false;          // stop after first utterance
    recognition.interimResults = false;         // only final results
    recognition.maxAlternatives = 3;            // get top-3 guesses
    recognitionRef.current    = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setShowBubble(true);
      clearTimeout(bubbleTimer.current);
    };

    recognition.onresult = (event) => {
      // Pick highest-confidence alternative
      const results = Array.from(event.results[0]);
      const best = results.reduce((a, b) => (b.confidence > a.confidence ? b : a));
      const spoken = best.transcript.trim();
      setTranscript(spoken);
      parseWithGemini(spoken);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const err = event.error;
      if (err === 'not-allowed' || err === 'permission-denied') {
        toast.error('Microphone access denied. Please allow it in browser settings.');
      } else if (err === 'network') {
        toast.error('Speech recognition requires internet connection.');
      } else if (err !== 'no-speech' && err !== 'aborted') {
        toast.error(`Voice error: ${err}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      bubbleTimer.current = setTimeout(() => setShowBubble(false), 3000);
    };

    try {
      recognition.start();
    } catch (err) {
      toast.error(`Could not start microphone: ${err.message}`);
    }
  }, [parseWithGemini]);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    try { recognitionRef.current?.abort(); } catch (_) {}
    clearTimeout(bubbleTimer.current);
  }, []);

  if (!supported) return null; // hide button if browser can't support it

  const isActive = isListening || isProcessing;

  return (
    <>
      {/* Floating mic button */}
      <button
        id="voice-nav-btn"
        onClick={isListening ? stopListening : startListening}
        disabled={isProcessing}
        title={isListening ? 'Stop listening' : 'Voice navigation (click & speak)'}
        style={{
          position:       'fixed',
          bottom:         '90px',
          right:          '24px',
          zIndex:         9999,
          width:          '52px',
          height:         '52px',
          borderRadius:   '50%',
          background: isListening
            ? 'linear-gradient(135deg, #e53935, #c62828)'
            : isProcessing
              ? 'linear-gradient(135deg, #f57c00, #e65100)'
              : 'linear-gradient(135deg, var(--primary-terracotta), #b5451b)',
          color:          'white',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow: isListening
            ? '0 0 0 8px rgba(229,57,53,0.25), 0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.25)',
          transition:     'all 0.25s ease',
          animation:      isListening ? 'voicePulse 1.2s infinite' : 'none',
          border:         'none',
          cursor:         isProcessing ? 'wait' : 'pointer',
          opacity:        isProcessing ? 0.85 : 1,
        }}
      >
        {isProcessing
          ? <FiLoader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          : isListening
            ? <FiMicOff size={20} />
            : <FiMic size={20} />}
      </button>

      {/* Speech bubble */}
      {showBubble && (
        <div style={{
          position:     'fixed',
          bottom:       '152px',
          right:        '16px',
          zIndex:       9998,
          background:   'var(--cream-card)',
          border:       '1px solid var(--cream-border)',
          borderRadius: '14px',
          padding:      '12px 16px',
          boxShadow:    'var(--shadow-premium)',
          maxWidth:     '240px',
          fontSize:     '13px',
          lineHeight:   '1.5',
          animation:    'fadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: '700', color: 'var(--primary-terracotta)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isListening ? '🔴 Listening...' : isProcessing ? '⏳ Processing...' : '✅ Done'}
            </span>
            <button onClick={() => setShowBubble(false)} style={{ color: 'var(--warm-charcoal-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <FiX size={14} />
            </button>
          </div>
          <p style={{ color: 'var(--warm-charcoal)', margin: 0 }}>
            {transcript
              ? `"${transcript}"`
              : 'Say anything — "show me the shop", "open my cart", "seller dashboard"…'}
          </p>
        </div>
      )}

      <style>{`
        @keyframes voicePulse {
          0%, 100% { box-shadow: 0 0 0 0px rgba(229,57,53,0.5), 0 4px 20px rgba(0,0,0,0.25); }
          50%       { box-shadow: 0 0 0 14px rgba(229,57,53,0.0), 0 4px 20px rgba(0,0,0,0.25); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default VoiceNav;
