import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function BottomNav() {
  const { t } = useTranslation();

  const links = [
    { to: '/asha', label: t('home', 'Home'), icon: '🏠' },
    { to: '/asha/new-screening', label: t('new_screening', 'Screen'), icon: '➕' },
    { to: '/asha/patients', label: t('my_patients', 'Patients'), icon: '👥' },
    { to: '/asha/followups', label: t('follow_ups', 'Follow-ups'), icon: '📅' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/85 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] supports-[backdrop-filter]:bg-white/60">
      <div className="flex items-center justify-around px-1 pt-2 pb-5">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/asha'}
            className="flex flex-col items-center justify-center w-16 gap-1 group outline-none"
          >
            {({ isActive }) => (
              <>
                {/* Icon Container with Material You style active pill */}
                <div
                  className={`flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300 group-active:scale-95 ${
                    isActive
                      ? 'bg-blue-100 border border-blue-200/50'
                      : 'bg-transparent border border-transparent group-hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`text-xl transition-all duration-300 ${
                      isActive
                        ? 'scale-110 drop-shadow-sm opacity-100'
                        : 'opacity-70 grayscale-[30%] group-hover:opacity-100'
                    }`}
                  >
                    {l.icon}
                  </span>
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] tracking-wide transition-all duration-300 group-active:scale-95 ${
                    isActive
                      ? 'text-blue-700 font-extrabold'
                      : 'text-slate-500 font-semibold'
                  }`}
                >
                  {l.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}