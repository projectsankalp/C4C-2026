import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../shared/LanguageToggle';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Hide language toggle on doctor/hospital pages OR for doctor/hospital users
  const hideLanguage =
    location.pathname.includes('/doctor') ||
    location.pathname.includes('/hospital') ||
    user?.role === 'doctor' ||
    user?.role === 'hospital';

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow:
          '0 4px 30px rgba(0, 0, 0, 0.04), inset 0 -1px 0 rgba(255, 255, 255, 0.5)',
        borderBottom: '1px solid rgba(200, 200, 200, 0.2)'
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo Section */}
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-transform duration-200"
          style={{ transformOrigin: 'center' }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
            }}
          >
            <span className="text-white text-lg font-bold leading-none">🌿</span>
          </div>

          <span
            className="font-extrabold tracking-tight text-xl"
            style={{
              background: 'linear-gradient(to right, #166534, #16a34a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {t('app_name', 'ASDIQA')}
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-4">

          {!hideLanguage && <LanguageToggle />}

          {user?.name && (
            <span
              className="text-sm font-medium flex items-center px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(249, 250, 251, 0.7)',
                border: '1px solid rgba(229, 231, 235, 0.6)',
                color: '#374151',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {user.name}
            </span>
          )}

          <button
            onClick={logout}
            className="text-sm font-semibold px-4 py-2 rounded-2xl transition-all duration-200 ease-out"
            style={{
              color: '#dc2626',
              backgroundColor: 'rgba(254, 226, 226, 0.8)',
              border: '1px solid rgba(254, 202, 202, 0.5)',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)'
            }}
          >
            {t('logout', 'Logout')}
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-10 h-10 rounded-full transition-transform duration-200 relative z-10"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ backgroundColor: 'rgba(243, 244, 246, 0.6)' }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#374151"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 w-full h-screen bg-slate-900/20 backdrop-blur-sm"
            style={{ zIndex: -1 }}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div
            className="sm:hidden absolute top-full left-0 w-full px-4 py-5 flex flex-col gap-4 rounded-b-[2rem]"
            style={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid rgba(200, 200, 200, 0.2)',
              boxShadow: '0 20px 40px -5px rgba(0, 0, 0, 0.15)',
              animation: 'slideDown 0.2s ease-out forwards'
            }}
          >
            {user?.name && (
              <div className="flex flex-col gap-1 px-2">
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">
                  {t('account', 'Account')}
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {user.name}
                </span>
              </div>
            )}

            <div className="h-px w-full bg-slate-100" />

            {!hideLanguage && (
              <div className="flex justify-between items-center px-2">
                <span className="text-sm font-bold text-slate-700">
                  {t('language', 'Language')}
                </span>
                <LanguageToggle />
              </div>
            )}

            <button
              onClick={() => {
                logout();
                setIsMobileMenuOpen(false);
              }}
              className="w-full mt-2 text-base font-bold px-4 py-3.5 rounded-2xl transition-transform duration-200"
              style={{
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca'
              }}
            >
              {t('logout', 'Logout')}
            </button>
          </div>
        </>
      )}
    </nav>
  );
}