import { useTranslation } from 'react-i18next';
import { calculateBMI } from '../../utils/calculateBMI';

export default function Step2Vitals({ data, onChange }) {
  const { t } = useTranslation();

  const bmi = calculateBMI(data.weight, data.height);

  // Reusable styling
  const inputStyles =
    "w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-lg";

  const labelStyles =
    "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  // BMI Status
  let bmiStyle = "bg-slate-50 text-slate-500 border-slate-200";
  let bmiLabel = "";

  if (bmi) {
    if (bmi >= 30) {
      bmiStyle = "bg-red-50 text-red-700 border-red-200 shadow-sm";
      bmiLabel = t('obese', 'Obese');
    } else if (bmi >= 25) {
      bmiStyle = "bg-orange-50 text-orange-700 border-orange-200 shadow-sm";
      bmiLabel = t('overweight', 'Overweight');
    } else if (bmi >= 23) {
      bmiStyle = "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
      bmiLabel = t('at_risk', 'At-Risk');
    } else {
      bmiStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm";
      bmiLabel = t('normal', 'Normal');
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">
          🩺
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
            {t('vital_measurements')}
          </h2>

          <p className="text-xs font-medium text-slate-500 mt-0.5">
            {t('vitals_subtitle')}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-[1.25rem] p-4 flex items-start gap-3 shadow-sm">
        <div className="text-blue-500 text-lg mt-0.5"></div>

        <p className="text-sm text-blue-800 font-medium leading-relaxed">
          {t('glucose_notice')}
        </p>
      </div>

      {/* Blood Pressure */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-4 space-y-4">

        <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          {t('blood_pressure_title')}
        </h3>

        <div className="grid grid-cols-2 gap-4">

          {/* Systolic */}
          <div>
            <label className={labelStyles}>
              {t('systolic')}
            </label>

            <div className="relative">
              <input
                type="number"
                className={inputStyles}
                placeholder="120"
                value={data.systolic || ''}
                onChange={(e) =>
                  onChange({ systolic: e.target.value })
                }
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                mmHg
              </span>
            </div>
          </div>

          {/* Diastolic */}
          <div>
            <label className={labelStyles}>
              {t('diastolic')}
            </label>

            <div className="relative">
              <input
                type="number"
                className={inputStyles}
                placeholder="80"
                value={data.diastolic || ''}
                onChange={(e) =>
                  onChange({ diastolic: e.target.value })
                }
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                mmHg
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Physical */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-4 space-y-4">

        <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider mb-2 ml-1">
          {t('physical')}
        </h3>

        <div className="grid grid-cols-2 gap-4">

          {/* Weight */}
          <div>
            <label className={labelStyles}>
              {t('weight')}
            </label>

            <div className="relative">
              <input
                type="number"
                className={inputStyles}
                placeholder="65"
                value={data.weight || ''}
                onChange={(e) =>
                  onChange({ weight: e.target.value })
                }
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                {t('weight_unit')}
              </span>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className={labelStyles}>
              {t('height')}
            </label>

            <div className="relative">
              <input
                type="number"
                className={inputStyles}
                placeholder="160"
                value={data.height || ''}
                onChange={(e) =>
                  onChange({ height: e.target.value })
                }
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                {t('height_unit')}
              </span>
            </div>
          </div>

        </div>

        {/* Waist */}
        <div>
          <label className={labelStyles}>
            {t('waist')}
          </label>

          <div className="relative">
            <input
              type="number"
              className={inputStyles}
              placeholder="80"
              value={data.waist || ''}
              onChange={(e) =>
                onChange({ waist: e.target.value })
              }
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
              {t('waist_unit')}
            </span>
          </div>
        </div>
      </div>

      {/* BMI Result */}
      {bmi && (
        <div
          className={`mt-2 flex items-center justify-between border rounded-2xl p-4 transition-all duration-300 ${bmiStyle}`}
        >
          <div className="flex flex-col">

            <span className="text-xs font-extrabold uppercase tracking-wider opacity-80 mb-0.5">
              {t('calculated_bmi', 'Calculated BMI')}
            </span>

            <span className="text-2xl font-black">
              {bmi}
            </span>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold tracking-wide px-3 py-1 bg-white/40 rounded-lg">
              {bmiLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}