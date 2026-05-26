import React, { useState, useEffect } from 'react';
import { FiMic, FiMicOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../../../styles/karigar-seller.css';

const SellerLayout = ({ children, onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'hi-IN'; // Default to Hindi or English mixed for rural artisans

      rec.onstart = () => {
        setIsListening(true);
        toast.success("Main sun rahi hoon... Kahiye (I am listening... Please speak)", { id: 'mic-toast' });
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        toast.success(`Humne suna: "${text}"`, { id: 'mic-toast' });
        if (onVoiceInput) {
          onVoiceInput(text);
        }
      };

      rec.onerror = (e) => {
        setIsListening(false);
        if (e.error === 'not-allowed') {
          toast.error("Kripya microphone ki permission dein (Please allow mic access)", { id: 'mic-toast' });
        } else {
          // Mock input fallback for typing-less demonstration
          const mockPhrases = [
            "Radha Devi", 
            "123456", 
            "9876543210", 
            "Rajasthan", 
            "Jaipur"
          ];
          const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
          toast.success(`Simulation: "${randomPhrase}"`, { id: 'mic-toast' });
          if (onVoiceInput) onVoiceInput(randomPhrase);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onVoiceInput]);

  const handleMicClick = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      if (recognition) {
        recognition.start();
      } else {
        // Fallback simulation
        setIsListening(true);
        toast.success("Main sun rahi hoon... (Listening simulation)", { id: 'mic-toast' });
        setTimeout(() => {
          setIsListening(false);
          const mockPhrases = ["Radha Devi", "1234", "9876543210", "Rajasthan", "Jaipur"];
          const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
          toast.success(`Suna gaya: "${randomPhrase}"`, { id: 'mic-toast' });
          if (onVoiceInput) onVoiceInput(randomPhrase);
        }, 2000);
      }
    }
  };

  return (
    <div className="karigar-app topo-bg relative flex flex-col justify-between overflow-y-auto">
      {/* Floating Leaves */}
      <svg className="leaf-pattern top-10 left-10 w-16 h-16 text-[#8B3A1A]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.33,18C12,18 16.5,15.5 19.5,12C21,10 22,5 22,3C20.5,4.5 18.5,6.5 17,8M12,14C11.5,14 11,13.5 11,13C11,11.5 13,10.5 14,9C13.5,10.5 12.5,12.5 12,14Z" />
      </svg>
      <svg className="leaf-pattern bottom-20 right-12 w-20 h-20 text-[#8B3A1A]" style={{ animationDelay: '2s' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.33,18C12,18 16.5,15.5 19.5,12C21,10 22,5 22,3C20.5,4.5 18.5,6.5 17,8M12,14C11.5,14 11,13.5 11,13C11,11.5 13,10.5 14,9C13.5,10.5 12.5,12.5 12,14Z" />
      </svg>
      <svg className="leaf-pattern top-1/3 right-1/4 w-12 h-12 text-[#2D5A3D]" style={{ animationDelay: '1s', opacity: 0.08 }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.33,18C12,18 16.5,15.5 19.5,12C21,10 22,5 22,3C20.5,4.5 18.5,6.5 17,8M12,14C11.5,14 11,13.5 11,13C11,11.5 13,10.5 14,9C13.5,10.5 12.5,12.5 12,14Z" />
      </svg>

      <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 md:px-12 py-6 flex flex-col justify-between">
        {children}
      </div>

      {/* Persistent floating circular mic button */}
      <div className="karigar-mic-floating">
        <button 
          id="karigar-mic-trigger"
          onClick={handleMicClick}
          className={`karigar-mic-btn ${isListening ? 'listening' : ''}`}
          aria-label="Tap to speak"
        >
          {isListening ? (
            <FiMicOff className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <FiMic className="w-8 h-8 text-white" />
          )}
        </button>
        <span className="karigar-mic-label">Tap to speak</span>
      </div>
    </div>
  );
};

export default SellerLayout;
