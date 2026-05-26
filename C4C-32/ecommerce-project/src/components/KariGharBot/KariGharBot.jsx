import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiSend, FiX, FiMessageCircle, FiBookOpen, FiHelpCircle, FiChevronRight, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';
import './karigharbot.css';

const KariGharBot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Custom chat history
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const handleLanguageChange = () => {
    let nextLang = 'en';
    let nextLangLabel = 'English';
    if (language === 'en') {
      nextLang = 'hi';
      nextLangLabel = 'Hindi (हिन्दी)';
    } else if (language === 'hi') {
      nextLang = 'kn';
      nextLangLabel = 'Kannada (ಕನ್ನಡ)';
    } else {
      nextLang = 'en';
      nextLangLabel = 'English (India)';
    }
    
    changeLanguage(nextLang);
    toast.success(`Language assistance changed to ${nextLangLabel}`);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let text = '';
      if (nextLang === 'hi') {
        text = t('chatbot.ackHindi');
      } else if (nextLang === 'kn') {
        text = t('chatbot.ackKannada') || "ನಮಸ್ತೆ! ಈಗ ನಾನು ಕನ್ನಡದಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಬಹುದು. ❀";
      } else {
        text = t('chatbot.ackEnglish');
      }
      const ackMsg = {
        id: `a-lang-${Date.now()}`,
        sender: 'assistant',
        text: text
      };
      setMessages(prev => [...prev, ackMsg]);
    }, 1000);
  };

  // Auto-scroll to newest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Hide the floating tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Adapt introduction message & chips based on current active route!
  useEffect(() => {
    let introText = t('chatbot.introDefault');
    const path = location.pathname;

    if (path === '/') {
      introText = t('chatbot.introHome');
    } else if (path === '/categories') {
      introText = t('chatbot.introCategories');
    } else if (path.startsWith('/product/')) {
      introText = t('chatbot.introProduct');
    } else if (path === '/seller') {
      introText = t('chatbot.introSeller');
    } else if (path === '/help') {
      introText = t('chatbot.introHelp');
    } else if (path === '/login' || path === '/signup') {
      introText = t('chatbot.introLogin');
    }

    setMessages([
      {
        id: 'intro-auto',
        sender: 'assistant',
        text: introText
      }
    ]);
  }, [location.pathname, language]);

  // Handle Custom Question Submissions — calls Gemini API with website context
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          page: location.pathname,
          language: language === 'hi' ? 'Hindi' : language === 'kn' ? 'Kannada' : 'English',
        }),
      });

      const data = await response.json();
      const replyText = data.reply || "I'm sorry, I couldn't generate a response right now.";

      setIsTyping(false);
      const assistantMsg = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Gemini chat error:', err);
      setIsTyping(false);
      const fallbackMsg = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: t('chatbot.errorMsg')
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const handleChipClick = (chipText) => {
    handleSendMessage(chipText);
  };

  // Get dynamic chips based on current page
  const getPageSuggestChips = () => {
    const path = location.pathname;
    if (path === '/seller') {
      return [t('chatbot.chips.livingWage'), t('chatbot.chips.whatsapp'), t('chatbot.chips.voiceRec')];
    } else if (path === '/categories' || path === '/') {
      return [t('chatbot.chips.howOrder'), t('chatbot.chips.directFair'), t('chatbot.chips.meetArtisans')];
    } else if (path.startsWith('/product/')) {
      return [t('chatbot.chips.fragileShip'), t('chatbot.chips.loomWeave'), t('chatbot.chips.reviewGuide')];
    }
    return [t('chatbot.chips.genGuide'), t('chatbot.chips.otpVerify'), t('chatbot.chips.packagingStd')];
  };

  return (
    <div className="karigharbot-wrapper">
      
      {/* 1. FLOATING Figurine TRIGGER (Closed State) */}
      {!isOpen && (
        <div className="karigharbot-trigger-wrap">
          {showTooltip && (
            <div className="karigharbot-floating-tooltip">
              <span className="tooltip-close" onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}>&times;</span>
              <strong>{t('chatbot.tooltipText')}</strong> {t('chatbot.tooltipSub')}
            </div>
          )}
          
          <button className="karigharbot-avatar-trigger" onClick={() => { setIsOpen(true); setShowTooltip(false); }} title="Open KariGhar Companion">
            <img src="/karighar-assistant-lady.png" alt="KariGhar Assistant Standing Figurine" className="bot-lady-avatar-img" />
            <span className="bot-status-indicator pulse-green"></span>
          </button>
        </div>
      )}

      {/* 2. CHAT OVERLAY WINDOW + STANDING MASCOT (Open State) */}
      {isOpen && (
        <div className="karigharbot-active-container">
          
          {/* A. Chat Window Card */}
          <div className="karigharbot-chat-window animate-slide-up">
            
            {/* Header */}
            <div className="karigharbot-header-bar">
              <div className="bot-profile-info">
                <div className="bot-avatar-circle">
                  <img src="/karighar-assistant-lady.png" alt="KariGhar Lady Avatar" className="bot-header-img" />
                </div>
                <div>
                  <h4 className="bot-name-title">{t('chatbot.assistantName')}</h4>
                  <div className="bot-active-status">
                    <span className="active-dot"></span> {t('chatbot.onlineSupport')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={handleLanguageChange} style={{ color: 'var(--white-pure)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', background: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: '20px', cursor: 'pointer', border: 'none' }} title="Change Language">
                  <FiGlobe /> {language === 'en' ? 'En' : language === 'hi' ? 'हिन्दी' : 'ಕನ್ನಡ'}
                </button>
                <button className="bot-close-btn" onClick={() => setIsOpen(false)} title="Minimize Companion" style={{ cursor: 'pointer' }}>
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Messages Track */}
            <div className="karigharbot-messages-track">
              {messages.map(msg => (
                <div key={msg.id} className={`karighar-bubble ${msg.sender}`}>
                  {msg.text && msg.text.includes('[') ? (
                    // Simple markdown link parser for specific help button
                    <span>
                      {msg.text.split('[')[0]}
                      <span 
                        className="inline-link" 
                        onClick={() => { navigate('/help'); setIsOpen(false); }}
                      >
                        Artisan Support Hub
                      </span>
                      {msg.text.split(']')[1] || ''}
                    </span>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="karighar-typing-indicator karighar-bubble assistant">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion action chips */}
            <div className="karigharbot-chips-container">
              {getPageSuggestChips().map((chip, i) => (
                <button 
                  key={i} 
                  className="bot-action-chip"
                  onClick={() => handleChipClick(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input text form */}
            <div className="karigharbot-input-bar">
              <input 
                type="text" 
                placeholder={t('chatbot.inputPlaceholder')}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bot-text-field"
                disabled={isTyping}
              />
              <button 
                onClick={() => handleSendMessage()}
                className="bot-send-btn"
                disabled={isTyping || !inputText.trim()}
                title="Submit Inquiry"
              >
                <FiSend />
              </button>
            </div>

            {/* Footer branding */}
            <div className="bot-window-footer">
              {t('chatbot.footerBranding')}
            </div>

          </div>

          {/* B. Standing Arched Figurine Niche (Visual Mascot showing she is presenting the chat panel!) */}
          <div className="karigharbot-mascot-niche">
            <img src="/karighar-assistant-lady.png" alt="KariGhar Assistant Mascot" className="bot-lady-avatar-img" />
            <span className="bot-status-indicator pulse-green" style={{ top: '10px', right: '10px' }}></span>
          </div>

        </div>
      )}

    </div>
  );
};

export default KariGharBot;
