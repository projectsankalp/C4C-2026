import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { accessToken, user } = await login(username, password);
      const userRole = user.role.toLowerCase();

      if (userRole === 'asha') {
        setError('ASHA accounts must use the mobile application.');
        setLoading(false);
        return;
      }

      localStorage.setItem('asha_plus_token', accessToken);
      localStorage.setItem('asha_plus_user', JSON.stringify(user));
      
      navigate(userRole === 'doctor' ? '/dashboard' : '/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen overflow-y-auto lg:h-screen lg:overflow-hidden bg-[#050505] text-[#F4F1F2]">
      <div className="grid h-full lg:grid-cols-[1.2fr_0.8fr]">
        
        {/* LEFT COLUMN: OPERATIONAL CONTEXT PANEL */}
        <div className="hidden lg:flex h-full flex-col justify-center border-r border-white/10 bg-[#050505] px-10 lg:px-20">
          <div className="max-w-xl mx-auto w-full">
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-white mb-3">Asha<span className="align-super text-[0.7em] text-[#A83255]">+</span></h1>
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Offline Rural Triage Network</p>
              <p className="text-base font-medium text-white leading-relaxed">
                Rural NCD screening coordination platform for PHC doctors, ASHA workers, and district healthcare administrators.
              </p>
            </div>

            <div className="space-y-5 my-8">
              <div>
                <h3 className="text-xs font-bold text-[#A83255] uppercase tracking-widest mb-1.5">Field Screening</h3>
                <p className="text-base font-medium text-white leading-relaxed">
                  ASHA workers collect hypertension and diabetes screening data from villages in offline environments.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#A83255] uppercase tracking-widest mb-1.5">PHC Review</h3>
                <p className="text-base font-medium text-white leading-relaxed">
                  Doctors prioritize RED and FOLLOW_UP cases for clinical review and referral.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#A83255] uppercase tracking-widest mb-1.5">District Oversight</h3>
                <p className="text-base font-medium text-white leading-relaxed">
                  Administrators monitor PHC coverage, operational load, and regional burden distribution.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#8B1E3F]/30 bg-[#8B1E3F]/10 p-4 text-sm">
              <p className="font-semibold text-zinc-400 leading-relaxed">
                <span className="text-white font-bold">Screening support system only.</span><br/>
                Final diagnosis must be clinically confirmed at PHC.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOGIN PANEL */}
        <div className="flex h-full items-center justify-center bg-[#0B0B0D] px-8 relative py-12 lg:py-0">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111113] p-7 shadow-2xl flex flex-col">
              {/* Mobile-only branding header */}
              <div className="lg:hidden text-center mb-8 pb-8 border-b border-white/10">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Asha<span className="align-super text-[0.7em] text-[#A83255]">+</span></h1>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Offline Rural Triage Network</p>
              </div>

              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">Network Access</h2>
                <p className="text-sm font-medium text-zinc-400">
                  Secure PHC operations access for doctors and district administrators.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold animate-in fade-in">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username</label>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="admin"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#18181B] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#A83255]/60"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Password</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#18181B] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#A83255]/60"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="mt-4 w-full rounded-xl bg-[#8B1E3F] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#A83255] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>


              <div className="mt-8 text-center px-2">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Authorized operational personnel only.<br className="lg:hidden" />
                  <span className="hidden lg:inline"> </span>
                  All access activity is monitored and logged.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
