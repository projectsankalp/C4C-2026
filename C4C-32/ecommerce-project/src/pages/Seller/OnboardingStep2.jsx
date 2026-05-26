import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGlobe, FiBell, FiPlay, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import SellerLayout from './components/SellerLayout';
import VoiceGuidance from './components/VoiceGuidance';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';

const OnboardingStep2 = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [password, setPassword] = useState(() => localStorage.getItem('karigar_temp_pass') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'seller') {
      navigate('/seller/dashboard');
    }
  }, [isLoggedIn, user, navigate]);

  useEffect(() => {
    localStorage.setItem('karigar_temp_pass', password);
  }, [password]);

  const handleVoiceInput = (text) => {
    const cleanText = text.toLowerCase();
    if (cleanText.includes('aage') || cleanText.includes('next') || cleanText.includes('badhein') || cleanText.includes('dashboard') || cleanText.includes('ಮುಂದೆ')) {
      if (password.length >= 4) {
        navigate('/seller/onboarding-3');
      } else {
        setPassword("1234"); // default fallback password
      }
    } else {
      // Clean letters or numbers out of transcript
      const digits = text.replace(/[^0-9]/g, '');
      if (digits.length >= 4) {
        setPassword(digits);
        toast.success(`Secret code set to: ${digits}`);
      }
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!password) {
      setPassword("1234");
    }
    navigate('/seller/onboarding-3');
  };

  return (
    <SellerLayout onVoiceInput={handleVoiceInput}>
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full py-4 border-b border-[#E5DCD0]/60 z-10">
        <span className="text-2xl font-bold text-[#8B3A1A] tracking-wide karigar-serif cursor-pointer" onClick={() => navigate('/seller')}>
          KariGhar
        </span>
        <div className="flex items-center gap-6 text-[#1A1A1A]">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-1 bg-[#FDF8F4] border border-[#E5DCD0] rounded-xl px-2 py-1 shadow-sm">
            <FiGlobe className="text-[#8B3A1A] w-4 h-4" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-[#1A1A1A] outline-none cursor-pointer p-0"
              title={t('nav.languageSelect')}
              style={{ appearance: 'none', WebkitAppearance: 'none' }}
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
          </div>

          <button className="text-xl hover:text-[#8B3A1A] relative" title="Notifications">
            <FiBell />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#8B3A1A]"></span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-stretch my-auto py-8">
        
        {/* Left Column (60%) */}
        <div className="lg:col-span-6 flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-4">
            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div className="progress-step active"></div>
              <div className="progress-step active"></div>
              <div className="progress-step"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#8B3A1A] karigar-serif">
              {t('sellerOnboarding.createSecretCode')}
            </h2>
            <p className="text-lg text-[#666666] font-medium">
              {t('sellerOnboarding.rememberCode')}
            </p>

            {/* Input Card */}
            <form onSubmit={handleNext} className="karigar-card flex flex-col gap-6 mt-2">
              <div className="flex flex-col gap-2 relative">
                <label className="text-lg font-bold text-[#8B3A1A]">{t('sellerOnboarding.secretCodeLabel')}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('sellerOnboarding.placeholderCode')}
                    className="karigar-input pr-16"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-[#8B3A1A] hover:text-[#752E14]"
                    title={showPassword ? "Hide Code" : "Show Code"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4 mt-2">
                <button type="submit" className="karigar-btn-primary px-12">
                  {t('sellerOnboarding.aageBadhein')}
                </button>
                <span className="text-[#8B3A1A] font-bold text-sm flex items-center gap-1.5 animate-pulse">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#8B3A1A]"></span>
                  {t('sellerOnboarding.listening')}
                </span>
              </div>
            </form>
          </div>

          {/* Video help thumbnail */}
          <div className="flex flex-col gap-2 mt-4">
            <div 
              onClick={() => setShowVideoModal(true)}
              className="video-thumbnail-container relative w-full max-w-md h-40 bg-[#E5DCD0] flex items-center justify-center border-2 border-white/80 rounded-2xl cursor-pointer"
            >
              <img 
                src="/images/earthbound-vase.png" 
                alt="Empowering Artisans Video Thumbnail" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="video-play-btn">
                <FiPlay className="ml-1" />
              </div>
              <span className="absolute bottom-3 left-3 bg-[#1C1C1E]/80 text-white text-xs px-3 py-1.5 rounded-full font-bold">
                {t('sellerOnboarding.watchTypeCode')}
              </span>
            </div>
            <p className="text-xs text-[#666666] font-medium tracking-wide">
              {t('sellerOnboarding.empoweringArtisansDesc')}
            </p>
          </div>

          {/* Voice Guidance Bubble */}
          <div className="mt-4">
            <VoiceGuidance 
              text={t('sellerOnboarding.voiceGuidanceStep2')} 
              showDots={false}
            />
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-4 relative rounded-[32px] overflow-hidden shadow-xl border-4 border-white/60 min-h-[350px] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-t from-[#8B3A1A]/20 to-transparent z-10 pointer-events-none"></div>
          <img 
            src="/images/terracotta-uru.png" 
            alt="Terracotta Uru Craft" 
            className="w-full h-full object-cover"
          />
        </div>

      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl relative shadow-2xl border-4 border-[#8B3A1A]">
            <button 
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 text-2xl text-[#1A1A1A] hover:text-[#8B3A1A]"
              title="Close"
            >
              <FiX />
            </button>
            <h3 className="text-2xl font-bold text-[#8B3A1A] karigar-serif mb-4">{t('sellerOnboarding.watchTypeCode')}</h3>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Help Video Password"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
};

export default OnboardingStep2;
