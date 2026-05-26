import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiUnlock, FiEdit2, FiGlobe } from 'react-icons/fi';
import SellerLayout from './components/SellerLayout';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

const SellerLogin = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, user } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user?.role === 'seller') {
      navigate('/seller/dashboard');
    }
  }, [isLoggedIn, user, navigate]);

  const handleVoiceInput = (text) => {
    const cleanText = text.toLowerCase();
    if (cleanText.includes('login') || cleanText.includes('aage') || cleanText.includes('enter') || cleanText.includes('sign in') || cleanText.includes('ಲಾಗ್ ಇನ್')) {
      handleLoginSubmit();
    } else {
      if (!fullName) {
        setFullName(text);
      } else {
        const digits = text.replace(/[^0-9]/g, '');
        if (digits) {
          setPassword(digits);
        }
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();

    const name = fullName.trim() || 'Aparna Devi';
    const passwordVal = password.trim();

    if (!passwordVal || passwordVal.length < 4) {
      toast.error('Please enter your password / secret code.');
      return;
    }

    const generatedEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@karigar.com`;
    const finalPassword = passwordVal.length < 6 ? passwordVal.padEnd(6, '0') : passwordVal;

    try {
      const res = await authService.login({ email: generatedEmail, password: finalPassword });

      if (res.user.role !== 'seller') {
        toast.error('This account is not a seller account.');
        return;
      }

      login(res.user, res.session?.access_token);
      toast.success(`Welcome back, ${res.user.full_name || name}!`);
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your name and password.');
    }
  };

  return (
    <SellerLayout onVoiceInput={handleVoiceInput}>
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full py-4 border-b border-[#E5DCD0]/60 z-10">
        <span className="text-2xl font-bold text-[#8B3A1A] tracking-wide karigar-serif cursor-pointer" onClick={() => navigate('/seller')}>
          KariGhar
        </span>
        <div className="flex items-center gap-6">
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

          <button 
            onClick={() => navigate('/seller')}
            className="w-10 h-10 rounded-full bg-white border border-[#E5DCD0] flex items-center justify-center text-[#8B3A1A] hover:bg-[#FFF0EB]"
            title="Profile Welcome"
          >
            <FiUser className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Login Screen Frame */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 max-w-2xl mx-auto w-full z-10">
        
        {/* Underlined Flourish Title */}
        <div className="text-center mb-8 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#8B3A1A] italic karigar-serif leading-snug">
            {t('sellerOnboarding.welcomeBackSister')}
          </h2>
          <div className="w-48 h-1.5 bg-[#8B3A1A] rounded-full mt-4 opacity-80"></div>
        </div>

        {/* Login White Card */}
        <form onSubmit={handleLoginSubmit} className="karigar-card w-full flex flex-col gap-6">
          
          {/* Green rounded icon row */}
          <div className="flex items-center gap-3 bg-[#EBF5EE] text-[#2D5A3D] p-4 rounded-2xl border border-[#2D5A3D]/10">
            <FiUnlock className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">
              {t('sellerOnboarding.enterNamePass')}
            </p>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-bold text-[#8B3A1A]">{t('sellerOnboarding.fullName')}</label>
            <div className="relative">
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('sellerOnboarding.placeholderName')}
                className="karigar-input pr-14"
                required
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg text-[#666666]">
                <FiEdit2 />
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-sm font-bold text-[#8B3A1A]">{t('login.password')}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="karigar-input pr-14"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl text-[#8B3A1A]"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <FiUnlock /> : <FiLock />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button type="submit" className="karigar-btn-primary w-full justify-center text-lg py-5 mt-2">
            {t('sellerOnboarding.loginLabel')}
          </button>

        </form>

      </div>
    </SellerLayout>
  );
};

export default SellerLogin;
