import { useTranslation } from 'react-i18next';

export default function StepIndicator({ current }) {
  const { t } = useTranslation();

  const steps = [
    t('patient_info', 'Patient Info'),
    t('vitals', 'Vitals'),
    t('symptoms', 'Symptoms'),
    t('risk_factors', 'Risk Factors'),
    'Ayurveda',
    t('pregnancy', 'Pregnancy')
  ];

  return (
    <div className="w-full mb-8">
      
      {/* Progress Bar Container */}
      <div className="flex items-center justify-between relative z-10 px-2 sm:px-0">
        {steps.map((label, i) => {
          const num = i + 1;
          const isDone = num < current;
          const isActive = num === current;

          return (
            <div
              key={num}
              className="flex items-center flex-1 last:flex-none"
            >
              
              {/* Step Circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-300 ease-out z-10 ${
                    isDone
                      ? 'bg-green-600 text-white shadow-sm'
                      : isActive
                      ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white ring-4 ring-green-100 shadow-md scale-110'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    num
                  )}
                </div>

                {/* Desktop Label */}
                <span
                  className={`absolute top-12 text-xs font-bold whitespace-nowrap transition-colors duration-300 hidden sm:block ${
                    isActive
                      ? 'text-green-700'
                      : isDone
                      ? 'text-slate-600'
                      : 'text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting Line */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-1.5 mx-1 sm:mx-2 rounded-full bg-slate-100 overflow-hidden relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-green-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: isDone ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Label Display */}
      <div className="mt-6 text-center sm:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
          {t('step', 'Step')} {current} {t('of', 'of')} {steps.length}
        </span>

        <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
          {steps[current - 1]}
        </h3>
      </div>
      
    </div>
  );
}