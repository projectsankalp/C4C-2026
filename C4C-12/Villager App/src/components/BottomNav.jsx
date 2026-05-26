/**
 * src/components/BottomNav.jsx
 * Persistent bottom navigation bar with 5 items: Home | History | Family | Education | Settings.
 * Designed with large touch targets (min 48px) for accessibility.
 */

import React from 'react';
import { Home, ClipboardList, Users, BookOpen, Settings } from 'lucide-react';
import useLanguage from '../hooks/useLanguage';

export default function BottomNav({ currentPage, onPageChange }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('dashboard.actionBook') === 'Book Visit' ? 'Home' : 'ಮುಖಪುಟ', icon: Home },
    { id: 'history', label: t('history.title'), icon: ClipboardList },
    { id: 'family', label: t('family.title'), icon: Users },
    { id: 'education', label: t('education.title'), icon: BookOpen },
    { id: 'settings', label: t('settings.title'), icon: Settings }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`nav-item-btn ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <IconComponent size={24} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
