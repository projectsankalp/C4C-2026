import React, { useState, useEffect } from 'react';
import { Sparkles, Volume2, VolumeX, Eye, HelpCircle, Layers, ZoomIn } from 'lucide-react';
import { t, speakText } from '../utils/translator';

export default function AIAssistant({ 
  currentScreen, 
  language, 
  ruralMode, 
  setRuralMode, 
  lowBandwidth, 
  setLowBandwidth, 
  largeText, 
  setLargeText 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPrompted, setHasPrompted] = useState({});

  // Map of guides for each screen
  const screenGuideKeys = {
    landing: "ai_guide_landing",
    whatsapp: "ai_guide_whatsapp",
    pipeline: "ai_guide_pipeline",
    marketplace: "ai_guide_marketplace",
    "product-detail": "ai_guide_detail",
    dashboard: "ai_guide_dashboard"
  };

  const getGuideText = () => {
    const key = screenGuideKeys[currentScreen] || "ai_guide_landing";
    return t(key, language);
  };

  // Speak guide text
  const triggerSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = getGuideText();
    setIsSpeaking(true);
    speakText(
      text, 
      language, 
      () => setIsSpeaking(true), 
      () => setIsSpeaking(false)
    );
  };

  // Automatically narrate when active screen changes in Rural Mode
  useEffect(() => {
    if (ruralMode && isOpen) {
      // Small timeout to let voice engines load
      const timer = setTimeout(() => {
        triggerSpeech();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, language, ruralMode]);

  // Cancel speech on screen navigation
  useEffect(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [currentScreen]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      
      {/* Expanded Assistant Dialog */}
      {isOpen && (
        <div className="w-80 glass-panel border border-gold-500/20 rounded-3xl p-5 shadow-luxury text-left animate-slide-up flex flex-col gap-4 text-charcoal">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gold-500/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-charcoal text-ivory flex items-center justify-center border border-white/10 relative">
                ह
                {isSpeaking && (
                  <span className="absolute -inset-1 rounded-full border border-terracotta/40 animate-ping" />
                )}
              </span>
              <div>
                <h4 className="text-xs font-bold tracking-wide">KritiCam AI Voice</h4>
                <p className="text-[9px] text-terracotta font-semibold uppercase tracking-wider">Assistant Interface</p>
              </div>
            </div>
            
            <button 
              onClick={triggerSpeech} 
              className={`p-2 rounded-full border transition-all duration-300 ${
                isSpeaking 
                  ? 'bg-terracotta border-terracotta text-white shadow-glow-terracotta' 
                  : 'bg-charcoal-50 border-gold-500/10 text-charcoal hover:bg-gold-100'
              }`}
              title={isSpeaking ? "Pause Narration" : "Listen to Guide"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Guide Text */}
          <div className="space-y-3 bg-charcoal-50/50 p-3.5 rounded-2xl border border-gold-500/5">
            <p className="text-xs text-charcoal-700 leading-relaxed font-light font-sans">
              {getGuideText()}
            </p>

            {/* Audio Waveform Graphic */}
            {isSpeaking && (
              <div className="flex items-end justify-center gap-1.5 h-7 pt-1.5 border-t border-gold-500/10">
                {[40, 80, 50, 90, 30, 70, 45, 95, 25, 60, 85, 40].map((h, i) => (
                  <span 
                    key={i} 
                    style={{ 
                      height: `${h}%`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '0.8s'
                    }} 
                    className="flex-1 bg-terracotta rounded-full min-w-[2.5px] animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Accessibility Settings */}
          <div className="space-y-3 pt-2">
            <p className="text-[9px] uppercase tracking-widest text-gold-600 font-bold">Accessibility Toolkit</p>
            
            {/* Rural Mode toggle */}
            <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-gold-500/10">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-terracotta" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Rural Mode</span>
              </div>
              <button
                onClick={() => {
                  setRuralMode(!ruralMode);
                  if (!ruralMode) {
                    setLowBandwidth(true);
                    setLargeText(true);
                  }
                }}
                className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${
                  ruralMode ? 'bg-terracotta' : 'bg-charcoal-100 border border-gold-500/10'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow-md ${
                  ruralMode ? 'right-0.5' : 'left-0.5'
                }`} />
              </button>
            </div>

            {/* Sub-toggles if Rural Mode is active */}
            {ruralMode && (
              <div className="pl-4 space-y-2.5 animate-slide-down">
                {/* Low Bandwidth */}
                <div className="flex items-center justify-between text-xs text-charcoal-700 font-light">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase font-sans">
                    <Eye className="w-3 h-3 text-gold-600" />
                    Pencil Stencils (Bandwidth)
                  </span>
                  <button
                    onClick={() => setLowBandwidth(!lowBandwidth)}
                    className={`w-7 h-4 rounded-full relative transition-all duration-300 ${
                      lowBandwidth ? 'bg-charcoal' : 'bg-charcoal-100'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
                      lowBandwidth ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Larger Text */}
                <div className="flex items-center justify-between text-xs text-charcoal-700 font-light">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase font-sans">
                    <ZoomIn className="w-3 h-3 text-gold-600" />
                    Enlarged Font
                  </span>
                  <button
                    onClick={() => setLargeText(!largeText)}
                    className={`w-7 h-4 rounded-full relative transition-all duration-300 ${
                      largeText ? 'bg-charcoal' : 'bg-charcoal-100'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
                      largeText ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Circle Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-charcoal text-ivory flex items-center justify-center shadow-luxury hover:bg-charcoal-900 border border-white/10 relative transition-all duration-300 group hover:scale-105"
        title="AI Speech & Accessibility assistant"
      >
        <span className="absolute -inset-1.5 rounded-full border border-gold-500/20 animate-pulse-subtle" />
        <span className="absolute -inset-0.5 rounded-full border border-terracotta/30 group-hover:scale-105 transition-transform" />
        
        <Sparkles className={`w-6.5 h-6.5 text-gold-400 group-hover:rotate-12 transition-transform ${isSpeaking ? 'animate-spin' : ''}`} />
        
        {/* Unread Alert Badge */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-terracotta border-2 border-ivory animate-bounce" />
        )}
      </button>
    </div>
  );
}
