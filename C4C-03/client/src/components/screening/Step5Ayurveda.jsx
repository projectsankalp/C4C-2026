import { useTranslation } from 'react-i18next';
import {
  Droplets,
  Flame,
  Hand,
  BatteryLow,
  Moon,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function Step5Ayurveda({ data, onChange }) {
  const { t } = useTranslation();

  const ayurvedicSymptoms = [
    {
      key: 'urinaryAbnormalities',
      label: 'Excessive, turbid, or frequent urination',
      icon: Droplets,
      sanskrit: 'Prabhuta Mutrata / Prameha (Charaka Nidana 4/6)'
    },
    {
      key: 'frequentThirst',
      label: 'Persistent thirst and dry mouth',
      icon: Droplets,
      sanskrit: 'Trishna / Mukha-Talu-Kantha Shosha (Charaka Nidana 4/47)'
    },
    {
      key: 'bodyHeat',
      label: 'Burning sensation in palms and soles',
      icon: Flame,
      sanskrit: 'Kara-Pada Daha (Charaka Nidana 4/47)'
    },
    {
      key: 'skinDryness',
      label: 'Skin stickiness or abnormal oiliness',
      icon: Hand,
      sanskrit: 'Anga Upadeha / Snigdhata (Charaka Nidana 4/47)'
    },
    {
      key: 'fatigue',
      label: 'Unexplained fatigue and heaviness',
      icon: BatteryLow,
      sanskrit: 'Daurbalya / Anga Shaithilya (Charaka Nidana 4/47)'
    },
    {
      key: 'digestiveIssues',
      label: 'Digestive weakness or irregular appetite',
      icon: Stethoscope,
      sanskrit: 'Agnimandya — impaired digestive fire'
    },
    {
      key: 'sleepDisturbances',
      label: 'Drowsiness or excessive sleep tendency',
      icon: Moon,
      sanskrit: 'Alasya / Tandra (Charaka Nidana 4)'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Header */}
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">

        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <Activity className="w-5 h-5" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {t('ayurvedic_assessment', 'Ayurvedic Assessment')}
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed mt-1">
            Classical premonitory symptoms (Purvarupa) of Prameha based on
            Charaka Samhita Nidanasthana and Ashtanga Hridaya. These help
            detect early metabolic risk before lab abnormalities appear.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">

        <Activity className="w-5 h-5 text-emerald-600 mt-0.5" />

        <p className="text-sm text-emerald-800 font-medium">
          {t(
            'ayurveda_info',
            'These indicators help identify early metabolic imbalance before clinical diagnosis.'
          )}
        </p>

      </div>

      {/* Symptom List */}
      <div className="space-y-4">

        {ayurvedicSymptoms.map((s) => {
          const isYes = data[s.key] === true;
          const isNo = data[s.key] === false;

          const Icon = s.icon;

          let cardStyle = 'bg-white border-slate-200';
          let textStyle = 'text-slate-700';
          let sanskritStyle = 'text-slate-400';
          let iconStyle = 'bg-slate-50 border-slate-200 text-slate-500';

          if (isYes) {
            cardStyle = 'bg-rose-50 border-rose-200';
            textStyle = 'text-rose-900';
            sanskritStyle = 'text-rose-600/70';
            iconStyle = 'bg-rose-100 border-rose-200 text-rose-600';
          } else if (isNo) {
            cardStyle = 'bg-emerald-50 border-emerald-200';
            textStyle = 'text-emerald-900';
            sanskritStyle = 'text-emerald-600/70';
            iconStyle = 'bg-emerald-100 border-emerald-200 text-emerald-600';
          }

          return (
            <div
              key={s.key}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${cardStyle}`}
            >

              {/* Left */}
              <div className="flex items-start gap-4">

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconStyle}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div>
                  <p className={`font-semibold text-sm ${textStyle}`}>
                    {s.label}
                  </p>

                  <p className={`text-xs italic mt-1 ${sanskritStyle}`}>
                    {s.sanskrit}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">

                <button
                  type="button"
                  onClick={() => onChange({ [s.key]: true })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isYes
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t('yes')}
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ [s.key]: false })}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isNo
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-600 hover:bg-slate-200'
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