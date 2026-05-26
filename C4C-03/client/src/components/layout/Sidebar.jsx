import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Separated icons from labels for better styling control
const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/doctor/alerts', label: 'Alerts', icon: '🚨' },
  { to: '/doctor/search', label: 'Search Patients', icon: '🔍' },
  { to: '/doctor/villages', label: 'Village Summary', icon: '🗺️' },
  { to: '/doctor/referrals', label: 'Referrals', icon: '📋' }
];

const hospitalLinks = [
  { to: '/hospital', label: 'Referrals', icon: '🏥' }
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'doctor' ? doctorLinks : hospitalLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4 hidden md:flex flex-col shrink-0 relative z-10">
      
      {/* Subtle section header for a dashboard feel */}
      <div className="px-3 pb-3 pt-2 mb-2 border-b border-slate-100">
        <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Main Menu
        </p>
      </div>

      <nav className="flex flex-col gap-1.5">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            // Using a function for className to access isActive state on the container
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] outline-none ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50 font-bold' 
                  : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`
            }
          >
            {/* Using NavLink's render prop to conditionally style the inner children */}
            {({ isActive }) => (
              <>
                <span 
                  className={`text-xl transition-all duration-300 ${
                    isActive 
                      ? 'scale-110 drop-shadow-sm' 
                      : 'opacity-70 grayscale-[30%]'
                  }`}
                >
                  {l.icon}
                </span>
                <span className="tracking-wide">{l.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}