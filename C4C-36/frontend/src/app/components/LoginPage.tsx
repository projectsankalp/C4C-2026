import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Globe } from 'lucide-react';
import { LoginToggle } from './LoginToggle';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';

import { api } from '../services/api';
import { toast } from 'sonner';
const serif = { fontFamily: '"Instrument Serif", serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };

const langLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
};

export function LoginPage() {
  const [userType, setUserType] = useState<'artisan' | 'validator'>('artisan');
  const [phoneNumber, setPhoneNumber] = useState('+91 9876543210');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [email, setEmail] = useState('validator@nss.org');
  const [password, setPassword] = useState('password123');
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleSendOTP = async () => {
    try {
      await api.requestOTP(phoneNumber);
      setShowOTP(true);
      toast.success('OTP sent successfully!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleArtisanLogin = async () => {
    try {
      const res = await api.verifyOTP(phoneNumber, otp);
      login('artisan', res.access_token);
      navigate('/hub');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleValidatorLogin = async () => {
    try {
      const res = await api.login(email, password);
      login('validator', res.access_token);
      navigate('/admin');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const inputClass =
    'w-full bg-zinc-50/80 border border-zinc-200 rounded-2xl px-4 py-3.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/30 focus:border-[#2F6BFF] transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative" style={sans}>
      {/* Brand Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2 hidden md:flex">
        <span className="text-zinc-900 leading-none" style={{ ...serif, fontSize: '26px' }}>
          Kushal
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[600px] mt-12 md:mt-0"
      >
        {/* Language Switcher (on login page) */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/70 border border-zinc-200 text-zinc-600 hover:bg-white transition-colors backdrop-blur"
              style={{ fontSize: '16px' }}
            >
              <Globe size={18} />
              <span>{langLabels[language]}</span>
            </button>

            {langOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                  {(Object.keys(langLabels) as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 transition-colors ${language === lang
                          ? 'bg-zinc-100 text-zinc-900 font-medium'
                          : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      style={{ fontSize: '14px' }}
                    >
                      {langLabels[lang]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">

          <h1
            className="text-zinc-900 leading-[0.95] tracking-tight"
            style={{ ...serif, fontSize: 'clamp(64px, 10vw, 96px)' }}
          >
            {t('welcome')}
            <br />
            <span className="italic">{t('back')}</span>
          </h1>
          <p className="text-black mt-6" style={{ fontSize: '18px' }}>
            {t('sign_in_continue')}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/85 backdrop-blur border border-zinc-200/70 rounded-[36px] p-12 md:p-14 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <LoginToggle selected={userType} onToggle={setUserType} />

          <AnimatePresence mode="wait">
            {userType === 'artisan' ? (
              <motion.div
                key="artisan"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
              >
                {!showOTP ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-zinc-500 mb-2.5" style={{ fontSize: '15px' }}>
                        {t('phone_number')}
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={inputClass}
                        placeholder="+91 98765 43210"
                        style={{ fontSize: '18px' }}
                      />
                    </div>

                    <button
                      onClick={handleSendOTP}
                      className="w-full bg-[#2F6BFF] text-white py-4.5 rounded-full hover:bg-[#1F58E8] transition-colors shadow-[0_2px_8px_rgba(47,107,255,0.35)]"
                      style={{ fontSize: '18px', padding: '1.25rem' }}
                    >
                      {t('send_otp')}
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-5">
                      <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                        {t('enter_otp')} {phoneNumber}
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className={inputClass}
                        placeholder="••••••"
                        maxLength={6}
                        style={{ fontSize: '18px', letterSpacing: '8px', textAlign: 'center' }}
                      />
                    </div>

                    <button
                      onClick={handleArtisanLogin}
                      className="w-full bg-[#2F6BFF] text-white py-4.5 rounded-full hover:bg-[#1F58E8] transition-colors shadow-[0_2px_8px_rgba(47,107,255,0.35)]"
                      style={{ fontSize: '18px', padding: '1.25rem' }}
                    >
                      {t('verify_continue')}
                    </button>

                    <button
                      onClick={() => setShowOTP(false)}
                      className="w-full mt-3 text-zinc-500 py-2 rounded-full hover:text-zinc-800 transition-colors"
                      style={{ fontSize: '13px' }}
                    >
                      {t('change_phone')}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="validator"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-5">
                  <label className="block text-zinc-500 mb-2.5" style={{ fontSize: '15px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="validator@nss.org"
                    style={{ fontSize: '18px' }}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-zinc-500 mb-2.5" style={{ fontSize: '15px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                    style={{ fontSize: '18px' }}
                  />
                </div>

                <button
                  onClick={handleValidatorLogin}
                  className="w-full bg-[#2F6BFF] text-white py-4.5 rounded-full hover:bg-[#1F58E8] transition-colors shadow-[0_2px_8px_rgba(47,107,255,0.35)]"
                  style={{ fontSize: '18px', padding: '1.25rem' }}
                >
                  Login to dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
