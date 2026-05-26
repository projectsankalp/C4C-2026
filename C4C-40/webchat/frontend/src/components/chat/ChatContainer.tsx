'use client';
import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { SidePanel } from '../SidePanel';
import { CallInterface } from '../CallInterface'; 
import { Option, Message } from '@/types/chat';
import ONBOARDING_STEPS from '../data/onboardingFields';
import { Menu, Phone } from 'lucide-react';
import { getLocalizedData } from '../data/localizedData';

// --------------------------------------------------------
// STATIC UI TRANSLATIONS (For the remaining onboarding questions)
// --------------------------------------------------------
const QUESTION_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: { // Hindi
    'Which state or union territory is your business based in?': 'आपका व्यवसाय किस राज्य या केंद्र शासित प्रदेश में स्थित है?',
    'What stage is your business currently in?': 'आपका व्यवसाय वर्तमान में किस चरण में है?',
    'What best describes your business?': 'आपके व्यवसाय का सबसे अच्छा वर्णन क्या करता है?',
    'What is your approximate annual revenue?': 'आपका अनुमानित वार्षिक राजस्व क्या है?',
    'What kind of support are you looking for right now?': 'आप अभी किस प्रकार की सहायता की तलाश में हैं?',
    'Which registrations or memberships do you already have?': 'आपके पास पहले से कौन से पंजीकरण या सदस्यताएँ हैं?'
  },
  ta: { // Tamil
    'Which state or union territory is your business based in?': 'உங்கள் வணிகம் எந்த மாநிலம் அல்லது யூனியன் பிரதேசத்தில் அமைந்துள்ளது?',
    'What stage is your business currently in?': 'உங்கள் வணிகம் தற்போது எந்த நிலையில் உள்ளது?',
    'What best describes your business?': 'உங்கள் வணிகத்தை சிறப்பாக விவரிப்பது எது?',
    'What is your approximate annual revenue?': 'உங்கள் தோராயமான ஆண்டு வருமானம் என்ன?',
    'What kind of support are you looking for right now?': 'நீங்கள் தற்போது என்ன வகையான ஆதரவைத் தேடுகிறீர்கள்?',
    'Which registrations or memberships do you already have?': 'உங்களிடம் ஏற்கனவே எந்தப் பதிவுகள் அல்லது மெம்பர்ஷிப்கள் உள்ளன?'
  },
  te: { // Telugu
    'Which state or union territory is your business based in?': 'మీ వ్యాపారం ఏ రాష్ట్రం లేదా కేంద్రపాలిత ప్రాంతంలో ఉంది?',
    'What stage is your business currently in?': 'మీ వ్యాపారం ప్రస్తుతం ఏ దశలో ఉంది?',
    'What best describes your business?': 'మీ వ్యాపారాన్ని ఏది ఉత్తమంగా వివరిస్తుంది?',
    'What is your approximate annual revenue?': 'మీ అంచనా వార్షిక ఆదాయం ఎంత?',
    'What kind of support are you looking for right now?': 'మీరు ప్రస్తుతం ఎలాంటి మద్దతు కోసం చూస్తున్నారు?',
    'Which registrations or memberships do you already have?': 'మీకు ఇప్పటికే ఏ రిజిస్ట్రేషన్‌లు లేదా సభ్యత్వాలు ఉన్నాయి?'
  },
  bn: { // Bengali
    'Which state or union territory is your business based in?': 'আপনার ব্যবসা কোন রাজ্য বা কেন্দ্রশাসিত অঞ্চলে অবস্থিত?',
    'What stage is your business currently in?': 'আপনার ব্যবসা বর্তমানে কোন পর্যায়ে আছে?',
    'What best describes your business?': 'কোনটি আপনার ব্যবসাকে সবচেয়ে ভালোভাবে বর্ণনা করে?',
    'What is your approximate annual revenue?': 'আপনার আনুমানিক বার্ষিক আয় কত?',
    'What kind of support are you looking for right now?': 'আপনি এই মুহূর্তে কি ধরনের সমর্থন খুঁজছেন?',
    'Which registrations or memberships do you already have?': 'আপনার ইতিমধ্যে কোন নিবন্ধন বা সদস্যপদ আছে?'
  },
  kan: { // Kannada
    'Which state or union territory is your business based in?': 'ನಿಮ್ಮ ವ್ಯಾಪಾರವು ಯಾವ ರಾಜ್ಯ ಅಥವಾ ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶದಲ್ಲಿದೆ?',
    'What stage is your business currently in?': 'ನಿಮ್ಮ ವ್ಯಾಪಾರವು ಪ್ರಸ್ತುತ ಯಾವ ಹಂತದಲ್ಲಿದೆ?',
    'What best describes your business?': 'ನಿಮ್ಮ ವ್ಯಾಪಾರವನ್ನು ಯಾವುದು ಉತ್ತಮವಾಗಿ ವಿವರಿಸುತ್ತದೆ?',
    'What is your approximate annual revenue?': 'ನಿಮ್ಮ ಅಂದಾಜು ವಾರ್ಷಿಕ ಆದಾಯ ಎಷ್ಟು?',
    'What kind of support are you looking for right now?': 'ನೀವು ಪ್ರಸ್ತುತ ಯಾವ ರೀತಿಯ ಬೆಂಬಲವನ್ನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?',
    'Which registrations or memberships do you already have?': 'ನೀವು ಈಗಾಗಲೇ ಯಾವ ನೋಂದಣಿಗಳು ಅಥವಾ ಸದಸ್ಯತ್ವಗಳನ್ನು ಹೊಂದಿದ್ದೀರಿ?'
  }
};

export const ChatContainer = () => {
  const { 
    messages, addMessage: addMessageBase, updateProfileField, clearOptionsFromLastMessage, 
    isBotTyping, setBotTyping, profile, setSidePanel, isSidePanelOpen, 
    sidePanelView, sidePanelData, isCallMode, setCallMode,
    isOnboardingComplete, setOnboardingComplete
  } = useChatStore();
  const addMessage = addMessageBase as (message: Message & {
    matchedSchemes?: any;
    requiresUpload?: boolean;
  }) => void;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const getNextStepIndex = () => {
    return ONBOARDING_STEPS.findIndex(step => {
      const val = profile[step.field as keyof typeof profile];
      return val === undefined || val === '' || (Array.isArray(val) && val.length === 0);
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, value?: any) => {
    // 1. Add user message to UI immediately
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content };
    addMessage(userMsg);

    // 2. IF STILL ONBOARDING: Run the scripted flow
    if (!isOnboardingComplete) {
      const stepIndex = getNextStepIndex();
      
      if (stepIndex !== -1) {
        const currentStep = ONBOARDING_STEPS[stepIndex];
        updateProfileField(currentStep.field as any, value || content);
      }
      
      triggerNextStep(stepIndex);
      return;
    }

    // 3. IF ONBOARDING IS DONE: Talk to the Express/JSON Backend
    setBotTyping(true);
    try {
      const response = await fetch('https://launchher.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          profile 
        }),
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      
      addMessage({
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: data.reply,
        matchedSchemes: data.matched_schemes,
        requiresUpload: data.requires_upload // Capture the flag for file uploads
      });

    } catch (error) {
      console.error(error);
      addMessage({
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: "I'm having trouble connecting to my servers right now. Please make sure the backend is running.",
      });
    } finally {
      setBotTyping(false);
    }
  };

  // Handler for Multi-Select Options
  const handleMultiSelect = (selectedOptions: Option[]) => {
    clearOptionsFromLastMessage();
    const labelString = selectedOptions.map(opt => opt.label).join(', ');
    const valueArray = selectedOptions.map(opt => opt.value);
    
    handleSendMessage(labelString, valueArray);
  };

  const triggerNextStep = (currentIndex: number) => {
    setBotTyping(true);

    setTimeout(async () => {
      const nextIndex = currentIndex + 1;

      if (nextIndex < ONBOARDING_STEPS.length) {
        setBotTyping(false);
        const nextStep = ONBOARDING_STEPS[nextIndex];
        
        // --- MULTILINGUAL INJECTION LOGIC ---
        // 1. Grab the user's language choice (defaults to 'en')
        const langCode = (useChatStore.getState().profile.preferredLanguage as string) || 'en';
        
        // 2. Translate the Question Text using our dictionary
        const translatedQuestion = QUESTION_TRANSLATIONS[langCode]?.[nextStep.question] || nextStep.question;

        // 3. Translate the Options Array dynamically using the JSON files
        let currentOptions = nextStep.options;
        const localizedData = getLocalizedData(langCode);

        if (nextStep.field === 'state') currentOptions = localizedData.states;
        if (nextStep.field === 'businessCategory') currentOptions = localizedData.categories;
        if (nextStep.field === 'businessStage') currentOptions = localizedData.stages;
        if (nextStep.field === 'annualRevenue') currentOptions = localizedData.revenue;
        if (nextStep.field === 'needCategory') currentOptions = localizedData.needs;
        if (nextStep.field === 'existingRegistrations') currentOptions = localizedData.registrations;

        addMessage({
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: translatedQuestion,
          options: currentOptions as Option[],
          field: nextStep.field,
        });
      } else {
        // ONBOARDING JUST FINISHED! Flip the switch.
        setOnboardingComplete(true);
        
        const latestState = useChatStore.getState();

        try {
          // Send the handover directly to the LLM Backend
          const response = await fetch('https://launchher.onrender.com/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: latestState.messages,
              profile: latestState.profile 
            }),
          });

          if (!response.ok) throw new Error('API failed');
          
          const data = await response.json();
          
          // Let the LLM speak dynamically! (It will ask the clarifying questions in the selected language)
          addMessage({
            id: `ai-${Date.now()}`,
            role: 'ai',
            content: data.reply,
            matchedSchemes: data.matched_schemes 
          });

        } catch (error) {
          console.error("LLM Handover Error:", error);
          addMessage({
            id: `ai-${Date.now()}`,
            role: 'ai',
            content: "Profile synced! I'm having a slight network delay, but tell me—what kind of business are you starting?",
          });
        } finally {
          setBotTyping(false);
        }
      }
    }, 800);
  };

  const handleOptionSelect = (option: Option) => {
    clearOptionsFromLastMessage();
    // Use the option.value for internal state, but display the localized label in the chat
    handleSendMessage(option.label, option.value);
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA] text-slate-800 font-sans selection:bg-slate-200 overflow-hidden relative">
      
      <div className="flex-1 flex flex-col h-full relative z-10 min-w-0">
        
        <header className="px-5 lg:px-8 py-4 border-b border-gray-200/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <h1 className="text-lg font-medium tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Scheme Finder
          </h1>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCallMode(!isCallMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm ${
                isCallMode 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
              }`}
            >
              <Phone size={16} className={isCallMode ? 'animate-pulse text-emerald-400' : ''} />
              {isCallMode ? 'End Call' : 'Call AI'}
            </button>

            <button 
              onClick={() => setSidePanel(!isSidePanelOpen, sidePanelView, sidePanelData)}
              className="lg:hidden p-2 text-slate-600 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        {isCallMode ? (
          <CallInterface />
        ) : (
          <>
            <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-8 custom-scrollbar-light">
              <div className="max-w-3xl mx-auto">
                {messages.length === 1 && (
                  <div className="flex flex-col items-center animate-fade-in-up mt-8 mb-12">

                    {/* Top badge */}
                    <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm text-slate-500 text-[11px] font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      AI-Powered · 1,000+ Schemes · 36 States
                    </div>

                    {/* Headline block */}
                    <div className="text-center mb-3">
                      <h2 className="text-[42px] sm:text-5xl font-bold tracking-[-0.03em] leading-[1.1] text-slate-900 mb-5">
                        Find the money<br />
                        <span className="relative inline-block">
                          your business
                          <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <path d="M2 5.5 C 60 2, 120 7, 180 4 S 260 2, 298 5.5" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" fill="none"/>
                          </svg>
                        </span>
                        {" "}deserves.
                      </h2>
                      <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm mx-auto font-normal">
                        Answer a few questions and get matched to government grants, subsidies, and microloans tailored to your exact situation.
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 sm:gap-10 my-8">
                      {[
                        { value: '₹0', label: 'Cost to use' },
                        { value: '< 5 min', label: 'To get matched' },
                        { value: '300+', label: 'Active schemes' },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <p className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent -mb-5" />

                  </div>
                )}

                {messages.map((msg, index) => (
                  <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isLatest={index === messages.length - 1}
                    onOptionSelect={handleOptionSelect} 
                    onMultiSelectSubmit={handleMultiSelect} 
                    onTextSubmit={(text) => handleSendMessage(text)}
                  />
                ))}

                {isBotTyping && (
                  <div className="flex gap-1.5 px-5 py-4 bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] w-18 rounded-2xl rounded-tl-sm items-center justify-center mb-6 animate-fade-in-up">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce delay-300"></span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>
            <ChatInput onSendMessage={(text) => handleSendMessage(text)} disabled={isBotTyping} />
          </>
        )}
      </div>

      <SidePanel />
    </div>
  );
};