'use client';
import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { 
  X, Map, User, Smartphone, MapPin, 
  MessageCircle, Briefcase, Factory, Wallet, 
  HeartHandshake, FileCheck, Check, Sparkles, Volume2, Info, ExternalLink 
} from 'lucide-react';

// Import our new rich scheme guides
import { UdyamGuide } from './schemes/UdyamGuide';
import { GstGuide } from './schemes/GstGuide';
import { FssaiGuide } from './schemes/FssaiGuide';
import { StartupIndiaGuide } from './schemes/StartupIndiaGuide';
import { ShgGuide } from './schemes/ShgGuide';
import { TradeLicenseGuide } from './schemes/TradeLicenseGuide';

// --------------------------------------------------------
// SIDEBAR TRANSLATIONS DICTIONARY
// --------------------------------------------------------
const SIDEBAR_TRANSLATIONS: Record<string, Record<string, string>> = {
  hi: { // Hindi
    'Profile Journey': 'प्रोफ़ाइल यात्रा',
    'Visual Guide': 'दृश्य मार्गदर्शिका',
    'Match Accuracy': 'मैच सटीकता',
    'Eligible Schemes': 'योग्य योजनाएं',
    'Your Progression': 'आपकी प्रगति',
    'Basic Details': 'बुनियादी जानकारी',
    'Verification': 'सत्यापन',
    'Language': 'भाषा',
    'Location': 'स्थान',
    'Business Stage': 'व्यवसाय का चरण',
    'Industry': 'उद्योग',
    'Revenue': 'राजस्व',
    'Support Needed': 'सहायता चाहिए',
    'Registrations': 'पंजीकरण',
    'Details saved': 'विवरण सहेजा गया',
    'In progress...': 'प्रगति पर...',
    'Close Guide': 'मार्गदर्शिका बंद करें',
    'Reading aloud...': 'ज़ोर से पढ़ रहा है...',
    'Listen to Explanation': 'स्पष्टीकरण सुनें',
    'Want to read the official document?': 'क्या आप आधिकारिक दस्तावेज़ पढ़ना चाहते हैं?',
    'Visit Official Site': 'आधिकारिक साइट पर जाएं'
  },
  ta: { // Tamil
    'Profile Journey': 'சுயவிவரப் பயணம்',
    'Visual Guide': 'காட்சி வழிகாட்டி',
    'Match Accuracy': 'பொருத்தத் துல்லியம்',
    'Eligible Schemes': 'தகுதியான திட்டங்கள்',
    'Your Progression': 'உங்கள் முன்னேற்றம்',
    'Basic Details': 'அடிப்படை விவரங்கள்',
    'Verification': 'சரிபார்ப்பு',
    'Language': 'மொழி',
    'Location': 'இடம்',
    'Business Stage': 'வணிக நிலை',
    'Industry': 'தொழில்்துறை',
    'Revenue': 'வருவாய்',
    'Support Needed': 'ஆதரவு தேவை',
    'Registrations': 'பதிவுகள்',
    'Details saved': 'விவரங்கள் சேமிக்கப்பட்டன',
    'In progress...': 'செயல்பட்டு கொண்டிருக்கிறது...',
    'Close Guide': 'வழிகாட்டியை மூடு',
    'Reading aloud...': 'சத்தமாக படிக்கிறது...',
    'Listen to Explanation': 'விளக்கத்தைக் கேளுங்கள்',
    'Want to read the official document?': 'அதிகாரப்பூர்வ ஆவணத்தைப் படிக்க வேண்டுமா?',
    'Visit Official Site': 'அதிகாரப்பூர்வ தளத்தைப் பார்வையிடவும்'
  },
  te: { // Telugu
    'Profile Journey': 'ప్రొఫైల్ ప్రయాణం',
    'Visual Guide': 'దృశ్య మార్గదర్శి',
    'Match Accuracy': 'మ్యాచ్ ఖచ్చితత్వం',
    'Eligible Schemes': 'అర్హత ఉన్న పథకాలు',
    'Your Progression': 'మీ పురోగతి',
    'Basic Details': 'ప్రాథమిక వివరాలు',
    'Verification': 'ధృవీకరణ',
    'Language': 'భాష',
    'Location': 'స్థానం',
    'Business Stage': 'వ్యాపార దశ',
    'Industry': 'పరిశ్రమ',
    'Revenue': 'ఆదాయం',
    'Support Needed': 'మద్దతు అవసరం',
    'Registrations': 'నమోదులు',
    'Details saved': 'వివరాలు సేవ్ చేయబడ్డాయి',
    'In progress...': 'పురోగతిలో ఉంది...',
    'Close Guide': 'గైడ్‌ను మూసివేయండి',
    'Reading aloud...': 'బిగ్గరగా చదువుతోంది...',
    'Listen to Explanation': 'వివరణ వినండి',
    'Want to read the official document?': 'అధికారిక పత్రాన్ని చదవాలనుకుంటున్నారా?',
    'Visit Official Site': 'అధికారిక సైట్‌ను సందర్శించండి'
  },
  bn: { // Bengali
    'Profile Journey': 'প্রোফাইল যাত্রা',
    'Visual Guide': 'ভিজ্যুয়াল গাইড',
    'Match Accuracy': 'ম্যাচ সঠিকতা',
    'Eligible Schemes': 'যোগ্য স্কিম',
    'Your Progression': 'আপনার অগ্রগতি',
    'Basic Details': 'মৌলিক বিবরণ',
    'Verification': 'যাচাইকরণ',
    'Language': 'ভাষা',
    'Location': 'অবস্থান',
    'Business Stage': 'ব্যবসার পর্যায়',
    'Industry': 'শিল্প',
    'Revenue': 'রাজস্ব',
    'Support Needed': 'সমর্থন প্রয়োজন',
    'Registrations': 'নিবন্ধন',
    'Details saved': 'বিবরণ সংরক্ষিত',
    'In progress...': 'চলছে...',
    'Close Guide': 'গাইড বন্ধ করুন',
    'Reading aloud...': 'জোরে পড়া হচ্ছে...',
    'Listen to Explanation': 'ব্যাখ্যা শুনুন',
    'Want to read the official document?': 'অফিসিয়াল নথি পড়তে চান?',
    'Visit Official Site': 'অফিসিয়াল সাইটে যান'
  },
  kan: { // Kannada
    'Profile Journey': 'ಪ್ರೊಫೈಲ್ ಪ್ರಯಾಣ',
    'Visual Guide': 'ದೃಶ್ಯ ಮಾರ್ಗದರ್ಶಿ',
    'Match Accuracy': 'ಹೊಂದಾಣಿಕೆಯ ನಿಖರತೆ',
    'Eligible Schemes': 'ಅರ್ಹ ಯೋಜನೆಗಳು',
    'Your Progression': 'ನಿಮ್ಮ ಪ್ರಗತಿ',
    'Basic Details': 'ಮೂಲ ವಿವರಗಳು',
    'Verification': 'ಪರಿಶೀಲನೆ',
    'Language': 'ಭಾಷೆ',
    'Location': 'ಸ್ಥಳ',
    'Business Stage': 'ವ್ಯಾಪಾರದ ಹಂತ',
    'Industry': 'ಉದ್ಯಮ',
    'Revenue': 'ಆದಾಯ',
    'Support Needed': 'ಬೆಂಬಲದ ಅಗತ್ಯವಿದೆ',
    'Registrations': 'ನೋಂದಣಿಗಳು',
    'Details saved': 'ವಿವರಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ',
    'In progress...': 'ಪ್ರಗತಿಯಲ್ಲಿದೆ...',
    'Close Guide': 'ಮಾರ್ಗದರ್ಶಿ ಮುಚ್ಚಿ',
    'Reading aloud...': 'ಜೋರಾಗಿ ಓದಲಾಗುತ್ತಿದೆ...',
    'Listen to Explanation': 'ವಿವರಣೆಯನ್ನು ಆಲಿಸಿ',
    'Want to read the official document?': 'ಅಧಿಕೃತ ದಾಖಲೆಯನ್ನು ಓದಲು ಬಯಸುವಿರಾ?',
    'Visit Official Site': 'ಅಧಿಕೃತ ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ'
  }
};

const JOURNEY_STEPS = [
  { key: 'fullName', label: 'Basic Details', icon: User },
  { key: 'mobileNumber', label: 'Verification', icon: Smartphone },
  { key: 'preferredLanguage', label: 'Language', icon: MessageCircle },
  { key: 'state', label: 'Location', icon: MapPin },
  { key: 'businessStage', label: 'Business Stage', icon: Briefcase },
  { key: 'businessCategory', label: 'Industry', icon: Factory },
  { key: 'annualRevenue', label: 'Revenue', icon: Wallet },
  { key: 'needCategory', label: 'Support Needed', icon: HeartHandshake },
  { key: 'existingRegistrations', label: 'Registrations', icon: FileCheck },
];

// Helper to render the correct guide
const renderVisualGuide = (value: string) => {
  switch (value) {
    case 'udyam': return <UdyamGuide />;
    case 'gst': return <GstGuide />;
    case 'fssai': return <FssaiGuide />;
    case 'startup_india': return <StartupIndiaGuide />;
    case 'shg': return <ShgGuide />;
    case 'trade_license': return <TradeLicenseGuide />;
    default: return <p className="text-slate-500 text-center py-10">Guide not found.</p>;
  }
};

export const SidePanel = () => {
  const { isSidePanelOpen, sidePanelView, setSidePanel, sidePanelData, profile } = useChatStore();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [matchedSchemes, setMatchedSchemes] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false); 

  // --- TRANSLATION HELPER ---
  const langCode = (profile.preferredLanguage as string) || 'en';
  const t = (text: string) => SIDEBAR_TRANSLATIONS[langCode]?.[text] || text;

  const completedStepsCount = JOURNEY_STEPS.filter(step => {
    const val = profile[step.key as keyof typeof profile];
    return val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
  }).length;

  const totalSteps = JOURNEY_STEPS.length;
  const progressPercentage = Math.round((completedStepsCount / totalSteps) * 100);

  useEffect(() => {
    const targetScore = completedStepsCount === 0 ? 0 : 40 + (completedStepsCount * 6);
    const targetSchemes = completedStepsCount === 0 ? 0 : 312 - (completedStepsCount * 28); 

    const interval = setInterval(() => {
      setAnimatedScore(prev => prev < targetScore ? prev + 1 : targetScore);
      setMatchedSchemes(prev => {
        if (prev === 0 && targetSchemes > 0) return targetSchemes + 50; 
        if (prev > targetSchemes) return prev - 1;
        if (prev < targetSchemes) return prev + 1;
        return targetSchemes;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [completedStepsCount]);

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 3000); 
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidePanelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidePanel(false, sidePanelView, sidePanelData)}
      />

      <aside 
        className={`fixed lg:static top-0 right-0 h-full w-[85vw] sm:w-100 lg:w-[35%] bg-white border-l border-gray-100 shadow-[-10px_0_40px_rgba(0,0,0,0.03)] z-50 flex flex-col transition-transform duration-500 ease-in-out ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${sidePanelView === 'tracker' ? 'bg-indigo-50 border border-indigo-100' : 'bg-emerald-50 border border-emerald-100'}`}>
              {sidePanelView === 'tracker' ? <Map size={18} className="text-indigo-600" /> : <Info size={18} className="text-emerald-600" />}
            </div>
            <h2 className="text-[16px] font-semibold text-slate-900 tracking-tight">
              {sidePanelView === 'tracker' ? t('Profile Journey') : t('Visual Guide')}
            </h2>
          </div>
          
          <button 
            onClick={() => setSidePanel(false, sidePanelView, sidePanelData)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-light bg-[#FAFAFA]">
          
          {/* VIEW 1: THE JOURNEY TRACKER */}
          {sidePanelView === 'tracker' && (
            <div className="flex flex-col animate-fade-in-up pb-10">
              <div className="bg-white p-6 border-b border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('Match Accuracy')}</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{animatedScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-linear-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 bg-slate-900 rounded-2xl p-4 text-white shadow-lg shadow-slate-900/10">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Sparkles size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium mb-0.5">{t('Eligible Schemes')}</p>
                    <p className="text-2xl font-bold tracking-tight">
                      {completedStepsCount === 0 ? '---' : matchedSchemes}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 px-16">
                <h3 className="text-[20px] font-semibold text-slate-900 mb-6 tracking-tight">{t('Your Progression')}</h3>
                <div className="relative">
                  <div className="absolute left-15.75 top-2 bottom-6 w-0.5 bg-gray-200 rounded-full" />
                  <div 
                    className="absolute left-15.75 top-2 w-0.5 bg-indigo-600 rounded-full transition-all duration-700 ease-in-out" 
                    style={{ height: `${(completedStepsCount / totalSteps) * 100}%` }}
                  />
                  {JOURNEY_STEPS.map((step, index) => {
                    const val = profile[step.key as keyof typeof profile];
                    const isCompleted = val !== undefined && val !== '' && !(Array.isArray(val) && val.length === 0);
                    const isCurrent = index === completedStepsCount; 
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="px-10 relative flex items-center gap-10 mb-8 last:mb-0 group">
                        <div className="relative z-10 shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            isCompleted 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                              : isCurrent
                                ? 'bg-white border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.1)]'
                                : 'bg-white border-gray-200 text-gray-300'
                          }`}>
                            {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} strokeWidth={isCurrent ? 2.5 : 2} />}
                          </div>
                        </div>
                        <div className={`transition-all duration-300 ${isCompleted ? 'opacity-100' : isCurrent ? 'opacity-100 translate-x-1' : 'opacity-40'}`}>
                          <h4 className={`text-[18px] font-medium ${isCurrent ? 'text-indigo-600 font-semibold' : 'text-slate-700'}`}>
                            {t(step.label)}
                          </h4>
                          {isCompleted && (
                            <p className="text-sm font-medium text-slate-400 mt-0.5 truncate max-w-45">
                              {typeof val === 'string' ? val : t('Details saved')}
                            </p>
                          )}
                          {isCurrent && (
                            <p className="text-xs text-indigo-400 mt-0.5 font-medium animate-pulse">{t('In progress...')}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: THE DEEP-DIVE DETAIL */}
          {sidePanelView === 'detail' && sidePanelData && (
            <div className="flex flex-col h-fit animate-fade-in-up bg-white min-h-full pb-10">
              
              <div className="p-4 border-b border-gray-100 sticky top-0 z-10 bg-white/90 backdrop-blur-md flex justify-between items-center">
                <button 
                  onClick={() => setSidePanel(true, 'tracker')}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2 transition-colors w-fit px-4 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-gray-200 relative z-50"
                >
                  <X size={16} /> {t('Close Guide')}
                </button>
              </div>

              <div className="p-6 sm:p-8">
                
                <button 
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 mb-8 rounded-2xl font-semibold transition-all duration-300 shadow-md border ${
                    isPlayingAudio 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce" />
                        <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce delay-75" />
                        <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce delay-150" />
                      </div>
                      {t('Reading aloud...')}
                    </>
                  ) : (
                    <>
                      <Volume2 size={20} /> {t('Listen to Explanation')}
                    </>
                  )}
                </button>

                {/* DYNAMIC COMPONENT RENDERER */}
                {renderVisualGuide(sidePanelData.value)}

                {sidePanelData.infoLink && (
                  <div className="mt-8 p-5 bg-slate-50 border border-gray-200 rounded-2xl flex flex-col items-center text-center">
                    <p className="text-sm text-slate-500 mb-3">{t('Want to read the official document?')}</p>
                    <a 
                      href={sidePanelData.infoLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-slate-700 hover:text-slate-900 hover:bg-gray-50 rounded-xl font-medium transition-all shadow-sm"
                    >
                      {t('Visit Official Site')} <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </aside>
    </>
  );
};