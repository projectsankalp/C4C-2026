import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, TrendingUp, Map, Radio, Globe, LogOut, Activity, Sprout, Shield } from 'lucide-react';
import { auth } from '../../services/auth';
import { t } from '../../services/i18n';

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const user      = auth.getUser();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : (userRole === 'admin' ? 'AD' : 'CI');

  const citizenLinks = [
    { name: t('dashboard'),       path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('agriAdvisory'),    path: '/advisory',  icon: <Sprout size={20} /> },
    { name: t('cleanAirMeasures'), path: '/measures',  icon: <Shield size={20} /> },
    { name: t('aqiMap'),          path: '/map',       icon: <Map size={20} /> },
    { name: t('alerts'),          path: '/alerts',    icon: <AlertCircle size={20} /> },
    { name: t('villageRankings'), path: '/rankings',  icon: <TrendingUp size={20} /> },
    { name: t('language'),        path: '/language',  icon: <Globe size={20} /> },
  ];

  const adminLinks = [
    { name: t('controlCentre'),   path: '/admin',     icon: <LayoutDashboard size={20} /> },
    { name: t('agriAdvisory'),    path: '/advisory',  icon: <Sprout size={20} /> },
    { name: t('cleanAirMeasures'), path: '/measures',  icon: <Shield size={20} /> },
    { name: t('aqiMap'),          path: '/map',       icon: <Map size={20} /> },
    { name: t('alertCentre'),     path: '/alerts',    icon: <AlertCircle size={20} /> },
    { name: t('nodeManagement'),  path: '/nodes',     icon: <Radio size={20} /> },
    { name: t('villageRankings'), path: '/rankings',  icon: <TrendingUp size={20} /> },
    { name: t('language'),        path: '/language',  icon: <Globe size={20} /> },
  ];

  const links = userRole === 'admin' ? adminLinks : citizenLinks;

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--color-secondary)',
      color: 'white',
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* User Profile */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ width: 48, height: 48, backgroundColor: 'var(--color-primary)', borderRadius: '50%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>
          {initials}
        </div>
        <h3 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600 }}>
          {user?.full_name || (userRole === 'admin' ? 'Administrator' : 'Citizen')}
        </h3>
        <p style={{ margin: 0, fontSize: 12, color: '#93C5FD' }}>
          {user?.village_name || (userRole === 'admin' ? 'Admin HQ' : 'Villager')}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {user?.role || userRole}
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '11px 20px',
                    color: isActive ? 'var(--color-primary)' : '#CBD5E1',
                    backgroundColor: isActive ? 'rgba(255,107,0,0.15)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                    fontWeight: isActive ? '600' : '400',
                    fontSize: 14,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {React.cloneElement(link.icon, { color: isActive ? 'var(--color-primary)' : '#64748B', size: 18 })}
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* System Health Indicator */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94A3B8' }}>
          <Activity size={14} color="#16A34A" />
          <span>{t('backendOnline')}</span>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '14px 20px' }}>
        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, width: '100%' }}>
          <LogOut size={18} />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
