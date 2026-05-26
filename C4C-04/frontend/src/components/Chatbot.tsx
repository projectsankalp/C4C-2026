import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const languageMap: Record<string, string> = {
  'English': 'en-IN',
  'Hindi': 'hi-IN',
  'Tamil': 'ta-IN',
  'Bengali': 'bn-IN',
  'Kannada': 'kn-IN',
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Namaste. I am MindMitra. How are you feeling today?' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [sessions, setSessions] = useState<{session_id: string, preview: string, timestamp: string}[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const res = await fetch(`http://localhost:8000/api/chat/history?user_id=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      setCurrentSessionId(sessionId);
      const res = await fetch(`http://localhost:8000/api/chat/session/${sessionId}?user_id=${session.user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([{ role: 'assistant', content: 'Namaste. I am MindMitra. How are you feeling today?' }]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(Date.now().toString());
    setMessages([{ role: 'assistant', content: 'Namaste. I am MindMitra. How are you feeling today?' }]);
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = languageMap[language] || 'en-IN';
    utterance.lang = langCode;
    
    // Explicitly set the voice to match the language if available
    let voice = voices.find(v => v.lang === langCode || v.lang.replace('_', '-').toLowerCase().startsWith(langCode.split('-')[0]));
    
    // Fallback: Try matching by language name (e.g. "Kannada")
    if (!voice) {
      voice = voices.find(v => v.name.toLowerCase().includes(language.toLowerCase()));
    }

    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`No native voice found for ${language} (${langCode}).`);
      // If no native voice is found for regional languages, the default English voice will fail to read it.
      if (language !== 'English') {
         // Optionally, we could show a toast here, but we will just let the browser try its best.
      }
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please try using Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = languageMap[language] || 'en-IN';
    // Using interimResults allows us to see partial speech
    recognition.interimResults = true;
    recognition.continuous = false;
    
    let currentInterim = '';

    recognition.onstart = () => {
      setIsListening(true);
      stopSpeaking(); // stop speaking when listening starts
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setInput(prev => {
          // Remove the previous interim text if any, and append the final transcript
          const base = prev.endsWith(currentInterim) ? prev.slice(0, -currentInterim.length) : prev;
          return base + (base && !base.endsWith(' ') ? ' ' : '') + finalTranscript;
        });
        currentInterim = '';
      } else if (interimTranscript) {
        setInput(prev => {
          const base = prev.endsWith(currentInterim) ? prev.slice(0, -currentInterim.length) : prev;
          return base + (base && !base.endsWith(' ') ? ' ' : '') + interimTranscript;
        });
        currentInterim = interimTranscript;
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'language-not-supported') {
        alert(`Your browser does not support voice input for ${language}. Try installing the ${language} language pack in your OS settings or use Google Chrome.`);
      } else if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone permissions.");
      }
      
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // SOS Detection
    const threatWords = ['suicide', 'kill myself', 'die', 'end my life', 'harm myself', 'can\'t take it anymore'];
    const isCrisis = threatWords.some(w => input.toLowerCase().includes(w));
    
    if (isCrisis) {
      activateSOS();
    }
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    stopSpeaking(); // stop any ongoing speech

    // Fetch response from backend
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous';

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          language,
          user_id: userId,
          session_id: currentSessionId
        })
      });
      
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = '';
      
      // Add an empty assistant message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullReply += chunk;
        
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullReply;
          return newMessages;
        });
      }
      
      fetchHistory(); // Update history list after the bot replies
    } catch (error) {
      const errorMsg = 'Sorry, I am having trouble connecting to the server.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
    }
  };

  const activateSOS = async () => {
    setSosTriggered(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      
      let loc = { lat: 0, lng: 0 };
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          await sendSOSAlert(session.user.id, session.user.user_metadata?.full_name || 'A user', loc, input);
        }, async () => {
          await sendSOSAlert(session.user.id, session.user.user_metadata?.full_name || 'A user', loc, input); // fallback without precise loc
        });
      } else {
        await sendSOSAlert(session.user.id, session.user.user_metadata?.full_name || 'A user', loc, input);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendSOSAlert = async (userId: string, userName: string, location: any, msg: string) => {
    try {
      await fetch('http://localhost:8000/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_name: userName,
          location,
          message: msg
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', height: '80vh', display: 'flex', position: 'relative', overflow: 'hidden', padding: 0 }}>
      
      {/* Sidebar */}
      <div style={{ width: '280px', minWidth: '280px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', background: 'rgba(126, 200, 227, 0.05)' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={startNewChat}>+ New Chat</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.length === 0 && <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No previous chats</p>}
          {sessions.map(s => (
            <div 
              key={s.session_id} 
              onClick={() => loadSession(s.session_id)} 
              style={{ 
                padding: '1rem', 
                borderBottom: '1px solid var(--glass-border)', 
                cursor: 'pointer', 
                background: currentSessionId === s.session_id ? 'rgba(126, 200, 227, 0.2)' : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { if (currentSessionId !== s.session_id) e.currentTarget.style.background = 'rgba(126, 200, 227, 0.1)'; }}
              onMouseOut={(e) => { if (currentSessionId !== s.session_id) e.currentTarget.style.background = 'transparent'; }}
            >
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: currentSessionId === s.session_id ? 600 : 400 }}>{s.preview}</p>
              <small style={{ color: 'var(--text-secondary)' }}>{new Date(s.timestamp).toLocaleDateString()} {new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', position: 'relative' }}>
        {sosTriggered && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(167, 223, 243, 0.95)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', padding: '2rem', textAlign: 'center', color: '#1F2D3D', animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1F2D3D', marginBottom: '1rem' }}>🚨 SOS ACTIVATED</h2>
            <p style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '2rem' }}>
              We've detected that you might be in crisis. Your emergency contacts have been notified with your current location.
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              Help is on the way. Please stay strong and wait for someone to contact you. <br/><br/>
              <strong>National Helpline: 988</strong>
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>SATHVA: DEEP WELLNESS AUTHENTICITY</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={stopSpeaking} 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
              title="Stop Audio"
            >
              🔇
            </button>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '0.25rem' }}>
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Bengali</option>
              <option>Kannada</option>
            </select>
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '1rem' }}>
          {messages.map((msg, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(126, 200, 227, 0.1)', color: msg.role === 'user' ? 'white' : 'var(--text-primary)', padding: '0.75rem 1rem', borderRadius: '12px', maxWidth: '80%', border: msg.role === 'user' ? 'none' : '1px solid rgba(126, 200, 227, 0.2)' }}>
                {msg.content}
              </div>
              {msg.role === 'assistant' && (
                <button 
                  onClick={() => speak(msg.content)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', cursor: 'pointer' }}
                  title="Play Audio"
                >
                  🔊 Play
                </button>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
          <button 
            onClick={toggleListening} 
            style={{ 
              padding: '0.75rem', 
              borderRadius: '50%', 
              border: 'none', 
              background: isListening ? 'var(--accent-secondary)' : 'var(--bg-secondary)',
              color: isListening ? 'white' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              transition: 'background 0.3s'
            }}
            title={isListening ? "Listening... Click to stop" : "Voice Input"}
          >
            🎤
          </button>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '999px', border: '1px solid rgba(126, 200, 227, 0.2)', background: 'rgba(126, 200, 227, 0.05)', color: 'var(--text-primary)' }}
          />
          <button className="btn btn-primary" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
