import { useState, useEffect } from 'react';
import { 
  CheckCircle, Upload, Volume2, VolumeX,
  Search, Mic, Plus, User, Award, Briefcase, LogOut, Globe, Eye, 
  ArrowRight, TrendingUp, MapPin, PhoneCall, Loader2, Trash2
} from 'lucide-react';
import { translations } from './data/translations';
import type { AppLanguage } from './data/translations';
import { tradesData, schemesData, jobsData } from './data/tradesData';
import { BackendClient } from './utils/supabaseClient';
import type { UserProfile, AiQuizQuestion } from './utils/supabaseClient';
import { SpeechHelper } from './utils/SpeechHelper';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { CertificateCard } from './components/CertificateCard';
import { TermsAndConditions } from './components/TermsAndConditions';

function App() {
  // Global Accessibility & Settings
  const [lang, setLang] = useState<AppLanguage>('en');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Auth / Navigation State
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStep, setAuthStep] = useState<'language' | 'phone' | 'otp' | 'setup' | 'app'>('language');
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'skills' | 'schemes' | 'profile'>('home');

  // Profile Setup State
  const [setupName, setSetupName] = useState<string>('Suman Devi');
  const [setupTrade, setSetupTrade] = useState<string>('tailoring');
  const [setupExp, setSetupExp] = useState<string>('3');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('all');
  const [isListening, setIsListening] = useState<boolean>(false);
  

  const [assessmentStep, setAssessmentStep] = useState<'intro' | 'portfolio' | 'testimony' | 'quiz' | 'grading' | 'result'>('intro');
  const [portfolioVideos, setPortfolioVideos] = useState<string[]>([]);
  const [testimonyVideos, setTestimonyVideos] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [aiLoadingStage, setAiLoadingStage] = useState<number>(0);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<AiQuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);

  // Labels helper shorthand
  const labels = translations[lang];

  // Load user profile on mount
  useEffect(() => {
    async function loadProfile() {
      const profile = await BackendClient.getProfile();
      if (profile) {
        setUser(profile);
        setAuthStep('app');
      }
    }
    loadProfile();
  }, []);

  // Sync state variables for high contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Audio instruction readouts when tabs or steps change
  const speakGuide = (text: string) => {
    SpeechHelper.speak(text, lang as 'en'|'hi', audioEnabled);
  };

  const handleSaveSetup = async () => {
    if (!setupName.trim()) {
      alert("Please enter your name");
      return;
    }
    const updated = await BackendClient.updateProfile({
      name: setupName,
      trade: setupTrade,
      experience: setupExp
    });
    setUser(updated);
    setAuthStep('app');
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await BackendClient.logout();
    setUser(null);
    setPhone('');
    setOtp('');
    setPortfolioVideos([]);
    setTestimonyVideos([]);
    setAssessmentStep('intro');
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setAuthStep('language');
    setActiveTab('home');
  };

  const handlePortfolioVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await BackendClient.uploadFile(e.target.files[0]);
        setPortfolioVideos([...portfolioVideos, url]);
        speakGuide("Video uploaded successfully.");
      } catch (err) {
        console.error("Upload error", err);
      }
    }
  };

  const handleTestimonyVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const url = await BackendClient.uploadFile(e.target.files[0]);
        setTestimonyVideos([...testimonyVideos, url]);
        speakGuide("Testimony video uploaded successfully.");
      } catch (err) {
        console.error("Upload error", err);
      }
    }
  };



  const handleAnswerSelect = (optionIndex: number) => {
    const nextAnswers = [...quizAnswers];
    nextAnswers[currentQuestionIndex] = optionIndex;
    setQuizAnswers(nextAnswers);
  };

  const handleNextQuestion = () => {
    if (quizAnswers[currentQuestionIndex] === undefined) {
      alert("Please select an answer to proceed");
      return;
    }
    if (currentQuestionIndex < aiGeneratedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setAssessmentStep('grading');
      startAiGradingSimulation();
    }
  };

  // Fetch AI questions from backend and transition to quiz
  const startQuiz = async () => {
    setQuizLoading(true);
    const tradeName = tradesData.find(t => t.id === user?.trade)?.nameEn || user?.trade || 'General Skills';
    const questions = await BackendClient.generateQuiz(tradeName);
    setAiGeneratedQuestions(questions);
    setQuizAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizLoading(false);
    setAssessmentStep('quiz');
  };

  const startAiGradingSimulation = () => {
    setAiLoadingStage(0);
    speakGuide(labels.validatingPortfolio);
    const interval = setInterval(() => {
      setAiLoadingStage(prev => {
        if (prev >= 2) {
          clearInterval(interval);
          finalizeAssessment();
          return 3;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const finalizeAssessment = async () => {
    let score = 0;
    aiGeneratedQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) score += 1;
    });

    let skillLevel: 'Beginner' | 'Intermediate' | 'Expert' = 'Beginner';
    if (score === aiGeneratedQuestions.length) skillLevel = 'Expert';
    else if (score >= Math.ceil(aiGeneratedQuestions.length / 2)) skillLevel = 'Intermediate';

    const updated = await BackendClient.updateProfile({
      assessmentStatus: 'verified',
      quizScore: score,
      skillLevel,
      portfolioUrls: [...portfolioVideos, ...testimonyVideos],
      certifiedAt: new Date().toLocaleDateString()
    });

    setUser(updated);
    setAssessmentStep('result');
    speakGuide(`${labels.validationSuccess}. ${labels.skillLevelTitle} ${skillLevel}`);
  };

  const startVoiceSearch = () => {
    setIsListening(true);
    SpeechHelper.startListening(
      lang as 'en'|'hi',
      (text) => {
        setSearchQuery(text);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
        // We aren't displaying voice error currently, just dropping it
      },
      () => setIsListening(false)
    );
  };

  const filteredSchemes = schemesData.filter(scheme => {
    const matchesSearch = searchQuery.trim() === '' || 
      scheme.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.titleHi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredJobs = jobsData.filter(job => {
    const matchesSearch = searchQuery.trim() === '' || 
      job.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.titleHi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrade = selectedTradeFilter === 'all' || job.tradeId === selectedTradeFilter;
    return matchesSearch && matchesTrade;
  });

  const getTradeName = (tradeId: string) => {
    switch (tradeId) {
      case 'tailoring': return labels.sewingTrade;
      case 'beauty': return labels.beautyTrade;
      case 'foodprep': return labels.foodTrade;
      case 'fashion': return labels.fashionTrade;
      case 'baking': return labels.bakingTrade;
      case 'welding': return labels.weldingTrade;
      case 'handicrafts': return labels.handicraftsTrade;
      default: return tradeId;
    }
  };

  return (
    <div className="app-container">
      
      {/* 
        DESKTOP SIDEBAR 
        Only visible on md screens and up. 
      */}
      {authStep === 'app' && user && (
        <DesktopSidebar 
          activeTab={activeTab} 
          setActiveTab={(t) => { setActiveTab(t); setSearchQuery(''); }}
          labels={labels}
          lang={lang} setLang={setLang}
          audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled}
          highContrast={highContrast} setHighContrast={setHighContrast}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative w-full h-screen overflow-y-auto" style={{ backgroundColor: '#e8f0fe' }}>
        
        {/* MOBILE HEADER (Only visible on sm screens) */}
        <header className={`${authStep === 'app' ? 'md:hidden' : ''} ${authStep === 'language' ? 'hidden' : 'flex'} sticky top-0 bg-teal-600 text-white z-40 px-4 py-3 justify-between items-center shadow-md`}>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="VocUpSkill" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/30" />
            <h1 className="text-base font-extrabold tracking-tight m-0 text-white leading-none">
              {labels.appName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-teal-700 rounded-full px-2 border border-teal-500/30">
              <Globe size={12} className="text-teal-200 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as AppLanguage)}
                className="bg-transparent text-white text-xs font-bold py-1 outline-none cursor-pointer"
              >
                <option value="en" className="text-slate-900 bg-white">EN</option>
                <option value="hi" className="text-slate-900 bg-white">हिं</option>
                <option value="kn" className="text-slate-900 bg-white">ಕನ್ನ</option>
                <option value="te" className="text-slate-900 bg-white">తెలు</option>
                <option value="ta" className="text-slate-900 bg-white">தமிழ்</option>
                <option value="ml" className="text-slate-900 bg-white">മലയ</option>
              </select>
            </div>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`rounded-full p-1.5 border ${audioEnabled ? 'bg-amber-400 text-teal-950 border-amber-300' : 'bg-teal-700 text-teal-200 border-teal-500/30'}`}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`rounded-full p-1.5 border ${highContrast ? 'bg-black text-yellow-300 border-yellow-300' : 'bg-teal-700 text-teal-200 border-teal-500/30'}`}
            >
              <Eye size={16} />
            </button>
          </div>
        </header>

        {/* ONBOARDING: LANGUAGE SELECTION */}
        {authStep === 'language' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center w-full min-h-screen bg-[#e0fff4] p-6 absolute inset-0 z-50">
            <img src="/logo.png" alt="VocUpSkill Antigravity Logo" className="w-36 h-36 mb-6 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.6)] object-cover ring-4 ring-teal-200 animate-pulse" style={{ animationDuration: '4s' }} />
            <h2 className="text-3xl md:text-4xl font-extrabold text-teal-900 mb-12 drop-shadow-sm">Choose Your Language</h2>
            
            <div className="flex flex-wrap justify-center gap-6 max-w-3xl">
              {[
                { code: 'en', name: 'English', native: 'English' },
                { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
                { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
                { code: 'te', name: 'Telugu', native: 'తెలుగు' },
                { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
                { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
              ].map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    setLang(language.code as AppLanguage);
                    speakGuide(`You selected ${language.name}`);
                    setAuthStep('phone');
                  }}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-white/60 backdrop-blur-md border-2 border-teal-200 shadow-md flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-110 hover:bg-white hover:shadow-xl hover:border-teal-400 cursor-pointer group"
                >
                  <span className="text-2xl md:text-3xl font-extrabold text-teal-900 group-hover:text-teal-700 drop-shadow-sm transition-colors">{language.native}</span>
                  <span className="text-sm md:text-base font-medium text-teal-700 group-hover:text-teal-900 opacity-80">{language.name}</span>
                </button>
              ))}
            </div>
            <p className="mt-16 text-teal-800 text-sm max-w-md font-medium">Selecting a language will personalize your experience across the platform.</p>
          </div>
        )}

        {/* ONBOARDING: PHONE / OTP */}
        {(authStep === 'phone' || authStep === 'otp') && (
          <div className="flex-1 p-6 md:p-12 flex flex-col justify-center items-center text-center max-w-md mx-auto w-full">
            <div className="mb-6">
              <img src="/logo.png" alt="VocUpSkill Antigravity Logo" className="w-24 h-24 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] object-cover ring-2 ring-teal-500/20" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{labels.loginTitle}</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-xs leading-relaxed">{labels.loginSubtitle}</p>
            
            {authStep === 'phone' ? (
              <div className="w-full mt-8">
                <label className="block text-xs font-bold text-slate-500 mb-2 text-left">{labels.phoneLabel}</label>
                <div className="flex gap-2">
                  <div className="bg-slate-100 border-2 border-slate-200 px-4 py-3 rounded-xl flex items-center text-slate-600 font-semibold">
                    +91
                  </div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit number" 
                    className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:border-teal-600 outline-none transition-colors"
                    maxLength={10}
                  />
                </div>
                <button 
                  onClick={() => {
                    if (phone.length === 10) {
                      speakGuide("Sending OTP to your phone");
                      setAuthStep('otp');
                    } else {
                      speakGuide("Please enter a valid 10 digit phone number");
                    }
                  }}
                  className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <span>{labels.sendOtp}</span> <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="w-full mt-8">
                <label className="block text-xs font-bold text-slate-500 mb-2 text-left">Enter 4-digit OTP</label>
                <div className="flex justify-center gap-3 mb-6">
                  {[0,1,2,3].map((i) => (
                    <input 
                      key={i} 
                      type="text" 
                      value={otp[i] || ''}
                      onChange={(e) => {
                        const newOtp = otp.split('');
                        newOtp[i] = e.target.value.replace(/\D/g, '').substring(0, 1);
                        setOtp(newOtp.join(''));
                      }}
                      maxLength={1} 
                      className="w-14 h-14 text-center text-2xl font-bold bg-white border-2 border-slate-200 rounded-xl focus:border-teal-600 outline-none" 
                    />
                  ))}
                </div>
                <button 
                  onClick={async () => {
                    if (otp.length === 4) {
                      try {
                        const verifiedUser = await BackendClient.verifyOtp(phone, otp);
                        setUser(verifiedUser);
                        speakGuide("OTP verified successfully. Let's set up your profile.");
                        setAuthStep('setup');
                      } catch (err) {
                        speakGuide("Invalid OTP code. Try again.");
                      }
                    } else {
                      speakGuide("Please enter a valid 4 digit OTP");
                    }
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <span>Verify & Proceed</span> <CheckCircle size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* PROFILE SETUP */}
        {authStep === 'setup' && (
          <div className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full overflow-y-auto">
            <div className="text-center my-4">
              <h2 className="text-xl font-extrabold text-slate-800">{labels.selectTrade}</h2>
              <p className="text-slate-500 text-xs mt-1">{labels.chooseTradeSubtitle}</p>
            </div>
            <div className="space-y-4 mt-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">{labels.nameLabel}</label>
                <input type="text" value={setupName} onChange={(e) => setSetupName(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-semibold placeholder:text-slate-400 focus:border-teal-600 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-3">{labels.tradeLabel}</label>
                <div className="flex flex-col gap-5">
                {tradesData.map((t) => {
                  const isSelected = setupTrade === t.id;
                  const themes: Record<string,{bg:string;ring:string;badgeBg:string;border:string;tagBg:string;tagBorder:string;tagTxt:string;accent:string;emoji:string}> = {
                    tailoring:   {bg:'from-teal-50 via-cyan-50 to-emerald-50',  ring:'ring-teal-300',   badgeBg:'#0D9488', border:isSelected?'#0D9488':'#e2e8f0', tagBg:'#f0fdfa',   tagBorder:'#99f6e4', tagTxt:'#0f766e', accent:'#0D9488', emoji:'🪡'},
                    beauty:      {bg:'from-pink-50 via-fuchsia-50 to-rose-50',  ring:'ring-pink-300',   badgeBg:'#db2777', border:isSelected?'#db2777':'#e2e8f0', tagBg:'#fdf2f8',   tagBorder:'#fbcfe8', tagTxt:'#be185d', accent:'#db2777', emoji:'💄'},
                    foodprep:    {bg:'from-orange-50 via-amber-50 to-yellow-50',ring:'ring-orange-300', badgeBg:'#ea580c', border:isSelected?'#ea580c':'#e2e8f0', tagBg:'#fff7ed',   tagBorder:'#fed7aa', tagTxt:'#c2410c', accent:'#ea580c', emoji:'🍳'},
                    handicrafts: {bg:'from-yellow-50 via-lime-50 to-amber-50',  ring:'ring-yellow-300', badgeBg:'#ca8a04', border:isSelected?'#ca8a04':'#e2e8f0', tagBg:'#fefce8',   tagBorder:'#fde68a', tagTxt:'#92400e', accent:'#ca8a04', emoji:'🏺'},
                  };
                  const th = themes[t.id] || themes['tailoring'];
                  return (
                  <button
                    key={t.id}
                    onClick={() => setSetupTrade(t.id)}
                    className={`w-full rounded-3xl text-left transition-all duration-300 overflow-hidden shadow-md hover:shadow-xl ${isSelected ? `ring-4 ${th.ring}` : ''}`}
                    style={{ border: `${isSelected?'3px':'2px'} solid ${th.border}` }}
                  >
                    {/* SVG Illustration header */}
                    <div className={`w-full bg-gradient-to-br ${th.bg} flex items-center justify-center py-5 px-3 relative`} style={{minHeight:'175px'}}>
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1" style={{backgroundColor:th.badgeBg}}>
                          <CheckCircle size={11}/> Selected
                        </div>
                      )}
                      {t.id === 'tailoring' && (
                        <svg viewBox="0 0 320 170" className="w-full" style={{maxWidth:'340px',height:'155px'}} xmlns="http://www.w3.org/2000/svg">
                          <defs><pattern id="fab1" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f0fdfa"/><path d="M0 6h12M6 0v12" stroke="#ccfbf1" strokeWidth="0.5"/></pattern></defs>
                          <rect width="320" height="170" fill="url(#fab1)" rx="8"/>
                          <rect x="60" y="115" width="145" height="12" rx="4" fill="#0D5C75"/>
                          <rect x="75" y="60" width="110" height="58" rx="12" fill="#0D9488"/>
                          <ellipse cx="130" cy="60" rx="55" ry="17" fill="#0D9488"/><ellipse cx="130" cy="60" rx="45" ry="11" fill="#14b8a6"/>
                          <rect x="80" y="66" width="90" height="19" rx="6" fill="#0f766e"/>
                          <rect x="118" y="76" width="8" height="40" rx="3" fill="#0D5C75"/>
                          <rect x="121" y="112" width="2" height="16" fill="#94a3b8"/>
                          <ellipse cx="122" cy="122" rx="1.5" ry="4" fill="none" stroke="#fff" strokeWidth="1"/>
                          <ellipse cx="158" cy="57" rx="10" ry="6" fill="#D4AF37"/><rect x="150" y="57" width="16" height="10" fill="#D4AF37"/><ellipse cx="158" cy="67" rx="10" ry="6" fill="#f59e0b"/>
                          <path d="M158 67 Q145 80 122 112" stroke="#f59e0b" strokeWidth="1.5" fill="none" strokeDasharray="3,2"/>
                          <rect x="115" y="111" width="14" height="5" rx="2" fill="#64748b"/>
                          <path d="M70 120 Q130 113 200 120 Q240 123 260 127" stroke="#D4AF37" strokeWidth="3" fill="none" strokeLinecap="round"/>
                          <path d="M70 126 Q130 119 200 126 Q240 129 260 133" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="6,3"/>
                          <circle cx="182" cy="89" r="18" fill="#0f766e" stroke="#0D5C75" strokeWidth="2"/><circle cx="182" cy="89" r="10" fill="#14b8a6"/><circle cx="182" cy="89" r="3" fill="#0D5C75"/>
                          <line x1="182" y1="71" x2="182" y2="107" stroke="#0D5C75" strokeWidth="1.5"/><line x1="164" y1="89" x2="200" y2="89" stroke="#0D5C75" strokeWidth="1.5"/>
                          <g transform="translate(222,50) rotate(35)"><ellipse cx="0" cy="-13" rx="6" ry="9" fill="none" stroke="#64748b" strokeWidth="2.5"/><ellipse cx="0" cy="13" rx="6" ry="9" fill="none" stroke="#64748b" strokeWidth="2.5"/><line x1="-4" y1="-5" x2="-20" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/><line x1="4" y1="-5" x2="20" y2="28" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round"/><circle cx="0" cy="0" r="3" fill="#64748b"/></g>
                          <rect x="230" y="116" width="66" height="12" rx="6" fill="#D4AF37"/><rect x="232" y="118" width="62" height="8" rx="4" fill="#fbbf24"/>
                          {[0,8,16,24,32,40,48,56].map((x,i)=><line key={i} x1={234+x} y1="118" x2={234+x} y2={i%2===0?124:122} stroke="#92400e" strokeWidth="0.8"/>)}
                          <text x="263" y="127" fill="#78350f" fontSize="5" textAnchor="middle" fontWeight="bold">Measuring Tape</text>
                          <text x="112" y="155" fill="#0D5C75" fontSize="9" fontWeight="bold" textAnchor="middle">Sewing Machine</text>
                        </svg>
                      )}
                      {t.id === 'beauty' && (
                        <svg viewBox="0 0 320 170" className="w-full" style={{maxWidth:'340px',height:'155px'}} xmlns="http://www.w3.org/2000/svg">
                          <defs><pattern id="fab2" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fdf2f8"/><path d="M0 6h12M6 0v12" stroke="#fce7f3" strokeWidth="0.5"/></pattern></defs>
                          <rect width="320" height="170" fill="url(#fab2)" rx="8"/>
                          {/* Mirror */}
                          <ellipse cx="85" cy="78" rx="46" ry="54" fill="none" stroke="#db2777" strokeWidth="5"/>
                          <ellipse cx="85" cy="78" rx="40" ry="48" fill="#fce7f3" opacity="0.5"/>
                          <ellipse cx="85" cy="78" rx="32" ry="40" fill="white" opacity="0.8"/>
                          <text x="85" y="83" fill="#db2777" fontSize="22" textAnchor="middle">💄</text>
                          <rect x="80" y="128" width="10" height="20" rx="2" fill="#db2777"/>
                          <rect x="65" y="146" width="40" height="6" rx="3" fill="#be185d"/>
                          <text x="85" y="162" fill="#be185d" fontSize="8" textAnchor="middle" fontWeight="bold">Vanity Mirror</text>
                          {/* Lipstick */}
                          <rect x="155" y="88" width="18" height="48" rx="4" fill="#be185d"/>
                          <path d="M155 88 Q164 70 173 88Z" fill="#f43f5e"/>
                          <rect x="153" y="105" width="22" height="31" rx="3" fill="#9f1239"/>
                          <text x="164" y="152" fill="#9f1239" fontSize="7" textAnchor="middle" fontWeight="bold">Lipstick</text>
                          {/* Brush */}
                          <rect x="200" y="38" width="6" height="68" rx="3" fill="#d4a373"/>
                          <ellipse cx="203" cy="38" rx="8" ry="14" fill="#f9a8d4"/>
                          <rect x="199" y="100" width="8" height="38" rx="2" fill="#a16207"/>
                          <text x="203" y="152" fill="#a16207" fontSize="7" textAnchor="middle" fontWeight="bold">Brush</text>
                          {/* Nail Polish */}
                          <rect x="235" y="92" width="18" height="38" rx="4" fill="#f43f5e"/>
                          <rect x="237" y="86" width="14" height="10" rx="2" fill="#9f1239"/>
                          <rect x="241" y="81" width="6" height="8" rx="1" fill="#64748b"/>
                          <text x="244" y="145" fill="#9f1239" fontSize="7" textAnchor="middle" fontWeight="bold">Nail Polish</text>
                          {/* Comb */}
                          <rect x="265" y="50" width="38" height="9" rx="3" fill="#f472b6"/>
                          {[0,5,10,15,20,25,30,35].map((x,i)=><rect key={i} x={267+x} y="59" width="3" height="18" rx="1" fill="#ec4899"/>)}
                          <text x="284" y="90" fill="#be185d" fontSize="7" textAnchor="middle" fontWeight="bold">Comb</text>
                          {/* Sparkles */}
                          {[[130,28],[145,50],[122,55]].map(([x,y],i)=>(<g key={i}><line x1={x} y1={y-6} x2={x} y2={y+6} stroke="#fbbf24" strokeWidth="1.5"/><line x1={x-6} y1={y} x2={x+6} y2={y} stroke="#fbbf24" strokeWidth="1.5"/></g>))}
                          <text x="85" y="168" fill="#db2777" fontSize="9" fontWeight="bold" textAnchor="middle">Beauty & Parlour</text>
                        </svg>
                      )}
                      {t.id === 'foodprep' && (
                        <svg viewBox="0 0 320 170" className="w-full" style={{maxWidth:'340px',height:'155px'}} xmlns="http://www.w3.org/2000/svg">
                          <defs><pattern id="fab3" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fff7ed"/><path d="M0 6h12M6 0v12" stroke="#fed7aa" strokeWidth="0.5"/></pattern></defs>
                          <rect width="320" height="170" fill="url(#fab3)" rx="8"/>
                          {/* Cooking Pot */}
                          <path d="M65 83 Q65 132 130 132 Q195 132 195 83 Z" fill="#ea580c"/>
                          <rect x="62" y="73" width="136" height="17" rx="6" fill="#c2410c"/>
                          <ellipse cx="130" cy="73" rx="68" ry="10" fill="#fb923c"/>
                          {/* Steam */}
                          <path d="M100 68 Q105 53 100 43" stroke="#fed7aa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                          <path d="M130 66 Q135 48 130 36" stroke="#fed7aa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                          <path d="M160 68 Q165 53 160 43" stroke="#fed7aa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                          <rect x="42" y="78" width="22" height="10" rx="5" fill="#c2410c"/>
                          <rect x="196" y="78" width="22" height="10" rx="5" fill="#c2410c"/>
                          <ellipse cx="130" cy="71" rx="12" ry="5" fill="#9a3412"/>
                          {/* Rolling Pin */}
                          <rect x="40" y="140" width="112" height="13" rx="6" fill="#d4a373"/>
                          <rect x="30" y="142" width="14" height="9" rx="4" fill="#a16207"/>
                          <rect x="148" y="142" width="14" height="9" rx="4" fill="#a16207"/>
                          <text x="97" y="165" fill="#92400e" fontSize="8" textAnchor="middle" fontWeight="bold">Rolling Pin (Belan)</text>
                          {/* Spatula */}
                          <rect x="222" y="35" width="8" height="62" rx="3" fill="#a16207"/>
                          <path d="M218 35 Q226 22 234 35 L232 62 L220 62 Z" fill="#d4a373"/>
                          <text x="226" y="112" fill="#92400e" fontSize="7" textAnchor="middle" fontWeight="bold">Spatula</text>
                          {/* Vegetables */}
                          <circle cx="265" cy="58" r="16" fill="#16a34a"/>
                          <path d="M265 42 Q268 36 265 33 Q262 36 265 42Z" fill="#15803d"/>
                          <circle cx="285" cy="73" r="12" fill="#dc2626"/>
                          <path d="M285 61 Q288 56 285 53 Q282 56 285 61Z" fill="#15803d"/>
                          <circle cx="248" cy="78" r="10" fill="#ca8a04"/>
                          <text x="268" y="105" fill="#c2410c" fontSize="7" textAnchor="middle" fontWeight="bold">Vegetables</text>
                          <text x="130" y="165" fill="#ea580c" fontSize="9" fontWeight="bold" textAnchor="middle">Food Prep & Catering</text>
                        </svg>
                      )}
                      {t.id === 'handicrafts' && (
                        <svg viewBox="0 0 320 170" className="w-full" style={{maxWidth:'340px',height:'155px'}} xmlns="http://www.w3.org/2000/svg">
                          <defs><pattern id="fab4" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fefce8"/><path d="M0 6h12M6 0v12" stroke="#fef08a" strokeWidth="0.5"/></pattern></defs>
                          <rect width="320" height="170" fill="url(#fab4)" rx="8"/>
                          {/* Handloom frame */}
                          <rect x="28" y="28" width="8" height="118" rx="3" fill="#92400e"/>
                          <rect x="158" y="28" width="8" height="118" rx="3" fill="#92400e"/>
                          <rect x="28" y="28" width="138" height="8" rx="3" fill="#92400e"/>
                          <rect x="28" y="138" width="138" height="8" rx="3" fill="#92400e"/>
                          {/* Woven rows */}
                          {[42,50,58,66,74,82,90,98,106,114,122,130].map((y,i)=>(
                            <rect key={i} x="36" y={y} width="122" height="5" rx="1"
                              fill={['#f59e0b','#ea580c','#d97706','#b45309','#ca8a04','#a16207'][i%6]} opacity="0.88"/>
                          ))}
                          {/* Warp threads */}
                          {[40,49,58,67,76,85,94,103,112,121,130,139,148].map((x,i)=>(
                            <line key={i} x1={x} y1="36" x2={x} y2="138" stroke="#78350f" strokeWidth="1" opacity="0.35"/>
                          ))}
                          <text x="97" y="160" fill="#ca8a04" fontSize="8" textAnchor="middle" fontWeight="bold">Handloom Weaving</text>
                          {/* Clay Pot */}
                          <path d="M195 118 Q190 93 200 78 Q210 63 228 63 Q246 63 256 78 Q266 93 261 118 Q256 136 228 138 Q200 136 195 118Z" fill="#ca8a04"/>
                          <ellipse cx="228" cy="63" rx="26" ry="8" fill="#a16207"/>
                          <ellipse cx="228" cy="138" rx="31" ry="5" fill="#78350f" opacity="0.25"/>
                          <path d="M200 98 Q228 93 256 98" stroke="#78350f" strokeWidth="1.5" fill="none"/>
                          <path d="M198 110 Q228 105 258 110" stroke="#78350f" strokeWidth="1.5" fill="none"/>
                          <text x="228" y="155" fill="#78350f" fontSize="8" textAnchor="middle" fontWeight="bold">Clay Pot</text>
                          {/* Block print stamp */}
                          <rect x="272" y="42" width="36" height="40" rx="4" fill="#d97706"/>
                          <rect x="275" y="46" width="30" height="32" rx="2" fill="#fef3c7"/>
                          <circle cx="290" cy="62" r="5" fill="#d97706"/>
                          {[[290,53],[290,71],[281,62],[299,62]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="3" fill="#ca8a04"/>))}
                          <rect x="277" y="86" width="27" height="8" rx="3" fill="#92400e"/>
                          <text x="290" y="108" fill="#78350f" fontSize="6" textAnchor="middle" fontWeight="bold">Block Print</text>
                          <text x="240" y="165" fill="#ca8a04" fontSize="9" fontWeight="bold" textAnchor="middle">Handicrafts & Weaving</text>
                        </svg>
                      )}
                    </div>
                    {/* Card Info */}
                    <div className="px-5 py-4 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{backgroundColor:`${th.badgeBg}18`}}>
                          <span className="text-2xl">{th.emoji}</span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-base leading-tight">{lang === 'en' ? t.nameEn : t.nameHi}</h4>
                          <p className="text-xs font-semibold mt-0.5" style={{color:th.accent}}>✦ AI-Powered Skill Assessment</p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-xs mt-3 leading-relaxed">{t.description}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {t.tags.map(tag => (
                          <span key={tag} className="text-xs font-semibold px-2.5 py-0.5 rounded-full border" style={{backgroundColor:th.tagBg,borderColor:th.tagBorder,color:th.tagTxt}}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                  );
                })}
                </div>

              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>{labels.experienceLabel}</span>
                  <span className="text-teal-600 font-extrabold text-sm">{setupExp} Years</span>
                </div>
                <input type="range" min="0" max="15" value={setupExp} onChange={(e) => setSetupExp(e.target.value)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              </div>
              <button onClick={handleSaveSetup} className="w-full mt-6 bg-teal-600 text-white font-bold py-4 rounded-xl flex justify-center gap-2">
                <CheckCircle size={18} /> <span>Save and Continue</span>
              </button>
            </div>
          </div>
        )}

        {/* LOGGED IN APP TABS */}
        {authStep === 'app' && user && (
          <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8">
            
            {/* HOME */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-teal-700 to-teal-850 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
                  <p className="text-xs text-teal-200 font-bold uppercase">{labels.welcome}</p>
                  <h2 className="text-2xl font-extrabold mt-1 text-white">{user.name}</h2>
                  <p className="text-sm text-teal-100/80 mt-1">{getTradeName(user.trade)} • {user.experience} Years Exp</p>
                  <div className="mt-6 flex items-center justify-between border-t border-teal-600/40 pt-4">
                    <span className="text-sm font-medium text-teal-200">Status:</span>
                    <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${user.assessmentStatus === 'verified' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
                      {user.assessmentStatus === 'verified' ? labels.verifiedStatus : labels.unverifiedStatus}
                    </span>
                  </div>
                </div>

                {user.assessmentStatus === 'unverified' && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 text-left flex flex-col md:flex-row gap-4 justify-between md:items-center">
                    <div className="flex gap-4">
                      <div className="bg-amber-100 text-amber-800 p-3 rounded-2xl h-fit"><Award size={28} /></div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Get Certified Today</h4>
                        <p className="text-sm text-slate-500 mt-1 max-w-md">Document your work and pass a simple visual test to unlock government grants & local job postings!</p>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('skills')} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md">
                      <Plus size={18} strokeWidth={3} /> <span>{labels.startAssessment}</span>
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <button onClick={() => setActiveTab('schemes')} className="col-span-2 md:col-span-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center gap-3">
                     <div className="bg-indigo-600 text-white p-4 rounded-full"><Briefcase size={24} /></div>
                     <span className="text-sm font-bold text-slate-700">{labels.exploreSchemes}</span>
                   </button>
                   <button onClick={() => setActiveTab('profile')} className="col-span-2 md:col-span-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center gap-3">
                     <div className="bg-teal-600 text-white p-4 rounded-full"><User size={24} /></div>
                     <span className="text-sm font-bold text-slate-700">{labels.profileTitle}</span>
                   </button>
                </div>
              </div>
            )}

            {/* SKILLS */}
            {activeTab === 'skills' && (
              <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                {assessmentStep === 'intro' && (
                  <div className="flex-1 flex flex-col justify-center max-w-md mx-auto text-left py-8">
                    <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{labels.assessmentTitle}</h3>
                    <p className="text-sm text-slate-500 mb-8">To earn your verified certificate, please complete these two simple steps:</p>
                    <div className="space-y-4 mb-8">
                      <div className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50">
                        <span className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</span>
                        <div>
                          <h4 className="font-bold text-slate-700">{labels.portfolioTitle}</h4>
                          <p className="text-xs text-slate-500 mt-1">Upload 3 videos of your work.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50">
                        <span className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</span>
                        <div>
                          <h4 className="font-bold text-slate-700">Testimony</h4>
                          <p className="text-xs text-slate-500 mt-1">Upload 3 videos of client testimony.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50">
                        <span className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</span>
                        <div>
                          <h4 className="font-bold text-slate-700">{labels.quizTitle}</h4>
                          <p className="text-xs text-slate-500 mt-1">Answer 10 simple questions.</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setAssessmentStep('portfolio')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl flex justify-center gap-2">
                      <span>Get Started</span> <ArrowRight size={18} />
                    </button>
                  </div>
                )}
                
                {assessmentStep === 'portfolio' && (
                  <div className="flex-1 flex flex-col py-4 max-w-lg mx-auto w-full">
                    <h3 className="text-xl font-extrabold text-slate-800">{labels.portfolioTitle}</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-6">Upload 3 videos of your work.</p>
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 relative flex items-center justify-center bg-slate-50 overflow-hidden">
                          {portfolioVideos[idx] ? (
                            <>
                              <video src={portfolioVideos[idx]} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                              <button onClick={() => setPortfolioVideos(portfolioVideos.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"><Trash2 size={12} /></button>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center p-2 text-slate-400">
                              <Upload size={20} />
                              <input type="file" accept="video/*" className="hidden" onChange={handlePortfolioVideoUpload} />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                        if (portfolioVideos.length < 3) {
                          setPortfolioVideos([
                            "https://www.w3schools.com/html/mov_bbb.mp4",
                            "https://www.w3schools.com/html/mov_bbb.mp4",
                            "https://www.w3schools.com/html/mov_bbb.mp4"
                          ]);
                          return;
                        }
                        setAssessmentStep('testimony');
                      }} className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl flex justify-center gap-2 mt-auto">
                      <span>{portfolioVideos.length >= 3 ? 'Continue to Testimony' : 'Demo: Autofill'}</span><ArrowRight size={18} />
                    </button>
                  </div>
                )}

                {assessmentStep === 'testimony' && (
                  <div className="flex-1 flex flex-col py-4 max-w-lg mx-auto w-full">
                    <h3 className="text-xl font-extrabold text-slate-800">Testimony</h3>
                    <p className="text-sm text-slate-500 mt-1 mb-6">Upload 3 videos of client testimony.</p>
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 relative flex items-center justify-center bg-slate-50 overflow-hidden">
                          {testimonyVideos[idx] ? (
                            <>
                              <video src={testimonyVideos[idx]} className="w-full h-full object-cover" muted autoPlay loop playsInline />
                              <button onClick={() => setTestimonyVideos(testimonyVideos.filter((_, i) => i !== idx))} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"><Trash2 size={12} /></button>
                            </>
                          ) : (
                            <label className="cursor-pointer flex flex-col items-center p-2 text-slate-400">
                              <Upload size={20} />
                              <input type="file" accept="video/*" className="hidden" onChange={handleTestimonyVideoUpload} />
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                        if (testimonyVideos.length < 3) {
                          setTestimonyVideos([
                            "https://www.w3schools.com/html/mov_bbb.mp4",
                            "https://www.w3schools.com/html/mov_bbb.mp4",
                            "https://www.w3schools.com/html/mov_bbb.mp4"
                          ]);
                          return;
                        }
                        startQuiz();
                      }} disabled={quizLoading} className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl flex justify-center gap-2 mt-auto disabled:opacity-60">
                      {quizLoading
                        ? <><Loader2 size={18} className="animate-spin" /><span>AI is generating your quiz...</span></>
                        : <><span>{testimonyVideos.length >= 3 ? 'Continue to AI Quiz' : 'Demo: Autofill'}</span><ArrowRight size={18} /></>}
                    </button>
                  </div>
                )}
                
                {assessmentStep === 'quiz' && aiGeneratedQuestions.length > 0 && (
                  <div className="flex-1 flex flex-col py-4 max-w-lg mx-auto w-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-sm font-bold text-teal-600 uppercase tracking-wider">{labels.quizTitle}</span>
                        <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">✦ AI Generated</span>
                      </div>
                      <span className="text-sm font-extrabold text-slate-500">{currentQuestionIndex + 1} / {aiGeneratedQuestions.length}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / aiGeneratedQuestions.length) * 100}%` }} />
                    </div>

                    {/* Question */}
                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-2xl mb-6 border border-teal-100">
                      <h4 className="text-lg font-bold text-slate-800 leading-snug">
                        {lang === 'en'
                          ? aiGeneratedQuestions[currentQuestionIndex].questionEn
                          : aiGeneratedQuestions[currentQuestionIndex].questionHi}
                      </h4>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {(lang === 'en'
                        ? aiGeneratedQuestions[currentQuestionIndex].optionsEn
                        : aiGeneratedQuestions[currentQuestionIndex].optionsHi
                      ).map((opt, idx) => {
                        const isSel = quizAnswers[currentQuestionIndex] === idx;
                        return (
                          <button key={idx} onClick={() => handleAnswerSelect(idx)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                              isSel ? 'border-teal-600 bg-teal-50 font-bold text-slate-900 shadow-sm' : 'border-slate-200 text-slate-700 hover:border-teal-300'
                            }`}>
                            <span>{opt}</span>
                            <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSel ? 'border-teal-600 bg-teal-600' : 'border-slate-300'
                            }`}>
                              {isSel && <span className="h-2 w-2 rounded-full bg-white" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={handleNextQuestion} className="mt-8 w-full bg-teal-600 text-white font-bold py-4 rounded-xl flex justify-center gap-2">
                      <span>{currentQuestionIndex === aiGeneratedQuestions.length - 1 ? labels.submit : labels.next}</span> <ArrowRight size={18} />
                    </button>
                  </div>
                )}
                
                {assessmentStep === 'grading' && (
                  <div className="flex-1 flex flex-col justify-center items-center py-12">
                    <Loader2 className="text-teal-600 h-16 w-16 animate-spin" />
                    <h3 className="text-xl font-extrabold text-slate-800 mt-6">{labels.validatingPortfolio}</h3>
                    <div className="w-full max-w-sm mt-8 bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full transition-all duration-700" style={{ width: `${(aiLoadingStage + 1) * 33}%` }}></div>
                    </div>
                  </div>
                )}
                
                {assessmentStep === 'result' && (
                   <div className="flex-1 flex flex-col py-8 max-w-md mx-auto w-full text-center">
                     <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                     <h3 className="text-2xl font-extrabold text-slate-800">{labels.validationSuccess}</h3>
                     <p className="text-sm text-slate-500 mt-2">{labels.skillLevelTitle} <strong>{user.skillLevel}</strong></p>
                     <button onClick={() => { setActiveTab('profile'); setAssessmentStep('intro'); }} className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl mt-8">
                       View Digital Certificate
                     </button>
                   </div>
                )}
              </div>
            )}

            {/* SCHEMES & BAZAAR */}
            {activeTab === 'schemes' && (
              <div className="flex flex-col h-full">
                <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-center">
                  <div className="relative flex-1">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={labels.searchPlaceholder} className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:border-teal-600" />
                    <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                    <button onClick={startVoiceSearch} className={`absolute right-2 top-2 p-1.5 rounded-lg ${isListening ? 'bg-red-500 text-white' : 'bg-teal-50 text-teal-600'}`}>
                      <Mic size={18} />
                    </button>
                  </div>
                  <select value={selectedTradeFilter} onChange={(e) => setSelectedTradeFilter(e.target.value)} className="py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-teal-700 shadow-sm outline-none">
                    <option value="all">All Trades (सभी)</option>
                    {tradesData.map(t => <option key={t.id} value={t.id}>{lang === 'en' ? t.nameEn : t.nameHi}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Schemes Column */}
                  <div>
                    <h4 className="font-bold text-slate-500 mb-4 uppercase tracking-wide flex items-center gap-2"><TrendingUp size={18} /> {labels.schemesTitle}</h4>
                    <div className="space-y-4">
                      {filteredSchemes.map(s => (
                        <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                          <h5 className="font-extrabold text-slate-800 text-lg">{lang === 'en' ? s.titleEn : s.titleHi}</h5>
                          <p className="text-sm text-slate-500 mt-2">{lang === 'en' ? s.descriptionEn : s.descriptionHi}</p>
                          <div className="mt-4 bg-teal-50 p-3 rounded-xl border border-teal-100 text-sm">
                            <strong>Benefits:</strong> {lang === 'en' ? s.benefitsEn : s.benefitsHi}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Jobs Column */}
                  <div>
                    <h4 className="font-bold text-slate-500 mb-4 uppercase tracking-wide flex items-center gap-2"><Briefcase size={18} /> {labels.jobsTitle}</h4>
                    <div className="space-y-4">
                      {filteredJobs.map(job => (
                        <div key={job.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
                          <div>
                            <h5 className="font-extrabold text-slate-800 text-lg">{lang === 'en' ? job.titleEn : job.titleHi}</h5>
                            <p className="text-sm text-teal-600 font-bold mt-1">{job.employer}</p>
                            <div className="flex gap-4 items-center mt-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><MapPin size={16} /> {lang === 'en' ? job.locationEn : job.locationHi}</span>
                              <span className="font-extrabold text-slate-700">{lang === 'en' ? job.salaryEn : job.salaryHi}</span>
                            </div>
                          </div>
                          <button onClick={() => { if(!appliedJobs.includes(job.id)) setAppliedJobs([...appliedJobs, job.id])}} className={`mt-6 w-full py-3 rounded-xl font-bold flex justify-center gap-2 border-2 ${appliedJobs.includes(job.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-teal-600 text-teal-600 hover:bg-teal-50'}`}>
                            {appliedJobs.includes(job.id) ? <><CheckCircle size={18} /> Applied</> : <><PhoneCall size={18} /> {labels.applyNow}</>}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                  <div className="w-24 h-24 rounded-full bg-teal-600 text-white font-extrabold text-4xl flex items-center justify-center border-4 border-teal-100 shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-extrabold text-slate-800">{user.name}</h3>
                    <p className="text-slate-500">+91 {user.phone}</p>
                    <p className="text-sm font-semibold mt-2 text-teal-600">{getTradeName(user.trade)} • {user.experience} Years Exp</p>
                  </div>
                  <button onClick={handleLogout} className="bg-slate-50 hover:bg-slate-100 text-rose-600 font-bold px-6 py-3 rounded-xl border border-rose-200 flex items-center gap-2">
                    <LogOut size={18} /> {labels.logout}
                  </button>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-500 mb-4 uppercase tracking-wide flex items-center gap-2"><Award size={18} className="text-teal-600" /> Digital ID & Certificate</h4>
                  {user.assessmentStatus === 'verified' ? (
                    <CertificateCard profile={user} labels={labels} />
                  ) : (
                     <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                       <Award size={48} className="text-slate-300 mx-auto mb-4" />
                       <h5 className="font-bold text-slate-700 text-lg">No Certificate Yet</h5>
                       <button onClick={() => setActiveTab('skills')} className="mt-4 bg-teal-600 text-white font-bold py-3 px-8 rounded-xl">Start Assessment</button>
                     </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* MOBILE BOTTOM NAV (Only visible on sm screens when logged in) */}
        {authStep === 'app' && user && (
          <div className="md:hidden">
            <BottomNav 
              activeTab={activeTab} 
              setActiveTab={(tab) => { setActiveTab(tab); setSearchQuery(''); }} 
              labels={labels} 
            />
          </div>
        )}

        {/* GLOBAL FOOTER */}
        <div className={`fixed left-0 right-0 w-full flex justify-center pb-3 z-[60] pointer-events-none transition-all duration-300 ${authStep === 'app' && user ? 'bottom-16 md:bottom-2' : 'bottom-2'}`}>
          <button 
            onClick={() => setShowTerms(true)}
            className="text-xs text-teal-800 hover:text-teal-950 font-semibold bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full pointer-events-auto border border-teal-300 shadow-sm transition-colors"
          >
            Terms and Conditions
          </button>
        </div>

      </div>

      {/* TERMS & CONDITIONS OVERLAY */}
      {showTerms && (
        <TermsAndConditions onBack={() => setShowTerms(false)} />
      )}

    </div>
  );
}

export default App;
