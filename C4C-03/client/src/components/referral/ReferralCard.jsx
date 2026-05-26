import { formatDate } from '../../utils/formatDate';
import { generateReferralPDF } from '../../utils/generatePDF';

export default function ReferralCard({ referral }) {
  const patient   = referral.patientId;
  const screening = referral.screeningId;
  const doctor    = referral.referredBy;

  if (!patient) return null;

  // Prefer PHC-confirmed blood glucose over the legacy vitals.bloodSugar field
  const bloodSugarValue = screening?.phcTest?.bloodGlucose
    ?? screening?.vitals?.bloodSugar
    ?? null;

  const bloodSugarLabel = screening?.phcTest?.bloodGlucose
    ? `${screening.phcTest.bloodGlucose} mg/dL (${screening.phcTest.testType ?? 'PHC test'})`
    : bloodSugarValue
    ? `${bloodSugarValue} mg/dL`
    : '—';

  const glucoseResultLabel = screening?.phcTest?.glucoseResult
    ? screening.phcTest.glucoseResult.charAt(0).toUpperCase() +
      screening.phcTest.glucoseResult.slice(1)
    : null;

  const isHighGlucose =
    (screening?.phcTest?.glucoseResult === 'diabetic') ||
    (bloodSugarValue >= 200);

  const isHighBP = screening?.vitals?.systolic >= 140;

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm font-sans flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Document Header */}
      <div className="bg-slate-50 border-b border-slate-100 p-4 text-center relative">
        <div className="absolute top-4 left-4 text-slate-400 opacity-50">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-sm font-extrabold text-blue-700 tracking-widest uppercase">ASDIQA Referral</h2>
        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Rural Health Screening System</p>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Section 1: Patient Info */}
        <div>
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Patient Details</h3>
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-base font-extrabold text-slate-800 leading-none">{patient.name}</span>
              <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/60 shadow-sm">
                {patient.age}y • {patient.gender.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-500 pt-1">
              <span>📍 {patient.village}</span>
              <span>📞 {patient.phone || '—'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Vitals */}
        <div>
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Clinical Assessment</h3>
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-2">
            
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Blood Pressure</span>
              <span className={`font-extrabold ${isHighBP ? 'text-rose-600' : 'text-slate-700'}`}>
                {screening?.vitals?.systolic}/{screening?.vitals?.diastolic} <span className="text-xs font-medium text-slate-400">mmHg</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">Blood Sugar</span>
              <div className="flex items-center gap-2 text-right">
                {glucoseResultLabel && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold tracking-wide ${
                    screening.phcTest.glucoseResult === 'normal' ? 'bg-emerald-100 text-emerald-700' : 
                    screening.phcTest.glucoseResult === 'prediabetic' ? 'bg-amber-100 text-amber-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {glucoseResultLabel}
                  </span>
                )}
                <span className={`font-extrabold ${isHighGlucose ? 'text-rose-600' : 'text-slate-700'}`}>
                  {bloodSugarLabel}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-500">BMI</span>
              <span className="font-extrabold text-slate-700">{screening?.vitals?.bmi || '—'}</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-1 border-t border-slate-200/60 mt-1">
              <span className="font-semibold text-slate-500">System Risk Level</span>
              <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-2 py-1 rounded-md tracking-wider">
                🔴 HIGH RISK
              </span>
            </div>
            
            {screening?.result?.flags?.length > 0 && (
              <div className="text-xs text-slate-500 font-medium pt-1">
                <span className="font-bold text-slate-400 mr-1">Flags:</span> 
                {screening.result.flags.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Referral Details */}
        <div>
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Referral Routing</h3>
          <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-2 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400">Referred To</span>
              <span className="font-extrabold text-slate-800">{referral.referredToName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400">Clinical Reason</span>
              <span className="font-medium text-slate-600 leading-snug">{referral.reason}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-slate-200/60 mt-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400">Referred By</span>
                <span className="font-bold text-slate-700">Dr. {doctor?.name || '—'}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{formatDate(referral.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* PHC Ayurvedic recommendations if present */}
        {screening?.phcTest?.ayurvedicRecommendations?.length > 0 && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>🌿</span> Ayurvedic Recommendations
            </p>
            <ul className="space-y-1">
              {screening.phcTest.ayurvedicRecommendations.slice(0, 3).map((r, i) => (
                <li key={i} className="text-xs font-medium text-emerald-800 leading-snug flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
        <button
          onClick={() => generateReferralPDF(patient, screening, doctor?.name)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  );
}