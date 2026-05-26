import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageToggle from '../components/shared/LanguageToggle';

export default function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();

  const [role, setRole] = useState('asha');

  const [form, setForm] = useState({
    ashaId: '',
    pin: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await login({ ...form, role });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t('login_failed', 'Login failed. Check your credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared Styles
  const inputStyles =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all font-medium';

  const labelStyles =
    'block text-sm font-bold text-slate-700 mb-1.5 ml-1';

  const roles = [
    {
      key: 'asha',
      label: t('asha_worker', 'ASHA'),
      icon: ''
    },
    {
      key: 'doctor',
      label: t('doctor', 'Doctor'),
      icon: ''
    },
    {
      key: 'hospital',
      label: t('hospital', 'Hospital'),
      icon: ''
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">

      {/* Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Login Card */}
      <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 w-full max-w-md p-6 sm:p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">

        {/* Header */}
        <div className="text-center mb-8">

          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30"
            style={{
              background:
                'linear-gradient(135deg, #16a34a 0%, #065f46 100%)'
            }}
          >
            <span className="text-white text-3xl">🌿</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-700">
            {t('app_name', 'ASDIQA')}
          </h1>

          <p className="text-slate-500 text-sm font-medium mt-1">
            {t(
              'app_subtitle',
              'Rural Health Screening System'
            )}
          </p>

          <div className="mt-4 flex justify-center">
            <LanguageToggle />
          </div>
        </div>

        {/* Role Selector */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] w-full mb-6 border border-slate-200/50">
          {roles.map((r) => {
            const isActive = role === r.key;

            return (
              <button
                key={r.key}
                type="button"
                onClick={() => {
                  setRole(r.key);
                  setError('');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-white text-green-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <span>{r.icon}</span>

                <span className={isActive ? 'block' : 'hidden sm:block'}>
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {role === 'asha' ? (
            <>
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">

                <label className={labelStyles}>
                  {t('asha_id', 'ASHA Worker ID')}
                </label>

                <input
                  className={inputStyles}
                  placeholder={t('asha_id_placeholder', 'e.g. ASHA001')}
                  value={form.ashaId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      ashaId: e.target.value
                    }))
                  }
                  required
                />
              </div>

              <div className="animate-in fade-in slide-in-from-right-4 duration-300 delay-75">

                <label className={labelStyles}>
                  {t('pin', '4-Digit PIN')}
                </label>

                <input
                  type="password"
                  className={inputStyles}
                  placeholder="••••"
                  maxLength={4}
                  inputMode="numeric"
                  value={form.pin}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pin: e.target.value
                    }))
                  }
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">

                <label className={labelStyles}>
                  {t('email', 'Email Address')}
                </label>

                <input
                  type="email"
                  className={inputStyles}
                  placeholder={t(
                    'email_placeholder',
                    'doctor@phc.com'
                  )}
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: e.target.value
                    }))
                  }
                  required
                />
              </div>

              <div className="animate-in fade-in slide-in-from-left-4 duration-300 delay-75">

                <label className={labelStyles}>
                  {t('password', 'Password')}
                </label>

                <input
                  type="password"
                  className={inputStyles}
                  placeholder={t(
                    'password_placeholder',
                    'Enter password'
                  )}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      password: e.target.value
                    }))
                  }
                  required
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm font-semibold animate-in fade-in duration-300">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-2 font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:shadow-md hover:from-green-700 hover:to-emerald-800 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white/70"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>

                <span>
                  {t('authenticating', 'Authenticating...')}
                </span>
              </>
            ) : (
              <>
                <span>
                  {t('secure_login', 'Secure Login')}
                </span>

                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-500">

          <p className="font-extrabold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="text-green-500 text-base">ℹ️</span>

            {t('demo_credentials', 'Demo Credentials')}
          </p>

          <div className="space-y-1.5">

            <p className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span>{t('asha_worker', 'ASHA')}:</span>

              <strong className="text-slate-700 font-mono bg-slate-200/50 px-1.5 rounded">
                ASHA001 / 1234
              </strong>
            </p>

            <p className="flex justify-between border-b border-slate-200/60 pb-1.5">
              <span>{t('doctor', 'Doctor')}:</span>

              <strong className="text-slate-700 font-mono bg-slate-200/50 px-1.5 rounded">
                doctor@phc.com / doctor123
              </strong>
            </p>

            <p className="flex justify-between">
              <span>{t('hospital', 'Hospital')}:</span>

              <strong className="text-slate-700 font-mono bg-slate-200/50 px-1.5 rounded">
                hospital@chc.com / hospital123
              </strong>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}