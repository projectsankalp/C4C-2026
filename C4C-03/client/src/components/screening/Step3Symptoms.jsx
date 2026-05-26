import { useTranslation } from 'react-i18next';

export default function Step3Symptoms({ data, onChange }) {
  const { t } = useTranslation();

  const symptoms = [
    {
      key: 'urination',
      label: t('frequent_urination'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ) // Liquid/beaker
    },
    {
      key: 'thirst',
      label: t('excessive_thirst'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) // Heat/Thirst
    },
    {
      key: 'vision',
      label: t('blurred_vision'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) // Eye
    },
    {
      key: 'headache',
      label: t('headache'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ) // Lightning bolt (pain)
    },
    {
      key: 'fatigue',
      label: t('fatigue'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) // Moon/Rest
    },
    {
      key: 'numbness',
      label: t('numbness'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
        </svg>
      ) // Hand/Extremity
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('symptom_check', 'Symptom Check')}
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {t(
              'symptom_subtitle',
              'Select Yes or No for reported symptoms'
            )}
          </p>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-3">
        {symptoms.map((s) => {
          const isYes = data[s.key] === true;
          const isNo = data[s.key] === false;

          let cardStyle = 'bg-white border-slate-200 hover:border-slate-300';
          let textStyle = 'text-slate-700';
          let iconBg = 'bg-slate-50 border-slate-100 text-slate-500';

          if (isYes) {
            cardStyle = 'bg-rose-50/50 border-rose-200 shadow-sm';
            textStyle = 'text-rose-900';
            iconBg = 'bg-rose-100 border-rose-200 text-rose-600';
          } else if (isNo) {
            cardStyle = 'bg-emerald-50/50 border-emerald-200 shadow-sm';
            textStyle = 'text-emerald-900';
            iconBg = 'bg-emerald-100 border-emerald-200 text-emerald-600';
          }

          return (
            <div
              key={s.key}
              className={`p-3 sm:p-4 rounded-[1.25rem] border transition-all duration-300 flex items-center justify-between gap-3 ${cardStyle}`}
            >
              {/* Left */}
              <div className="flex items-center gap-3 md:gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors duration-300 ${iconBg}`}
                >
                  {s.icon}
                </div>

                <span
                  className={`font-bold text-sm sm:text-base transition-colors duration-300 ${textStyle}`}
                >
                  {s.label}
                </span>
              </div>

              {/* Right Buttons */}
              <div className="flex gap-2 shrink-0 bg-slate-100/50 p-1 rounded-[1.25rem] border border-slate-100">
                {/* YES */}
                <button
                  type="button"
                  onClick={() => onChange({ [s.key]: true })}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isYes
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-200 border border-rose-600'
                      : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                  }`}
                >
                  {t('yes')}
                </button>

                {/* NO */}
                <button
                  type="button"
                  onClick={() => onChange({ [s.key]: false })}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                    isNo
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 border border-emerald-600'
                      : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 border border-transparent'
                  }`}
                >
                  {t('no')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}