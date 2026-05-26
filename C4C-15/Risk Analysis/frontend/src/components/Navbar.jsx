import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, Sun, Moon, LogOut, User, Menu, X, Activity } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Load theme and auth on mount
  useEffect(() => {
    // Check dark mode
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Check mock auth user
    const savedUser = localStorage.getItem('health_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Add custom listener for custom storage events (auth changes)
    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('health_user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth-update', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-update', handleAuthChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('health_user');
    setUser(null);
    window.dispatchEvent(new Event('auth-update'));
    navigate('/auth');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Assess Risk', path: '/assess' },
    { name: 'Risk History', path: '/history' },
    { name: 'Health Advisory', path: '/recommendations' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-tealhealth-600 dark:text-tealhealth-500 font-bold text-xl group">
            <div className="bg-tealhealth-500/10 dark:bg-tealhealth-500/20 p-2 rounded-xl transition-all duration-300 group-hover:scale-105">
              <Activity className="h-6 w-6 text-tealhealth-600 dark:text-tealhealth-500 animate-pulse" />
            </div>
            <span className="bg-gradient-to-r from-tealhealth-600 to-indigo-600 dark:from-tealhealth-400 dark:to-indigo-400 bg-clip-text text-transparent">
              HealAI Risk
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-200 py-2 px-3 rounded-lg ${
                    isActive
                      ? 'text-tealhealth-600 dark:text-tealhealth-400 bg-tealhealth-500/10 dark:bg-tealhealth-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-tealhealth-600 dark:hover:text-tealhealth-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right-side Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-tealhealth-600 dark:hover:text-tealhealth-400 transition-all duration-200"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth status */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <User className="h-4 w-4 text-tealhealth-500" />
                  <span className="font-medium max-w-[100px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium py-2 px-3 rounded-xl hover:bg-rose-500/10 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-gradient-to-r from-tealhealth-600 to-indigo-600 hover:from-tealhealth-500 hover:to-indigo-500 text-white font-medium text-sm py-2 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 animate-fade-in py-4 px-4 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2.5 px-4 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-tealhealth-600 dark:text-tealhealth-400 bg-tealhealth-500/10 dark:bg-tealhealth-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-tealhealth-600 dark:hover:text-tealhealth-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 py-2 px-3 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <User className="h-5 w-5 text-tealhealth-500" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-semibold py-2.5 rounded-xl border border-rose-500/20 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full block text-center bg-gradient-to-r from-tealhealth-600 to-indigo-600 text-white font-medium py-2.5 rounded-xl shadow-md transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
