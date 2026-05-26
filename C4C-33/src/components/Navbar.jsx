import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Sparkles, Check, CheckCircle2, Eye, ZoomIn } from 'lucide-react';
import { t } from '../utils/translator';

export default function Navbar({ 
  activeScreen, 
  setActiveScreen, 
  language, 
  setLanguage, 
  ruralMode, 
  lowBandwidth, 
  largeText,
  userAccount,
  onLoginClick,
  onLogoutClick
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'landing', labelKey: 'nav_curation' },
    { id: 'marketplace', labelKey: 'nav_marketplace' },
    { id: 'whatsapp', labelKey: 'nav_artisan_hub' }
  ];

  const languagesList = [
    { code: 'EN', name: 'English' },
    { code: 'HI', name: 'हिन्दी' },
    { code: 'KN', name: 'ಕನ್ನಡ' }
  ];

  const getActiveLangName = () => {
    const active = languagesList.find(l => l.code === language);
    return active ? active.name : 'English';
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'py-4 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/50 shadow-sm' 
        : 'py-6 bg-[#FAF8F5]/80 backdrop-blur-sm border-b border-stone-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        
        {/* Brand Logo matching mockups */}
        <div 
          onClick={() => {
            setActiveScreen('landing');
            setShowLangDropdown(false);
          }} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#1C1917] flex items-center justify-center text-white text-sm font-semibold tracking-wider transition-all duration-500 group-hover:scale-105 shadow-md">
            🏺
          </div>
          <div className="text-left">
            <h1 className="title-serif text-xl md:text-2xl font-bold tracking-wide text-stone-900 flex items-center gap-1.5 leading-none">
              HaathSe <span className="text-[9px] uppercase font-sans tracking-widest text-[#1C1917] font-bold px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200">AI</span>
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <p className="text-[8px] uppercase tracking-widest text-stone-400 font-medium">KritiCam Provenance</p>
              {ruralMode && (
                <span className="flex items-center gap-0.5 text-[7px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-1.5 h-1.5 text-stone-700 animate-pulse-subtle" /> Rural
                </span>
              )}
              {lowBandwidth && (
                <span className="flex items-center gap-0.5 text-[7px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold uppercase tracking-wider">
                  <Eye className="w-1.5 h-1.5 text-amber-700" /> Stencils
                </span>
              )}
              {largeText && (
                <span className="flex items-center gap-0.5 text-[7px] text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-bold uppercase tracking-wider">
                  <ZoomIn className="w-1.5 h-1.5 text-stone-700" /> Text+
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveScreen(link.id);
                setShowLangDropdown(false);
              }}
              className={`text-xs uppercase tracking-widest font-medium transition-all duration-300 relative py-1 ${
                activeScreen === link.id 
                  ? 'text-stone-900 font-bold' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {t(link.labelKey, language)}
              {activeScreen === link.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-stone-900" />
              )}
            </button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4 relative">
          
          {/* Smart AI Language Selector Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowLangDropdown(!showLangDropdown)} 
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-stone-200 text-xs tracking-wider text-stone-600 hover:border-stone-300 hover:text-stone-800 transition-all duration-300 bg-white"
            >
              <Globe className="w-3.5 h-3.5 text-stone-400" />
              <span>{getActiveLangName()}</span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2.5 w-48 bg-white border border-stone-100 rounded-2xl shadow-lg py-2 z-50 animate-slide-up text-left">
                <p className="text-[8px] uppercase tracking-widest text-stone-400 font-bold px-4 py-1 border-b border-stone-50 mb-1">Select Language</p>
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-xs flex justify-between items-center transition-colors ${
                      language === lang.code 
                        ? 'bg-stone-50 text-stone-900 font-semibold animate-pulse-subtle' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <Check className="w-3 h-3 text-stone-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User account state or Log In button */}


          {/* Luxury CTA */}
          <button 
            onClick={() => {
              setActiveScreen('marketplace');
              setShowLangDropdown(false);
            }} 
            className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-white" />
              {t("acquire_craft", language)}
            </span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center gap-3">
          
          {/* Native Language Select Badge */}
          <div className="relative">
            <button 
              onClick={() => setShowLangDropdown(!showLangDropdown)} 
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-gold-500/20 text-[10px] tracking-wider text-charcoal-700 bg-white"
            >
              <Globe className="w-3.5 h-3.5 text-gold-500" />
              <span>{language}</span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-32 glass-panel border border-gold-500/15 rounded-xl shadow-luxury py-1.5 z-50 text-left">
                {languagesList.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className="w-full px-3 py-1.5 text-[10px] text-charcoal-700 hover:bg-gold-100 flex justify-between items-center"
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && <Check className="w-2.5 h-2.5 text-terracotta" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setIsOpen(!isOpen);
              setShowLangDropdown(false);
            }}
            className="text-charcoal hover:text-terracotta transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-ivory z-40 animate-fade-in flex flex-col justify-between p-8 border-t border-gold-500/10">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveScreen(link.id);
                  setIsOpen(false);
                }}
                className={`text-left text-lg title-serif tracking-wide py-2 border-b border-gold-500/5 ${
                  activeScreen === link.id 
                    ? 'text-terracotta font-semibold' 
                    : 'text-charcoal-700'
                }`}
              >
                {t(link.labelKey, language)}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                setActiveScreen('whatsapp');
                setIsOpen(false);
              }}
              className="w-full text-center py-3.5 rounded-full border border-terracotta/20 text-terracotta text-xs uppercase tracking-widest font-semibold bg-white"
            >
              {t("nav_artisan_hub", language)}
            </button>
            <button 
              onClick={() => {
                setActiveScreen('marketplace');
                setIsOpen(false);
              }}
              className="w-full text-center py-3.5 rounded-full bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold"
            >
              {t("acquire_craft", language)}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
