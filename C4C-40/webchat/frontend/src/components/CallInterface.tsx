'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, User, Bot } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const CallInterface = () => {
  const { setCallMode, updateProfileField } = useChatStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcriptStatus, setTranscriptStatus] = useState('Connecting to AI...');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const aiSpeakingRef = useRef(false);
  const isMutedRef = useRef(false);
  const processingRef = useRef(false); // NEW: Auto-mute lock while waiting for backend
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => { aiSpeakingRef.current = aiSpeaking; }, [aiSpeaking]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphoneNode: MediaStreamAudioSourceNode;
    let animationFrameId: number;
    let silenceTimer: NodeJS.Timeout | null = null;
    let isUserSpeaking = false;

    // Hardcoded IP to avoid double-slash bugs
    const WS_URL = "wss://kaarigarconnect-production.up.railway.app/api/v1/automate/ws/onboard/voice/user_123";
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (wsRef.current?.readyState === WebSocket.OPEN && audioChunksRef.current.length > 0) {
            wsRef.current.send(audioBlob);
          }
          audioChunksRef.current = []; 
        };

        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphoneNode = audioContext.createMediaStreamSource(stream);
        microphoneNode.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectSilence = () => {
          // AUTO-MUTE: Ignore mic if AI is speaking, user is muted, OR we are waiting for processing
          if (aiSpeakingRef.current || isMutedRef.current || processingRef.current) {
            animationFrameId = requestAnimationFrame(detectSilence);
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          const averageVolume = dataArray.reduce((a, b) => a + b) / dataArray.length;

          const THRESHOLD = 15; // Increased to block background fan noise/static

          if (averageVolume > THRESHOLD) { 
            // We hear actual loud speech
            if (!isUserSpeaking) {
              isUserSpeaking = true;
              setTranscriptStatus('Recording...');
              if (mediaRecorder.state === 'inactive') mediaRecorder.start();
            }
            
            // Cancel the silence timer because the user is still talking
            if (silenceTimer) {
              clearTimeout(silenceTimer);
              silenceTimer = null;
            }
          } else {
            // Volume dropped to silence
            if (isUserSpeaking && !silenceTimer) {
              // Start a 1.5s countdown before cutting them off
              silenceTimer = setTimeout(() => {
                isUserSpeaking = false;
                processingRef.current = true; // LOCK THE MIC instantly
                setTranscriptStatus('Processing AI...');
                
                if (mediaRecorder.state === 'recording') {
                  mediaRecorder.stop(); 
                }
                silenceTimer = null;
              }, 1500); 
            }
          }

          animationFrameId = requestAnimationFrame(detectSilence);
        };

        detectSilence();

      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    };

    ws.onopen = () => {
      startRecording();
    };

    ws.onmessage = (event) => {
      // Ghost Lock: Ignore duplicate Strict Mode websockets
      if (wsRef.current !== ws) return; 

      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "SPEAKING") {
          setAiSpeaking(true);
          setTranscriptStatus('AI is speaking...');

          if (data.payload.user_transcription) {
            setMessages(prev => [
              ...prev, 
              { id: Date.now().toString() + 'u', sender: 'user', text: data.payload.user_transcription }
            ]);
          }

          if (data.payload.ai_response_text) {
             setMessages(prev => [
              ...prev, 
              { id: Date.now().toString() + 'a', sender: 'ai', text: data.payload.ai_response_text }
            ]);
          }

          if (data.payload.audio_data) {
            // Destroy old audio before playing new to prevent overlays
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              currentAudioRef.current.removeAttribute('src');
              currentAudioRef.current.load();
              currentAudioRef.current = null;
            }

            const audio = new Audio(data.payload.audio_data);
            currentAudioRef.current = audio;

            audio.onended = () => {
              setAiSpeaking(false);
              processingRef.current = false; // UNLOCK THE MIC
              setTranscriptStatus('Ready. Start speaking...');
            };

            audio.play().catch(e => {
              console.error("Audio Auto-Play Blocked:", e);
              setAiSpeaking(false); 
              processingRef.current = false; // UNLOCK THE MIC on failure
              setTranscriptStatus('Ready. Start speaking (Audio muted)');
            });
          } else {
            setAiSpeaking(false);
            processingRef.current = false; // UNLOCK THE MIC
            setTranscriptStatus('Ready. Start speaking...');
          }

          const newData = data.payload.extracted_form_data;
          if (newData && Object.keys(newData).length > 0) {
            Object.entries(newData).forEach(([key, value]) => {
              const cleanValue = typeof value === 'string' && key === 'mobileNumber' 
                ? value.replace(/,/g, '') 
                : value;
              updateProfileField(key as any, cleanValue);
            });
          }
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      if (wsRef.current === ws) setTranscriptStatus("Call ended.");
    };

    return () => {
      if (wsRef.current === ws) wsRef.current.close();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      
      if (currentAudioRef.current) { 
        currentAudioRef.current.pause(); 
        currentAudioRef.current.removeAttribute('src');
        currentAudioRef.current.load();
      }
      
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (silenceTimer) clearTimeout(silenceTimer);
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full h-full bg-[#FAFAFA] animate-fade-in-up">
      <div className="flex-1 flex flex-col items-center justify-between p-8 border-b md:border-b-0 md:border-r border-slate-200">
        <div className="flex flex-col items-center mt-4">
          <div className="text-emerald-500 font-medium tracking-widest text-sm uppercase mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Call
          </div>
          <div className="text-slate-400 font-mono text-lg">{formatTime(callDuration)}</div>
        </div>

        <div className="relative flex items-center justify-center w-full flex-1">
          {aiSpeaking && (
            <>
              <div className="absolute w-48 h-48 bg-indigo-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute w-64 h-64 bg-indigo-500/5 rounded-full animate-ping delay-300" style={{ animationDuration: '3s' }} />
            </>
          )}

          <div className={`relative z-10 w-36 h-36 rounded-full flex items-center justify-center transition-all duration-1000 ${aiSpeaking ? 'bg-indigo-600 shadow-[0_0_60px_rgba(79,70,229,0.5)] scale-105' : 'bg-slate-800 shadow-xl scale-100'}`}>
            <Volume2 size={48} className={aiSpeaking ? 'text-white animate-pulse' : 'text-slate-400'} />
          </div>

          <div className="absolute bottom-10 left-0 w-full text-center px-6">
            <p className={`text-lg font-medium transition-opacity duration-300 ${isMuted ? 'text-red-400' : 'text-slate-700'}`}>
              {transcriptStatus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md ${isMuted ? 'bg-slate-200 text-slate-500' : 'bg-white text-slate-800 border'}`}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <button onClick={() => setCallMode(false)} className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all hover:scale-105">
            <PhoneOff size={32} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 bg-white overflow-hidden max-h-screen">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b">Live Transcript</h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-20">
          {messages.length === 0 ? (
            <p className="text-slate-400 text-center mt-10">Conversation will appear here...</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-800 text-white'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
};