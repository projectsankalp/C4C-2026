import React from 'react';
import { Home, Award, Briefcase, User, Sparkles, Globe, Volume2, VolumeX, Eye } from 'lucide-react';
import type { LanguageStrings, AppLanguage } from '../data/translations';

interface DesktopSidebarProps {
  activeTab: 'home' | 'skills' | 'schemes' | 'profile';
  setActiveTab: (tab: 'home' | 'skills' | 'schemes' | 'profile') => void;
  labels: LanguageStrings;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  activeTab, setActiveTab, labels, lang, setLang, 
  audioEnabled, setAudioEnabled, highContrast, setHighContrast 
}) => {
  const navItems = [
    { id: 'home' as const, label: labels.homeTitle, icon: Home },
    { id: 'skills' as const, label: labels.assessmentTitle, icon: Award },
    { id: 'schemes' as const, label: labels.exploreSchemes, icon: Briefcase },
    { id: 'profile' as const, label: labels.profileTitle, icon: User },
  ];

  return (
    <aside className="hidden md:flex w-[260px] bg-teal-600 dark:bg-slate-900 flex-col h-screen sticky top-0 text-white shadow-xl flex-shrink-0">
      
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-2 border-b border-teal-500/30 dark:border-slate-800">
        <Sparkles className="text-gold-400" size={24} />
        <h1 className="text-xl font-extrabold tracking-tight m-0 leading-none">
          {labels.appName}
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
                isActive
                  ? 'bg-white text-teal-700 dark:bg-teal-950 dark:text-teal-400 shadow-md transform scale-105'
                  : 'text-teal-100 hover:bg-teal-700 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-[2.5]' : ''} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Accessibility Controls Footer */}
      <div className="p-6 border-t border-teal-500/30 dark:border-slate-800 space-y-4">
        
        {/* Language Selector */}
        <div className="bg-teal-700 dark:bg-slate-800 rounded-xl p-1 flex items-center">
          <Globe size={16} className="ml-2 text-teal-200" />
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as AppLanguage)}
            className="w-full bg-transparent text-white text-sm font-bold p-2 outline-none cursor-pointer"
          >
            <option value="en" className="text-slate-900">English</option>
            <option value="hi" className="text-slate-900">हिन्दी (Hindi)</option>
            <option value="kn" className="text-slate-900">ಕನ್ನಡ (Kannada)</option>
            <option value="te" className="text-slate-900">తెలుగు (Telugu)</option>
            <option value="ta" className="text-slate-900">தமிழ் (Tamil)</option>
            <option value="ml" className="text-slate-900">മലയാളം (Malayalam)</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors border ${
              audioEnabled 
                ? 'bg-amber-400 text-teal-950 border-amber-400' 
                : 'bg-transparent text-teal-200 border-teal-500 hover:bg-teal-700'
            }`}
          >
            {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Audio
          </button>

          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-colors border ${
              highContrast 
                ? 'bg-black text-yellow-300 border-yellow-300' 
                : 'bg-transparent text-teal-200 border-teal-500 hover:bg-teal-700'
            }`}
          >
            <Eye size={16} />
            Contrast
          </button>
        </div>

      </div>
    </aside>
  );
};
