import { useState, useEffect } from 'react';
import { recordPHCTest } from '../../services/screeningService';

const THRESHOLDS = {
  fasting:      { normal: 100, diabetic: 126 },
  random:       { normal: 140, diabetic: 200 },
  postprandial: { normal: 140, diabetic: 200 }
};

const RESULT_CONFIG = {
  normal: {
    color:   'bg-emerald-50 border-emerald-200 text-emerald-800',
    badge:   'bg-emerald-100 text-emerald-700 border border-emerald-200',
    icon:    '✅',
    label:   'Normal',
    outcome: 'Manage at PHC — no referral needed'
  },
  prediabetic: {
    color:   'bg-amber-50 border-amber-200 text-amber-800',
    badge:   'bg-amber-100 text-amber-700 border border-amber-200',
    icon:    '⚠️',
    label:   'Pre-diabetic',
    outcome: 'Lifestyle intervention required — refer to CHC if no improvement'
  },
  diabetic: {
    color:   'bg-rose-50 border-rose-200 text-rose-800',
    badge:   'bg-rose-100 text-rose-700 border border-rose-200',
    icon:    '🔴',
    label:   'Diabetic',
    outcome: 'Refer to CHC immediately for classification and treatment'
  }
};

export default function PHCBloodGlucoseTest({ screening, onTestComplete, onReferToCHC }) {
  const [form, setForm]     = useState({ bloodGlucose: '', testType: 'fasting', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [result, setResult] = useState(null);

  // Sync result whenever the screening prop changes
  useEffect(() => {
    const existing = screening?.phcTest;
    if (existing?.glucoseResult && RESULT_CONFIG[existing.glucoseResult]) {
      setResult(existing);
    } else {
      setResult(null);
    }
  }, [screening]);

  const thresholds = THRESHOLDS[form.testType];

  const handleSubmit = async () => {
    if (!form.bloodGlucose) { setError('Enter a blood glucose value'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await recordPHCTest(screening._id, form);
      const phcTest = res.data.screening.phcTest;
      if (phcTest?.glucoseResult && RESULT_CONFIG[phcTest.glucoseResult]) {
        setResult(phcTest);
      }
      onTestComplete?.(res.data.screening);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save test result');
    } finally {
      setSaving(false);
    }
  };

  const cfg = (result && RESULT_CONFIG[result.glucoseResult]) || null;

  // Reusable modern input styles
  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium";
  const labelStyles = "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <span>🩸</span> PHC Blood Glucose Test
        </h3>
        {result && cfg && (
          <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-extrabold shadow-sm ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
        )}
      </div>

      {/* ── Test not yet done ── */}
      {!result && (
        <div className="space-y-5">
          <p className="text-sm font-medium text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            Record the blood glucose test performed at PHC for this high-risk patient.
          </p>

          {/* Test Type Segmented Control */}
          <div>
            <label className={labelStyles}>Test Type</label>
            <div className="flex bg-slate-100 p-1.5 rounded-[1.25rem] border border-slate-200/60">
              {['fasting', 'random', 'postprandial'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, testType: t }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all duration-200 ${
                    form.testType === t
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {t === 'postprandial' ? 'PP' : t}
                </button>
              ))}
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-2 ml-1 uppercase tracking-wider">
              {form.testType === 'fasting'
                ? 'Fasting: Normal <100 • Pre 100–125 • Dia ≥126'
                : 'Random/PP: Normal <140 • Pre 140–199 • Dia ≥200'}
            </p>
          </div>

          {/* Value Input */}
          <div>
            <label className={labelStyles}>
              Blood Glucose Value
            </label>
            <div className="relative">
              <input
                type="number"
                className={`${inputStyles} pr-16 text-lg font-bold text-blue-900`}
                placeholder="e.g. 118"
                value={form.bloodGlucose}
                onChange={e => setForm(f => ({ ...f, bloodGlucose: e.target.value }))}
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm pointer-events-none">
                mg/dL
              </span>
            </div>

            {/* Live threshold indicator */}
            {form.bloodGlucose && (
              <div className={`mt-3 text-xs font-bold px-4 py-2.5 rounded-xl border flex items-center gap-2 animate-in slide-in-from-top-1 duration-200 ${
                Number(form.bloodGlucose) < thresholds.normal
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : Number(form.bloodGlucose) < thresholds.diabetic
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {Number(form.bloodGlucose) < thresholds.normal
                  ? '✅ Within normal range'
                  : Number(form.bloodGlucose) < thresholds.diabetic
                  ? '⚠️ Pre-diabetic range'
                  : '🔴 Diabetic range — CHC referral needed'}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className={labelStyles}>
              Doctor Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              className={`${inputStyles} h-24 resize-none`}
              placeholder="Any clinical observations..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm font-semibold animate-in fade-in">
              <span className="mt-0.5">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving || !form.bloodGlucose}
            className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
              saving || !form.bloodGlucose
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]'
            }`}
          >
            {saving ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <span>Saving Record...</span>
               </>
            ) : (
              <>
                <span>💉 Record Blood Glucose Test</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Test result card ── */}
      {result && cfg && (
        <div className={`rounded-[1.5rem] border-2 p-5 space-y-4 animate-in zoom-in-95 duration-300 ${cfg.color}`}>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1 flex items-center gap-1.5">
                <span className="capitalize">{result.testType}</span> Blood Glucose
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black tracking-tight">{result.bloodGlucose}</p>
                <span className="text-sm font-bold opacity-70">mg/dL</span>
              </div>
            </div>
            <div className="text-5xl drop-shadow-sm">{cfg.icon}</div>
          </div>

          {result.testedAt && (
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest border-b border-current/10 pb-3">
              Tested on {new Date(result.testedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          )}

          <div className="bg-white/60 rounded-xl p-3.5 text-sm font-bold flex items-start gap-2 shadow-sm border border-white/50">
            <span className="mt-0.5">📋</span>
            <span className="leading-snug">{cfg.outcome}</span>
          </div>

          {/* Ayurvedic recommendations */}
          {result.ayurvedicRecommendations?.length > 0 && (
            <div className="bg-white/40 rounded-xl p-4 border border-white/50">
              <p className="text-xs font-extrabold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span>🌿</span> Ayurvedic Recommendations
              </p>
              <ul className="space-y-1.5">
                {result.ayurvedicRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm font-semibold">
                    <span className="flex-shrink-0 font-bold opacity-50 mt-0.5">•</span>
                    <span className="leading-snug">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.notes && (
            <div className="bg-white/40 rounded-xl p-4 border border-white/50">
              <p className="text-xs font-extrabold uppercase tracking-wider mb-1 opacity-70">Doctor Notes</p>
              <p className="text-sm font-semibold leading-relaxed">{result.notes}</p>
            </div>
          )}

          {/* CHC referral button — only when outcome is refer_to_chc */}
          {result.outcome === 'refer_to_chc' && (
            <button
              onClick={onReferToCHC}
              className="w-full mt-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="text-lg">🏥</span>
              <span>Refer to CHC for Classification</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}