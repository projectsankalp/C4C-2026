import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react'; 
import { useChatStore } from '@/store/useChatStore';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

// --------------------------------------------------------
// PLACEHOLDER TRANSLATIONS
// --------------------------------------------------------
const PLACEHOLDER_TRANSLATIONS: Record<string, string> = {
  en: 'Type your response...',
  hi: 'अपना उत्तर टाइप करें...', // Hindi
  ta: 'உங்கள் பதிலை உள்ளிடவும்...', // Tamil
  te: 'మీ ప్రతిస్పందనను టైప్ చేయండి...', // Telugu
  bn: 'আপনার উত্তর টাইপ করুন...', // Bengali
  kan: 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ...' // Kannada
};

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  
  // Grab the selected language from your Zustand store
  const preferredLanguage = useChatStore((state) => state.profile.preferredLanguage) as string;
  const langCode = preferredLanguage || 'en';
  
  // Fallback to English if the language code isn't in our dictionary yet
  const placeholderText = PLACEHOLDER_TRANSLATIONS[langCode] || PLACEHOLDER_TRANSLATIONS['en'];

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4 bg-linear-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent sticky bottom-0 pb-6">
      <div className="max-w-3xl mx-auto relative flex items-center shadow-lg shadow-gray-200/50 rounded-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={placeholderText} // Inject the translated placeholder here!
          disabled={disabled}
          className="w-full bg-white border border-gray-200 text-slate-800 rounded-full px-6 py-4 pr-16 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 transition-all placeholder:text-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="absolute right-2.5 p-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 transition-colors transform hover:scale-105 active:scale-95 duration-200"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};