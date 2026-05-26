import { useState, useEffect, useCallback } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('asha_plus_theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('asha_plus_theme', theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setThemeState(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  }, []);

  return { theme, cycleTheme };
}
