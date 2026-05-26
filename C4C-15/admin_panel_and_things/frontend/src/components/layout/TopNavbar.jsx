import { useState, useRef, useEffect } from 'react';
import { Bell, Moon, Sun, User, LogOut, Shield, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import { getNotifications } from '../../services/systemService';

export default function TopNavbar() {
  const { theme, cycleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const userStr = localStorage.getItem('asha_plus_user');
  let user = null;
  try { if (userStr) user = JSON.parse(userStr); } catch { console.error('Invalid stored user'); }

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const data = await getNotifications();
        if (data && data.length > 0) {
          setNotifications(data);
          setUnreadNotifications(true);
        }
      } catch {
        console.error('Failed to fetch notifications');
      }
    }
    fetchNotifications();
  }, []);

  const handleNotificationClick = (action) => {
    setUnreadNotifications(false);
    setShowNotifications(false);
    if (!action) return;

    switch (action) {
      case 'OPEN_TRIAGE':
        navigate('/dashboard?tab=triage');
        break;
      case 'OPEN_FOLLOWUPS':
        navigate('/dashboard?tab=followups');
        break;
      case 'OPEN_HEATMAP':
        navigate('/admin?tab=heatmap');
        break;
      case 'OPEN_PERSONNEL':
        navigate('/admin?tab=personnel');
        break;
      case 'OPEN_SCREENINGS':
        navigate('/admin?tab=screenings');
        break;
      default:
        navigate(action);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark';
    if (theme === 'light') return 'Light';
    return 'System';
  };

  return (
    <header className="h-16 border-b border-border-primary/50 bg-surface-1 flex items-center justify-between px-6 shrink-0 transition-colors duration-200">
      <div className="flex items-center space-x-6 flex-1">
        <h1 className="text-2xl font-bold tracking-tight text-text-main hidden md:block">
          Asha<span className="align-super text-[0.7em] text-accent-primary">+</span>
        </h1>
        
        {user && (
          <div className="hidden md:flex items-center space-x-2 border-l border-border-primary/50 pl-6 py-1">
            <Shield className="w-4 h-4 text-accent-primary" />
            <div>
              <p className="text-xs font-bold text-text-main tracking-wider uppercase">{user.role} Level</p>
              <p className="text-[10px] font-bold text-text-muted mt-0.5 tracking-widest uppercase">{user.name} &bull; {user.phcName || user.phc}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <button 
          onClick={cycleTheme} 
          className="flex items-center space-x-2 px-3 py-1.5 transition-colors duration-200 rounded-lg border border-border-primary/50 text-text-muted hover:text-text-main hover:bg-surface-2/50 bg-surface-2 shadow-sm"
          title="Cycle Theme"
        >
          {getThemeIcon()}
          <span className="text-[10px] font-bold uppercase tracking-widest">{getThemeLabel()}</span>
        </button>

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setUnreadNotifications(false); }} 
            className={`p-1.5 transition-colors duration-200 relative rounded-lg border ${showNotifications ? 'bg-surface-2 text-text-main border-border-primary/50 shadow-sm' : 'bg-surface-2/30 border-border-primary/50 text-text-muted hover:text-text-main hover:bg-surface-2'}`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-status-red rounded-full"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface-1 border border-border-primary/50 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-border-primary/50 mb-2">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-text-muted">Operational Alerts</h3>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n.action)}
                      className={`px-4 py-3 hover:bg-surface-2/50 transition-colors duration-200 cursor-pointer border-l-2 ${n.severity === 'CRITICAL' ? 'border-status-red' : n.severity === 'INFO' ? 'border-status-green' : n.severity === 'HIGH' ? 'border-status-yellow' : 'border-accent-primary'}`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-widest ${n.severity === 'CRITICAL' ? 'bg-status-red/10 text-status-red' : n.severity === 'INFO' ? 'bg-status-green/10 text-status-green' : n.severity === 'HIGH' ? 'bg-status-yellow/10 text-status-yellow' : 'bg-accent-primary/10 text-accent-primary'}`}>{n.severity}</span>
                        <span className="text-[10px] font-medium text-text-muted">{new Date(n.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-semibold text-text-main leading-tight">{n.title}</p>
                      <p className="text-[11px] text-text-muted mt-1 leading-tight">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-text-muted">No active operational alerts.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)} 
            className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer transition-colors duration-200 ${showProfile ? 'bg-surface-2 border-border-primary/50 shadow-sm' : 'bg-surface-2/50 border-border-primary/50 hover:bg-surface-2'}`}
          >
            <User className="w-4 h-4 text-text-main" />
          </div>

          {showProfile && user && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-1 border border-border-primary/50 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-start space-x-2 px-4 py-3 text-[11px] font-bold text-status-red hover:bg-status-red/5 transition-colors duration-200 uppercase tracking-widest"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
