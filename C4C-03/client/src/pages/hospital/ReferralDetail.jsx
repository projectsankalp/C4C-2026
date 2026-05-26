import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import ReferralCard from '../../components/referral/ReferralCard';
import RiskBadge from '../../components/dashboard/RiskBadge';
import ScoreBreakdown from '../../components/dashboard/ScoreBreakdown';
import { getReferrals } from '../../services/referralService';
import {
  createClassification,
  suggestClassification,
  getByScreening,
} from '../../services/diabetesService';

// ─────────────────────────────────────────────────────────────────────────────
// TYPE METADATA
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_META = {
  type1: {
    label: 'Type 1 Diabetes',
    short: 'T1D',
    color: 'bg-red-50 border-red-300 text-red-800',
    badge: 'bg-red-100 text-red-700',
    icon: '',
    description: 'Autoimmune — absolute insulin deficiency. Requires lifelong insulin therapy.',
  },
  type2: {
    label: 'Type 2 Diabetes',
    short: 'T2D',
    color: 'bg-orange-50 border-orange-300 text-orange-800',
    badge: 'bg-orange-100 text-orange-700',
    icon: '',
    description: 'Insulin resistance — managed with lifestyle, oral agents, and possibly insulin.',
  },
  gestational: {
    label: 'Gestational Diabetes',
    short: 'GDM',
    color: 'bg-pink-50 border-pink-300 text-pink-800',
    badge: 'bg-pink-100 text-pink-700',
    icon: '',
    description: 'Diagnosed during pregnancy. Needs immediate obstetric co-management.',
  },
  unclassified: {
    label: 'Unclassified',
    short: '?',
    color: 'bg-gray-50 border-gray-300 text-gray-700',
    badge: 'bg-gray-100 text-gray-600',
    icon: '',
    description: 'Insufficient data for definitive classification. Further workup required.',
  },
  mody: {
    label: 'MODY (Monogenic)',
    short: 'MODY',
    color: 'bg-purple-50 border-purple-300 text-purple-800',
    badge: 'bg-purple-100 text-purple-700',
    icon: '',
    description: 'Rare monogenic form. Consider genetic testing. Refer to specialist.',
  },
  secondary: {
    label: 'Secondary Diabetes',
    short: 'S-DM',
    color: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: '',
    description: 'Due to another condition (pancreatitis, steroids, Cushing\'s). Treat primary cause.',
  },
};

const CONFIDENCE_LABEL = (c) =>
  c >= 80 ? { text: 'High confidence', color: 'text-green-600' }
  : c >= 60 ? { text: 'Moderate confidence', color: 'text-yellow-600' }
  : { text: 'Low confidence — clinical judgment required', color: 'text-red-600' };

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ReferralDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [referral, setReferral] = useState(null);
  const [existingClassification, setExistingClassification] = useState(null);
  const [loadError, setLoadError] = useState('');

  // Form state
  const [showClassifyForm, setShowClassifyForm] = useState(false);
  const [labs, setLabs] = useState({
    fastingGlucose: '',
    postprandialGlucose: '',
    hba1c: '',
    cPeptide: '',
    gad65Positive: false,
    ia2Positive: false,
    znt8Positive: false,
  });
  const [clinical, setClinical] = useState({
    ageAtOnset: '',
    bmiAtClassification: '',
    ketosisAtPresentation: false,
    acanthosisNigricans: false,
    pcosHistory: false,
    rapidWeightLoss: false,
    insulinRequiredFromOnset: false,
    familyHistoryT2: false,
    currentlyPregnant: false,
  });
  const [manualOverride, setManualOverride] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Suggestion state (live as form changes)
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);

  // Submission state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Load referral ──────────────────────────────────────────────────────────
  useEffect(() => {
    setLoadError('');
    getReferrals()
      .then(r => {
        const found = r.data.find(ref => ref._id === id);
        if (!found) { setLoadError('Referral not found.'); return; }
        setReferral(found);

        // Pre-fill age and BMI from screening data
        if (found.screeningId) {
          const s = found.screeningId;
          setClinical(prev => ({
            ...prev,
            bmiAtClassification: s.vitals?.bmi ?? '',
          }));
        }
        if (found.patientId?.age) {
          setClinical(prev => ({ ...prev, ageAtOnset: found.patientId.age }));
        }

        // Load existing classification if any
        if (found.screeningId?._id) {
          return getByScreening(found.screeningId._id)
            .then(cr => { if (cr.data) setExistingClassification(cr.data); })
            .catch(() => {});
        }
      })
      .catch(err => {
        console.error(err);
        setLoadError('Failed to load referral. Please refresh.');
      });
  }, [id]);

  // ── Live auto-suggest (debounced) ─────────────────────────────────────────
  const runSuggest = useCallback(
    debounce(async (labsData, clinicalData) => {
      setSuggesting(true);
      try {
        const res = await suggestClassification({ labs: labsData, clinical: clinicalData });
        setSuggestion(res.data);
      } catch { /* ignore */ } finally {
        setSuggesting(false);
      }
    }, 600),
    []
  );

  useEffect(() => {
    if (!showClassifyForm) return;
    runSuggest(labs, clinical);
  }, [labs, clinical, showClassifyForm]);

  // ── Save classification ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!referral) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await createClassification({
        patientId: referral.patientId?._id,
        screeningId: referral.screeningId?._id,
        referralId: referral._id,
        labs: {
          ...labs,
          fastingGlucose:      toNum(labs.fastingGlucose),
          postprandialGlucose: toNum(labs.postprandialGlucose),
          hba1c:               toNum(labs.hba1c),
          cPeptide:            toNum(labs.cPeptide),
        },
        clinical: {
          ...clinical,
          ageAtOnset:           toNum(clinical.ageAtOnset),
          bmiAtClassification:  toNum(clinical.bmiAtClassification),
        },
        diabetesType: manualOverride || undefined,
        clinicalNotes,
      });
      setExistingClassification(res.data.classification);
      setShowClassifyForm(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save classification.');
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

  const bloodSugar = referral?.screeningId?.phcTest?.bloodGlucose
    ?? referral?.screeningId?.vitals?.bloodSugar
    ?? null;

  const glucoseResult = referral?.screeningId?.phcTest?.glucoseResult ?? null;
  const isDiabeticOrPre = glucoseResult === 'diabetic' || glucoseResult === 'prediabetic' || bloodSugar >= 140;

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {loadError}
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading...
      </div>
    );
  }

  const patient  = referral.patientId;
  const screening = referral.screeningId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 space-y-5 max-w-5xl">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/hospital')}
              className="text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold">Referral Detail</h1>
            {screening?.result?.riskLevel && (
              <RiskBadge level={screening.result.riskLevel} size="lg" />
            )}
          </div>

          {/* ── Blood Sugar Summary Banner ──────────────────────────────────── */}
          {bloodSugar !== null && (
            <div className={`rounded-xl border-2 p-4 flex items-center justify-between ${
              glucoseResult === 'diabetic' || bloodSugar >= 200
                ? 'bg-red-50 border-red-300'
                : glucoseResult === 'prediabetic' || bloodSugar >= 140
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-green-50 border-green-300'
            }`}>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Blood Sugar — {screening?.phcTest ? `PHC-confirmed (${screening.phcTest.testType})` : 'ASHA screening'}
                </p>
                <p className={`text-3xl font-black ${
                  bloodSugar >= 200 ? 'text-red-700' : bloodSugar >= 140 ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  {bloodSugar} mg/dL
                </p>
                {glucoseResult && (
                  <span className={`mt-1 inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                    glucoseResult === 'diabetic'
                      ? 'bg-red-100 text-red-700'
                      : glucoseResult === 'prediabetic'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {glucoseResult.charAt(0).toUpperCase() + glucoseResult.slice(1)}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">BP</p>
                <p className={`text-xl font-bold ${
                  (screening?.vitals?.systolic ?? 0) >= 140 ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {screening?.vitals?.systolic}/{screening?.vitals?.diastolic} mmHg
                </p>
                <p className="text-xs text-gray-500 mt-1">BMI: {screening?.vitals?.bmi || '—'}</p>
              </div>
            </div>
          )}

          {/* ── Main grid ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ReferralCard referral={referral} />

            {screening?.result && (
              <div className="card">
                <h3 className="font-bold text-gray-700 mb-4">Risk Analysis</h3>
                <ScoreBreakdown result={screening.result} />
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium text-gray-700">ASHA Recommendations:</p>
                  {screening.result.recommendations?.en?.map((rec, i) => (
                    <p key={i} className="text-xs text-gray-600">→ {rec}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Existing classification card ──────────────────────────────── */}
          {existingClassification && (
            <ExistingClassificationCard
              classification={existingClassification}
              onEdit={() => setShowClassifyForm(true)}
            />
          )}

          {/* ── Diabetes classification section ───────────────────────────── */}
          {isDiabeticOrPre && !existingClassification && !showClassifyForm && (
            <div className="card border-2 border-purple-200 bg-purple-50">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-purple-800 text-lg">
                    Diabetes Classification Required
                  </h3>
                  <p className="text-sm text-purple-600 mt-1">
                    This patient's blood glucose indicates diabetes or pre-diabetes.
                    Complete the CHC-level assessment to classify as Type 1 or Type 2
                    and generate a treatment plan.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClassifyForm(true)}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Start Diabetes Classification Assessment
              </button>
            </div>
          )}

          {/* ── Classification form ─────────────────────────────────────────── */}
          {showClassifyForm && (
            <ClassificationForm
              labs={labs}
              setLabs={setLabs}
              clinical={clinical}
              setClinical={setClinical}
              suggestion={suggestion}
              suggesting={suggesting}
              manualOverride={manualOverride}
              setManualOverride={setManualOverride}
              clinicalNotes={clinicalNotes}
              setClinicalNotes={setClinicalNotes}
              onSave={handleSave}
              onCancel={() => setShowClassifyForm(false)}
              saving={saving}
              saveError={saveError}
              existingClassification={existingClassification}
            />
          )}

        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ExistingClassificationCard
// ─────────────────────────────────────────────────────────────────────────────
function ExistingClassificationCard({ classification, onEdit }) {
  const meta = TYPE_META[classification.diabetesType] || TYPE_META['unclassified'];
  const conf = CONFIDENCE_LABEL(classification.classificationConfidence);
  const plan = classification.treatmentPlan;

  return (
    <div className={`rounded-xl border-2 p-5 space-y-4 ${meta.color}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{meta.icon}</span>
          <div>
            <p className="text-xs font-medium opacity-70 uppercase tracking-wide">
              Diabetes Classification
            </p>
            <h3 className="text-2xl font-black">{meta.label}</h3>
            <p className="text-xs mt-0.5">{meta.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium opacity-60 mb-1">Confidence</div>
          <div className="text-2xl font-black">{classification.classificationConfidence}%</div>
          <div className={`text-xs ${conf.color}`}>{conf.text}</div>
        </div>
      </div>

      {/* Flags */}
      {classification.classificationFlags?.length > 0 && (
        <div>
          <p className="text-xs font-bold mb-2 uppercase tracking-wide opacity-70">
            Supporting Evidence
          </p>
          <div className="flex flex-wrap gap-2">
            {classification.classificationFlags.map((f, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-white/60 rounded-full border border-current/20">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Treatment plan */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.medications?.length > 0 && (
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-xs font-bold mb-2">💊 Medications</p>
              <ul className="space-y-1">
                {plan.medications.map((m, i) => (
                  <li key={i} className="text-xs">→ {m}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.dietaryAdvice?.length > 0 && (
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-xs font-bold mb-2">🥗 Diet</p>
              <ul className="space-y-1">
                {plan.dietaryAdvice.slice(0, 3).map((d, i) => (
                  <li key={i} className="text-xs">→ {d}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.lifestyleAdvice?.length > 0 && (
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-xs font-bold mb-2">🏃 Lifestyle</p>
              <ul className="space-y-1">
                {plan.lifestyleAdvice.slice(0, 3).map((l, i) => (
                  <li key={i} className="text-xs">→ {l}</li>
                ))}
              </ul>
            </div>
          )}
          {plan.monitoringSchedule && (
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-xs font-bold mb-2">📅 Monitoring</p>
              <p className="text-xs">{plan.monitoringSchedule}</p>
              <p className="text-xs mt-2 font-medium">
                Follow-up in {plan.followUpWeeks} week(s)
                {plan.referToSpecialist && ` • Refer to ${plan.specialistType}`}
              </p>
            </div>
          )}
        </div>
      )}

      {classification.clinicalNotes && (
        <div className="bg-white/60 rounded-xl p-3">
          <p className="text-xs font-bold mb-1">📋 Clinical Notes</p>
          <p className="text-xs">{classification.clinicalNotes}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs opacity-60">
          Classified by {classification.classifiedBy?.name} •{' '}
          {new Date(classification.createdAt).toLocaleDateString('en-IN')}
        </p>
        <button
          onClick={onEdit}
          className="text-xs underline opacity-70 hover:opacity-100"
        >
          Edit classification
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ClassificationForm
// ─────────────────────────────────────────────────────────────────────────────
function ClassificationForm({
  labs, setLabs, clinical, setClinical,
  suggestion, suggesting,
  manualOverride, setManualOverride,
  clinicalNotes, setClinicalNotes,
  onSave, onCancel,
  saving, saveError,
  existingClassification,
}) {
  const sugMeta = suggestion ? TYPE_META[suggestion.diabetesType] : null;
  const conf    = suggestion ? CONFIDENCE_LABEL(suggestion.classificationConfidence) : null;

  const labChange = (field, val) => setLabs(prev => ({ ...prev, [field]: val }));
  const clinChange = (field, val) => setClinical(prev => ({ ...prev, [field]: val }));

  return (
    <div className="card border-2 border-purple-200 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-purple-800 text-lg">
          Diabetes Classification Assessment
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
          &times;
        </button>
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        Enter all available lab and clinical data. The system will auto-suggest a classification
        using WHO (2019) and ADA (2024) criteria. You can review and override the suggestion before saving.
      </p>

      {/* ── Lab Values ────────────────────────────────────────────────── */}
      <section>
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          Laboratory Values (at CHC)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'fastingGlucose',      label: 'Fasting Glucose',      unit: 'mg/dL', note: '≥126 = diabetic' },
            { key: 'postprandialGlucose', label: 'Post-prandial Glucose', unit: 'mg/dL', note: '≥200 = diabetic' },
            { key: 'hba1c',               label: 'HbA1c',                unit: '%',     note: '≥6.5% = diabetic' },
            { key: 'cPeptide',            label: 'C-Peptide',            unit: 'ng/mL', note: 'Low → T1, High → T2' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field pr-14 text-sm"
                  placeholder="—"
                  value={labs[f.key]}
                  onChange={e => labChange(f.key, e.target.value)}
                />
                <span className="absolute right-2 top-2 text-gray-400 text-xs">{f.unit}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{f.note}</p>
            </div>
          ))}
        </div>

        {/* Autoantibodies */}
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Autoantibody Panel{' '}
            <span className="text-gray-400 font-normal">(positive → strongly suggests Type 1)</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'gad65Positive', label: 'GAD65 Antibody' },
              { key: 'ia2Positive',   label: 'IA-2 Antibody' },
              { key: 'znt8Positive',  label: 'ZnT8 Antibody' },
            ].map(ab => (
              <label key={ab.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={labs[ab.key]}
                  onChange={e => labChange(ab.key, e.target.checked)}
                  className="w-4 h-4 accent-red-600"
                />
                <span className={`text-sm font-medium ${labs[ab.key] ? 'text-red-600' : 'text-gray-600'}`}>
                  {ab.label}
                </span>
                {labs[ab.key] && (
                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                    Positive
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clinical Indicators ───────────────────────────────────────── */}
      <section>
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          🩺 Clinical Indicators
        </h4>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Age at Diagnosis</label>
            <div className="relative">
              <input
                type="number"
                className="input-field pr-12 text-sm"
                placeholder="e.g. 45"
                value={clinical.ageAtOnset}
                onChange={e => clinChange('ageAtOnset', e.target.value)}
              />
              <span className="absolute right-2 top-2 text-gray-400 text-xs">yrs</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">BMI</label>
            <div className="relative">
              <input
                type="number"
                className="input-field pr-16 text-sm"
                placeholder="e.g. 27.4"
                value={clinical.bmiAtClassification}
                onChange={e => clinChange('bmiAtClassification', e.target.value)}
              />
              <span className="absolute right-2 top-2 text-gray-400 text-xs">kg/m²</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { key: 'ketosisAtPresentation',    label: 'Ketosis / DKA at presentation',          note: 'Strong T1 indicator', t1: true },
            { key: 'insulinRequiredFromOnset', label: 'Insulin required from onset',             note: 'T1 indicator', t1: true },
            { key: 'rapidWeightLoss',          label: 'Rapid unexplained weight loss',           note: 'T1 indicator', t1: true },
            { key: 'acanthosisNigricans',      label: 'Acanthosis nigricans present',            note: 'Insulin resistance / T2 indicator', t1: false },
            { key: 'familyHistoryT2',          label: 'First-degree family history of T2DM',    note: 'T2 indicator', t1: false },
            { key: 'pcosHistory',              label: 'PMOS history',                           note: 'Insulin resistance / T2', t1: false },
            { key: 'currentlyPregnant',        label: 'Currently pregnant',                     note: '→ Gestational diabetes', t1: false },
          ].map(item => (
            <label
              key={item.key}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                clinical[item.key]
                  ? item.t1
                    ? 'bg-red-50 border-red-300'
                    : 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={clinical[item.key]}
                onChange={e => clinChange(item.key, e.target.checked)}
                className="mt-0.5 w-4 h-4"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
                <p className={`text-xs ${clinical[item.key] ? (item.t1 ? 'text-red-600' : 'text-blue-600') : 'text-gray-400'}`}>
                  {item.note}
                </p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* ── Live suggestion ──────────────────────────────────────────────── */}
      {(suggestion || suggesting) && (
        <section className={`rounded-xl border-2 p-4 ${sugMeta?.color || 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
              Auto-Classification Suggestion
              {suggesting && <span className="ml-2 opacity-50">(updating…)</span>}
            </p>
            {suggestion && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${sugMeta?.badge}`}>
                {conf?.text}
              </span>
            )}
          </div>

          {suggestion && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{sugMeta?.icon}</span>
                <div>
                  <p className="text-xl font-black">{sugMeta?.label}</p>
                  <p className="text-sm opacity-70">{sugMeta?.description}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-3xl font-black">{suggestion.classificationConfidence}%</p>
                  <p className="text-xs opacity-60">confidence</p>
                </div>
              </div>

              {suggestion.flags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {suggestion.flags.map((f, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-white/60 rounded-full border border-current/20">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Manual override ──────────────────────────────────────────────── */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Doctor Classification Override
          <span className="text-xs text-gray-400 font-normal ml-2">
            (leave blank to use auto-suggestion)
          </span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {['', 'type1', 'type2', 'gestational', 'mody', 'secondary', 'unclassified'].map(t => {
            const meta = t ? TYPE_META[t] : null;
            return (
              <button
                key={t || 'auto'}
                type="button"
                onClick={() => setManualOverride(t)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${
                  manualOverride === t
                    ? t === '' ? 'bg-gray-800 text-white border-gray-800' : `${meta?.color} border-current`
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                }`}
              >
                {t === '' ? 'Auto' : `${meta?.icon} ${meta?.short}`}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Clinical notes ───────────────────────────────────────────────── */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Clinical Notes
        </label>
        <textarea
          className="input-field h-24 resize-none text-sm"
          placeholder="Treatment observations, special instructions, follow-up notes..."
          value={clinicalNotes}
          onChange={e => setClinicalNotes(e.target.value)}
        />
      </section>

      {saveError && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{saveError}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving
            ? 'Saving...'
            : existingClassification
            ? '✅ Update Classification'
            : '✅ Confirm & Save Classification'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// debounce helper
// ─────────────────────────────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
