import { useTranslation } from 'react-i18next';

// Custom iOS-style Segmented Control
function SegmentedControl({ value, onChange }) {
  const { t } = useTranslation();

  const isYes = value === true;
  const isNo = value === false;

  return (
    <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] w-full border border-slate-200/50">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all duration-200 active:scale-95 ${
          isYes
            ? 'bg-rose-500 text-white shadow-md border border-rose-600'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
      >
        {t('yes')}
      </button>

      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all duration-200 active:scale-95 ${
          isNo
            ? 'bg-emerald-500 text-white shadow-md border border-emerald-600'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
      >
        {t('no')}
      </button>
    </div>
  );
}

export default function Step5Pregnancy({ data, onChange, gender }) {
  const { t } = useTranslation();

  // Non-female patients
  if (gender?.toLowerCase() !== 'female') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50/50 rounded-[2rem] border border-slate-200 border-dashed animate-in fade-in duration-300">
        
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm border border-slate-100 mb-4">
          ✅
        </div>

        <h3 className="text-lg font-extrabold text-slate-800">
          {t('not_applicable')}
        </h3>

        <p className="text-sm font-medium text-slate-500 text-center mt-1.5 max-w-[250px]">
          {t('pregnancy_not_required')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        
        <div className="w-10 h-10 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-xl shadow-sm border border-pink-100">
          🤰
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('pregnancy_history')}
          </h2>

          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {t('pregnancy_subtitle')}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 sm:p-5 shadow-sm space-y-6">

        {/* Current Pregnancy */}
        <div className="space-y-2.5">
          <span className="block font-bold text-slate-700 ml-1">
            {t('currently_pregnant')}
          </span>

          <SegmentedControl
            value={data.isPregnant}
            onChange={(v) => onChange({ isPregnant: v })}
          />
        </div>

        {/* Gestational Diabetes */}
        <div className="space-y-2.5">
          <span className="block font-bold text-slate-700 ml-1">
            {t('gestational_history')}
          </span>

          <SegmentedControl
            value={data.gestationalHistory}
            onChange={(v) => onChange({ gestationalHistory: v })}
          />
        </div>

      </div>
    </div>
  );
}