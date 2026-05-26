import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiGlobe, FiBell, FiMic, FiArrowLeft } from 'react-icons/fi';
import SellerLayout from './components/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  useEffect(() => {
    if (isLoggedIn && user?.role === 'seller') {
      navigate('/seller/dashboard');
    }
  }, [isLoggedIn, user, navigate]);

  const handleVoiceInput = (text) => {
    const cleanText = text.toLowerCase();
    if (cleanText.includes('new') || cleanText.includes('naya') || cleanText.includes('join') || cleanText.includes('start') || cleanText.includes('ಹೊಸ') || cleanText.includes('ಹೊಸಬರು')) {
      navigate('/seller/onboarding-1');
    } else if (cleanText.includes('account') || cleanText.includes('login') || cleanText.includes('puraana') || cleanText.includes('sign in') || cleanText.includes('ಖಾತೆ') || cleanText.includes('ಲಾಗ್ ಇನ್')) {
      navigate('/seller/login');
    }
  };

  return (
    <SellerLayout onVoiceInput={handleVoiceInput}>
      {/* Top Navigation Bar */}
      <div className="flex justify-between items-center w-full py-4 border-b border-[#E5DCD0]/60 z-10">
        <span className="text-2xl font-bold text-[#8B3A1A] tracking-wide karigar-serif">
          KariGhar
        </span>
        <div className="flex items-center gap-6 text-[#1A1A1A]">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-[#2D5A3D] hover:text-[#8B3A1A] transition-colors" title="Go to Consumer Store">
            <FiArrowLeft /> {t('sellerOnboarding.consumerStore')}
          </Link>
          
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

          <button className="text-xl hover:text-[#8B3A1A] transition-colors relative" title="Notifications">
            <FiBell />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#8B3A1A]"></span>
          </button>
        </div>
      </div>

      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center my-auto py-12 z-10 max-w-3xl mx-auto text-center">
        
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-5xl md:text-7xl font-bold text-[#8B3A1A] leading-tight karigar-serif">
            {t('sellerOnboarding.welcomeTitle')}
          </h1>
          <p className="text-2xl md:text-3xl text-[#2D5A3D] font-medium italic">
            {t('sellerOnboarding.welcomeSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-5 mt-10 justify-center">
          <button 
            onClick={() => navigate('/seller/onboarding-1')}
            className="karigar-btn-primary text-lg px-12 py-5 shadow-lg"
          >
            {t('sellerOnboarding.newHere')}
          </button>
          <button 
            onClick={() => navigate('/seller/login')}
            className="karigar-btn-secondary text-lg px-12 py-5 shadow-lg"
          >
            {t('sellerOnboarding.haveAccount')}
          </button>
        </div>

        <div className="karigar-card flex flex-col items-center text-center gap-4 mt-10 max-w-lg w-full">
          <div className="w-14 h-14 rounded-full bg-[#FFF0EB] border-2 border-[#8B3A1A] flex items-center justify-center text-[#8B3A1A] shadow-inner">
            <FiMic className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-[#1A1A1A] italic text-lg leading-relaxed">
            {t('sellerOnboarding.voiceWelcome')}
          </p>
        </div>

        {/* Link back to consumer store */}
        <Link 
          to="/" 
          className="mt-8 text-[#2D5A3D] hover:text-[#8B3A1A] font-semibold text-base flex items-center gap-2 transition-colors underline underline-offset-4"
        >
          <FiArrowLeft className="w-4 h-4" /> {t('sellerOnboarding.browseCustomer')}
        </Link>
      </div>
    </SellerLayout>
  );
};

export default Welcome;
