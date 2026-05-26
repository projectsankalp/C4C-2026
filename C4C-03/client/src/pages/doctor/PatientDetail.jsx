import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';

import RiskBadge from '../../components/dashboard/RiskBadge';
import ScoreBreakdown from '../../components/dashboard/ScoreBreakdown';
import DoctorNotes from '../../components/dashboard/DoctorNotes';
import PHCBloodGlucoseTest from '../../components/dashboard/PHCBloodGlucoseTest';

import Modal from '../../components/shared/Modal';

import { getPatient } from '../../services/patientService';
import { getScreenings } from '../../services/screeningService';
import { getAlerts } from '../../services/alertService';
import { createReferral } from '../../services/referralService';

import { formatDateTime } from '../../utils/formatDate';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient]     = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [alertItem, setAlertItem] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const [referralModal, setReferralModal] = useState(false);

  const [referralForm, setReferralForm] = useState({
    referredToName: 'District Hospital, Mangaluru',
    referredToEmail: '',
    reason: ''
  });

  const [sending, setSending] = useState(false);

  // Reusable input styles for the modal
  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium";
  const labelStyles = "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  useEffect(() => {
    setLoadError('');
    setLoading(true);
    Promise.all([
      getPatient(id),
      getScreenings({ patientId: id }),
      getAlerts({ patientId: id })
    ])
      .then(([p, s, a]) => {
        setPatient(p.data);
        setScreenings(Array.isArray(s.data) ? s.data : []);

        const alerts = Array.isArray(a.data) ? a.data : [];
        setAlertItem(
          alerts.find(
            al => al.patientId?._id === id || al.patientId === id
          ) ?? null
        );
      })
      .catch(err => {
        console.error(err);
        setLoadError('Failed to load patient data. Please refresh.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const sendReferral = async () => {
    if (!referralForm.referredToName || !referralForm.reason) return;

    setSending(true);
    try {
      await createReferral({
        patientId: id,
        screeningId: screenings[0]?._id,
        ...referralForm
      });

      setReferralModal(false);

      if (alertItem) {
        setAlertItem(prev => ({ ...prev, status: 'actioned' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleTestComplete = updatedScreening => {
    setScreenings(prev =>
      prev.map(s => s._id === updatedScreening._id ? updatedScreening : s)
    );
  };

  const handleReferToCHC = () => {
    const latest    = screenings[0];
    const glucose   = latest?.phcTest?.bloodGlucose || '';
    const testType  = latest?.phcTest?.testType || 'fasting';

    setReferralForm({
      referredToName: 'Community Health Centre (CHC)',
      referredToEmail: '',
      reason: `Confirmed high blood glucose at PHC: ${glucose} mg/dL (${testType}). Patient requires Type 1 / Type 2 diabetes classification and treatment plan.`
    });

    setReferralModal(true);
  };

  // Error State
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-sans">
        <div className="bg-white rounded-[2rem] p-8 max-w-md text-center shadow-sm border border-slate-100">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-extrabold text-slate-800 mt-4 mb-2">Connection Error</h2>
          <p className="text-slate-500 font-medium mb-6">{loadError}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const latest = screenings?.[0];

  const bloodSugarDisplay = () => {
    if (latest?.phcTest?.bloodGlucose) {
      return `${latest.phcTest.bloodGlucose} mg/dL (${latest.phcTest.testType})`;
    }
    return '— Pending PHC test';
  };

  const bloodSugarHigh = Number(latest?.phcTest?.bloodGlucose) >= 140;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto w-full max-w-6xl mx-auto space-y-6">

          {loading ? (
            // ================= SKELETON LOADER =================
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="w-48 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="w-32 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="h-64 bg-white border border-slate-100 rounded-[1.5rem] animate-pulse"></div>
                <div className="h-64 bg-white border border-slate-100 rounded-[1.5rem] animate-pulse"></div>
                <div className="h-48 bg-white border border-slate-100 rounded-[1.5rem] animate-pulse md:col-span-2"></div>
              </div>
            </div>
          ) : (
            // ================= LOADED CONTENT =================
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition-all shadow-sm shrink-0"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                    {patient.name}
                    {latest && <RiskBadge level={latest?.result?.riskLevel} />}
                  </h1>
                </div>

                <button
                  onClick={() => {
                    setReferralForm({
                      referredToName: 'District Hospital, Mangaluru',
                      referredToEmail: '',
                      reason: ''
                    });
                    setReferralModal(true);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:from-rose-600 hover:to-red-700 active:scale-95 transition-all"
                >
                  <span className="text-lg">📋</span>
                  Refer to Hospital
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">

                {/* Patient Info Card */}
                <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                  <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <span>👤</span> Patient Details
                  </h3>
                  <div className="space-y-3">
                    {[
                      ['Age',    `${patient.age} years`],
                      ['Gender', patient.gender],
                      ['Village',patient.village],
                      ['Phone',  patient.phone || '—']
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center py-1">
                        <span className="text-sm font-semibold text-slate-500">{label}</span>
                        <span className="text-sm font-extrabold text-slate-800 capitalize bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest Vitals Card */}
                {latest && (
                  <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                        <span>🩺</span> Latest Vitals
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {formatDateTime(latest.createdAt)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        ['Blood Pressure', `${latest?.vitals?.systolic || '-'} / ${latest?.vitals?.diastolic || '-'} mmHg`, latest?.vitals?.systolic >= 140],
                        ['Blood Sugar',    bloodSugarDisplay(), bloodSugarHigh],
                        ['BMI',            latest?.vitals?.bmi || '—', latest?.vitals?.bmi >= 25],
                        ['Waist',          `${latest?.vitals?.waist || '—'} cm`, false]
                      ].map(([label, value, flag]) => (
                        <div key={label} className="flex justify-between items-center py-1">
                          <span className="text-sm font-semibold text-slate-500">{label}</span>
                          <span className={`text-sm font-extrabold px-3 py-1 rounded-lg border ${
                            flag 
                              ? 'text-rose-700 bg-rose-50 border-rose-100' 
                              : 'text-slate-800 bg-slate-50 border-slate-100'
                          }`}>
                            {value}
                          </span>
                        </div>
                      ))}

                      {/* PHC result badge */}
                      {latest?.phcTest?.glucoseResult && (
                        <div className={`mt-4 w-full text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border ${
                          latest.phcTest.glucoseResult === 'normal'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : latest.phcTest.glucoseResult === 'prediabetic'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          <span>🔬</span>
                          PHC Test: {latest.phcTest.glucoseResult.charAt(0).toUpperCase() + latest.phcTest.glucoseResult.slice(1)}
                          {latest.phcTest.outcome === 'refer_to_chc'
                            ? ' — CHC Referral Required'
                            : ' — Manage at PHC'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Analysis Card */}
                {latest?.result && (
                  <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100 h-full">
                    <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                      <span>📊</span> Risk Analysis
                    </h3>
                    <ScoreBreakdown result={latest.result} />
                  </div>
                )}

                {/* Doctor Notes Card */}
                {alertItem && (
                  <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100 h-full">
                    <h3 className="font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                      <span>📝</span> Doctor Notes & Status
                    </h3>
                    <DoctorNotes alert={alertItem} onUpdate={setAlertItem} />
                  </div>
                )}
              </div>

              {/* PHC Blood Glucose Test */}
              {latest && (
                <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                  <PHCBloodGlucoseTest
                    screening={latest}
                    onTestComplete={handleTestComplete}
                    onReferToCHC={handleReferToCHC}
                  />
                </div>
              )}

              {/* Screening History */}
              <div className="bg-white rounded-[1.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                    <span>🕒</span> Screening History
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {screenings.length} Records
                  </span>
                </div>

                <div className="space-y-3">
                  {screenings.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
                      <p className="text-sm font-medium text-slate-400">No screenings recorded yet.</p>
                    </div>
                  )}

                  {screenings.map(s => (
                    <div
                      key={s._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700">{formatDateTime(s.createdAt)}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                            BP {s?.vitals?.systolic}/{s?.vitals?.diastolic}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                            {s?.phcTest?.bloodGlucose ? `Sugar ${s.phcTest.bloodGlucose} (PHC)` : 'Sugar Pending'}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                            Score {s?.result?.score}/20
                          </span>
                        </div>

                        {s?.phcTest?.glucoseResult && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${
                              s.phcTest.glucoseResult === 'normal' ? 'bg-emerald-500'
                              : s.phcTest.glucoseResult === 'prediabetic' ? 'bg-amber-500'
                              : 'bg-rose-500'
                            }`}></span>
                            <p className="text-xs font-bold text-slate-600">
                              PHC: <span className="capitalize">{s.phcTest.glucoseResult}</span>
                              <span className="font-medium text-slate-400">
                                {s.phcTest.outcome === 'refer_to_chc' ? ' → Referred to CHC' : ' → Managed at PHC'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0">
                        <RiskBadge level={s?.result?.riskLevel} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Referral Modal */}
      <Modal
        open={referralModal}
        onClose={() => setReferralModal(false)}
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <span>{referralForm.referredToName.includes('CHC') ? '🏥' : '📋'}</span>
            <span>Refer Patient</span>
          </div>
        }
      >
        <div className="space-y-5 p-1">
          <div>
            <label className={labelStyles}>Refer to (Facility Name)</label>
            <input
              className={inputStyles}
              value={referralForm.referredToName}
              onChange={e => setReferralForm(f => ({ ...f, referredToName: e.target.value }))}
            />
          </div>

          <div>
            <label className={labelStyles}>Facility Email <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="email"
              className={inputStyles}
              placeholder="chc@health.gov.in"
              value={referralForm.referredToEmail}
              onChange={e => setReferralForm(f => ({ ...f, referredToEmail: e.target.value }))}
            />
          </div>

          <div>
            <label className={labelStyles}>Reason for Referral <span className="text-rose-500">*</span></label>
            <textarea
              className={`${inputStyles} h-28 resize-none`}
              placeholder="Enter clinical reasoning..."
              value={referralForm.reason}
              onChange={e => setReferralForm(f => ({ ...f, reason: e.target.value }))}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={sendReferral}
              disabled={sending || !referralForm.reason}
              className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                sending || !referralForm.reason
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-md hover:from-rose-600 hover:to-red-700 active:scale-95'
              }`}
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>📋 Send Referral</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}