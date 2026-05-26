import { useTranslation } from 'react-i18next';

// Custom iOS-style Segmented Control
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex bg-slate-100/80 p-1.5 rounded-[1.25rem] w-full border border-slate-200/50">
      {options.map((opt) => {
        const isActive = value === opt.value;

        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2.5 text-sm sm:text-base font-bold rounded-xl transition-all duration-200 active:scale-95 ${
              isActive
                ? opt.activeClass
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default function Step4RiskFactors({ data, onChange }) {
  const { t } = useTranslation();

  // Yes / No
  const yesNoOptions = [
    {
      label: t('yes'),
      value: true,
      activeClass:
        'bg-rose-500 text-white shadow-md border border-rose-600'
    },
    {
      label: t('no'),
      value: false,
      activeClass:
        'bg-emerald-500 text-white shadow-md border border-emerald-600'
    }
  ];

  // Smoking
  const smokingOptions = [
    {
      label: t('yes'),
      value: 'yes',
      activeClass:
        'bg-rose-500 text-white shadow-md border border-rose-600'
    },
    {
      label: t('ex_smoker', 'Ex-Smoker'),
      value: 'ex',
      activeClass:
        'bg-amber-500 text-white shadow-md border border-amber-600'
    },
    {
      label: t('no'),
      value: 'no',
      activeClass:
        'bg-emerald-500 text-white shadow-md border border-emerald-600'
    }
  ];

  // Exercise
  const exerciseOptions = [
    {
      label: t('none', 'None'),
      value: 'none',
      activeClass:
        'bg-rose-500 text-white shadow-md border border-rose-600'
    },
    {
      label: t('moderate', 'Moderate'),
      value: 'moderate',
      activeClass:
        'bg-blue-500 text-white shadow-md border border-blue-600'
    },
    {
      label: t('active', 'Active'),
      value: 'active',
      activeClass:
        'bg-emerald-500 text-white shadow-md border border-emerald-600'
    }
  ];

  // Stress
  const stressOptions = [
    {
      label: t('low', 'Low'),
      value: 'low',
      activeClass:
        'bg-emerald-500 text-white shadow-md border border-emerald-600'
    },
    {
      label: t('medium', 'Medium'),
      value: 'medium',
      activeClass:
        'bg-amber-500 text-white shadow-md border border-amber-600'
    },
    {
      label: t('high', 'High'),
      value: 'high',
      activeClass:
        'bg-rose-500 text-white shadow-md border border-rose-600'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">

        <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-sm border border-orange-100">
          ⚠️
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('risk_factors')}
          </h2>

          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {t(
              'risk_factor_subtitle',
              'Evaluate history and lifestyle habits'
            )}
          </p>
        </div>
      </div>

      <div className="space-y-5">

        {/* Family History */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 sm:p-5 shadow-sm space-y-5">

          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
            <span></span>
            {t('family_history', 'Family & History')}
          </h3>

          <div className="space-y-4">

            {/* Diabetes */}
            <div className="space-y-2.5">
              <span className="block font-bold text-slate-700 ml-1">
                {t('family_diabetes')}
              </span>

              <SegmentedControl
                options={yesNoOptions}
                value={data.familyDiabetes}
                onChange={(v) => onChange({ familyDiabetes: v })}
              />
            </div>

            {/* BP */}
            <div className="space-y-2.5">
              <span className="block font-bold text-slate-700 ml-1">
                {t('family_bp')}
              </span>

              <SegmentedControl
                options={yesNoOptions}
                value={data.familyBP}
                onChange={(v) => onChange({ familyBP: v })}
              />
            </div>

          </div>
        </div>

        {/* Lifestyle */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 sm:p-5 shadow-sm space-y-6">

          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
            <span></span>
            {t('lifestyle_habits', 'Lifestyle & Habits')}
          </h3>

          {/* Alcohol */}
          <div className="space-y-2.5">
            <span className="block font-bold text-slate-700 ml-1">
              {t('alcohol')}
            </span>

            <SegmentedControl
              options={yesNoOptions}
              value={data.alcohol}
              onChange={(v) => onChange({ alcohol: v })}
            />
          </div>

          {/* Smoking */}
          <div className="space-y-2.5">
            <span className="block font-bold text-slate-700 ml-1">
              {t('smoking')}
            </span>

            <SegmentedControl
              options={smokingOptions}
              value={data.smoking}
              onChange={(v) => onChange({ smoking: v })}
            />
          </div>

          {/* Exercise */}
          <div className="space-y-2.5">
            <span className="block font-bold text-slate-700 ml-1">
              {t('exercise')}
            </span>

            <SegmentedControl
              options={exerciseOptions}
              value={data.exercise}
              onChange={(v) => onChange({ exercise: v })}
            />
          </div>

          {/* Stress */}
          <div className="space-y-2.5">
            <span className="block font-bold text-slate-700 ml-1">
              {t('stress')}
            </span>

            <SegmentedControl
              options={stressOptions}
              value={data.stress}
              onChange={(v) => onChange({ stress: v })}
            />
          </div>

        </div>
      </div>
    </div>
  );
}