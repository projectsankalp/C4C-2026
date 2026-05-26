import { useState } from 'react';
import { Upload, User, LogOut, Globe } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, Language } from '../contexts/LanguageContext';

const langLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  kn: 'ಕನ್ನಡ',
};

export function TopNavigation() {
  const { isLoggedIn, userType, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);

  if (!isLoggedIn) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const serif = { fontFamily: '"Instrument Serif", serif' };

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-zinc-200/70 px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-zinc-900 leading-none" style={{ ...serif, fontSize: '26px' }}>
              Kushal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2" style={{ fontSize: '14px' }}>
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              <Globe size={15} />
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
                      className={`w-full text-left px-4 py-2.5 transition-colors ${
                        language === lang
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

          {userType === 'artisan' && (
            <>
              <Link
                to="/hub"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors ${
                  isActive('/hub')
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Upload size={15} />
                <span>{t('upload')}</span>
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors ${
                  isActive('/profile')
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <User size={15} />
                <span>{t('profile')}</span>
              </Link>
            </>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <LogOut size={15} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
