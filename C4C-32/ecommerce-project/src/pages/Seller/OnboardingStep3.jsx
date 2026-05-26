import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGlobe, FiBell, FiPlay, FiX } from 'react-icons/fi';
import SellerLayout from './components/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const OnboardingStep3 = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');

  useEffect(() => {
    if (isLoggedIn && user?.role === 'seller') {
      navigate('/seller/dashboard');
    }
  }, [isLoggedIn, user, navigate]);
  const [district, setDistrict] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);

  const states = [
    "Rajasthan",
    "Gujarat",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "Bihar",
    "West Bengal"
  ];

  const districts = {
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Barmer"],
    "Gujarat": ["Bhuj", "Kutch", "Ahmedabad", "Surat"],
    "Uttar Pradesh": ["Varanasi", "Lucknow", "Agra", "Bhadohi"],
    "Madhya Pradesh": ["Bastar", "Bhopal", "Indore", "Chanderi"],
    "Bihar": ["Madhubani", "Patna", "Bhagalpur"],
    "West Bengal": ["Murshidabad", "Kolkata", "Shantipur"]
  };

  const handleVoiceInput = (text) => {
    const cleanText = text.toLowerCase();
    if (cleanText.includes('aage') || cleanText.includes('next') || cleanText.includes('done') || cleanText.includes('complete') || cleanText.includes('ಮುಂದೆ')) {
      handleComplete();
    } else {
      // Simple parsing logic: match states or districts
      const matchedState = states.find(s => cleanText.includes(s.toLowerCase()));
      if (matchedState) {
        setState(matchedState);
        setDistrict(districts[matchedState][0]); // select first district by default
      }
      
      const digits = text.replace(/[^0-9]/g, '');
      if (digits.length >= 10) {
        setPhone(digits.slice(-10));
      }
    }
  };

  const handleComplete = async (e) => {
    if (e) e.preventDefault();
    
    // Retrieve credentials from temp localStorage
    const name = localStorage.getItem('karigar_temp_name') || 'Radha Devi';
    const passwordVal = localStorage.getItem('karigar_temp_pass') || '123456';
    const phoneNum = phone || '9876543210';
    const rajya = state || 'Gujarat';
    const zila = district || 'Bhuj';

    const generatedEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@karigar.com`;
    const finalPassword = passwordVal.length < 6 ? passwordVal.padEnd(6, '0') : passwordVal;

    try {
      const signupPayload = {
        email: generatedEmail,
        password: finalPassword,
        full_name: name,
        role: 'seller',
        phone_number: phoneNum,
        state: rajya,
        district: zila,
        village: 'KariGhar'
      };
      
      let res;
      try {
        res = await authService.signup(signupPayload);
      } catch (signupErr) {
        // If user already exists, try logging in instead
        try {
          res = await authService.login({ email: generatedEmail, password: finalPassword });
        } catch (loginErr) {
          // Both failed — the user exists but with a different password
          toast.error(
            'An account with this name already exists. Please use your original password, or go to the login page.'
          );
          return;
        }
      }

      login(res.user, res.session?.access_token);
      toast.success(`Welcome to KariGhar, ${res.user.full_name || name}!`);

      // Clean up temporary values
      localStorage.removeItem('karigar_temp_name');
      localStorage.removeItem('karigar_temp_pass');

      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.message || 'Onboarding failed');
    }
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
              <div className="progress-step active"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-[#8B3A1A] karigar-serif">
              {t('sellerOnboarding.whereAreYouFrom')}
            </h2>
            <p className="text-lg text-[#666666] font-medium">
              {t('sellerOnboarding.enterPhoneLocation')}
            </p>

            {/* Input Card */}
            <form onSubmit={handleComplete} className="karigar-card flex flex-col gap-5 mt-2">
              
              {/* Saree avatar inside the card */}
              <div className="flex items-center gap-3 bg-[#FDFCFB] p-4 rounded-2xl border border-[#E5DCD0]/50 mb-2">
                <img 
                  src="/karighar-assistant-lady.png" 
                  alt="Saree Guide Avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-[#8B3A1A]"
                />
                <p className="text-sm text-[#1A1A1A] italic">
                  {t('sellerOnboarding.voiceGuidanceStep3')}
                </p>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#8B3A1A]">{t('sellerOnboarding.phoneNumberLabel')}</label>
                <div className="flex items-center gap-0 rounded-2xl border border-[#E5DCD0] bg-white overflow-hidden" style={{ height: '56px' }}>
                  <span className="px-5 text-[#1A1A1A] font-bold text-sm bg-[#F5EDE3] h-full flex items-center border-r border-[#E5DCD0] shrink-0">+91</span>
                  <input 
                    type="tel" 
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className="flex-1 h-full px-5 text-lg outline-none bg-transparent"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* State Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#8B3A1A]">{t('sellerOnboarding.stateLabel')}</label>
                <select 
                  value={state}
                  onChange={(e) => { setState(e.target.value); setDistrict(''); }}
                  className="karigar-input"
                  style={{ appearance: 'auto' }}
                >
                  <option value="">{t('sellerOnboarding.selectState')}</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* District Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#8B3A1A]">{t('sellerOnboarding.districtLabel')}</label>
                <select 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="karigar-input"
                  style={{ appearance: 'auto' }}
                  disabled={!state}
                >
                  <option value="">{t('sellerOnboarding.selectDistrict')}</option>
                  {state && districts[state].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <button type="submit" className="karigar-btn-primary px-12 self-start mt-2">
                {t('sellerOnboarding.aageBadhein')}
              </button>

            </form>
          </div>

          {/* Video Helper Thumbnail */}
          <div className="flex flex-col gap-2 mt-4">
            <div 
              onClick={() => setShowVideoModal(true)}
              className="video-thumbnail-container relative w-full max-w-xs h-28 bg-[#E5DCD0] flex items-center justify-center border-2 border-white/80 rounded-2xl cursor-pointer"
            >
              <img 
                src="/images/parvati-devi-weaver.png" 
                alt="Empowering Artisans Help Video Thumbnail" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="video-play-btn">
                <FiPlay className="ml-1" />
              </div>
              <span className="absolute bottom-2 left-2 bg-[#1A1A1A]/80 text-white text-[10px] px-2.5 py-1 rounded-full font-bold">
                {t('sellerOnboarding.empoweringArtisansTitle')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-4 relative rounded-[32px] overflow-hidden shadow-xl border-4 border-white/60 min-h-[350px] lg:min-h-full">
          <div className="absolute inset-0 bg-gradient-to-t from-[#8B3A1A]/20 to-transparent z-10 pointer-events-none"></div>
          <img 
            src="/images/meera-devi-potter.png" 
            alt="Potter at work" 
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
            <h3 className="text-2xl font-bold text-[#8B3A1A] karigar-serif mb-4">{t('sellerOnboarding.empoweringArtisansTitle')}</h3>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                title="Help Video Location"
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

export default OnboardingStep3;
