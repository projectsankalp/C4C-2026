import { useState } from 'react';
import { X, Clock, CheckCircle2, FileText, User, Activity, AlertCircle, ShieldCheck } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { renderSafe } from '../../utils/renderSafe';

export default function PatientModal({ patient, onClose, onFollowUp, onResolve, isAdmin }) {
  const isResolved = patient?.status === 'RESOLVED';

  const [notes, setNotes] = useState(patient?.doctorNotes || '');
  const [impression, setImpression] = useState(patient?.diagnosis || '');
  const [prescription, setPrescription] = useState(patient?.prescription || '');
  const [error, setError] = useState('');

  if (!patient) return null;

  const handleResolve = () => {
    if (!impression.trim()) {
      setError('Clinical impression is required before resolving this case.');
      return;
    }
    setError('');
    if (onResolve) {
      onResolve(patient.id, { doctorNotes: notes, diagnosis: impression, prescription });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-1 border border-border-primary/50 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-border-primary/50 shrink-0 bg-surface-2/30">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-tight text-text-main">{renderSafe(patient?.name)}</h2>
            <RiskBadge risk={patient?.riskLevel || 'ALL'} />
            {isResolved && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-status-green/10 border border-status-green/30">
                <CheckCircle2 className="w-3 h-3 text-status-green" />
                <span className="text-[10px] font-bold text-status-green uppercase tracking-wider">Clinically Resolved</span>
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-main transition-colors duration-200 bg-surface-2 rounded-lg hover:bg-border-primary/50 border border-border-primary/50">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* SCROLLABLE BODY */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* 1. Patient Information */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center space-x-2 border-b border-border-primary/30 pb-2">
              <User className="w-3.5 h-3.5" /> <span>1. Patient Information</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Age / Gender</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{renderSafe(patient?.age)}y / {renderSafe(patient?.gender)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Phone</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{renderSafe(patient?.phone, 'N/A')}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Village</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{renderSafe(patient?.village)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">House No.</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{renderSafe(patient?.houseNumber, 'N/A')}</p>
              </div>
            </div>
          </div>

          {/* 2. Survey Summary */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center space-x-2 border-b border-border-primary/30 pb-2">
              <Activity className="w-3.5 h-3.5" /> <span>2. Survey Snapshot</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-2/30 p-4 rounded-xl border border-border-primary/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">BMI</p>
                <p className="text-2xl font-bold tracking-tight text-text-main">{renderSafe(patient?.bp, 'N/A')}</p>
              </div>
              <div className="bg-surface-2/30 p-4 rounded-xl border border-border-primary/50">
                <p className="text-[10px] uppercase tracking-wider font-bold text-text-muted mb-1">Overall Risk</p>
                <p className="text-2xl font-bold tracking-tight text-text-main">{renderSafe(patient?.sugar, 'N/A')}</p>
              </div>
            </div>
            
            <div className="bg-surface-2/30 border border-border-primary/50 rounded-xl p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Survey Answers</p>
                <div className="text-sm text-text-main font-medium whitespace-pre-wrap">
                  {patient?.surveyAnswers?.length
                    ? patient.surveyAnswers.join('\n')
                    : 'No survey answers captured'}
                </div>
              </div>
              <div className="flex-1 border-l border-border-primary/30 pl-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-status-red shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-status-red uppercase tracking-wider mb-1.5">Risk Factors</p>
                    <div className="text-sm text-text-main font-medium space-y-1">
                      {patient?.riskReasons?.length
                        ? patient.riskReasons.slice(0, 5).map((reason, idx) => <div key={idx}>{reason}</div>)
                        : <div>No risk factors captured</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ASHA Worker Info */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center space-x-2 border-b border-border-primary/30 pb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> <span>3. Field Operative Sync</span>
            </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Submitted By</p>
                  <p className="text-sm font-semibold text-text-main mt-0.5">{renderSafe(patient?.ashaName)}</p>
              </div>
              <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">PHC Node</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{renderSafe(patient?.phcName, 'Network Default')}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Sync Timestamp</p>
                <p className="text-sm font-semibold text-text-main mt-0.5">{patient?.updatedAt ? new Date(patient.updatedAt).toLocaleString() : 'Live sync pending'}</p>
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="bg-surface-2/10 p-5 rounded-2xl border border-border-primary/50 space-y-4">
              <div className="flex items-center space-x-2 border-b border-border-primary/30 pb-3 mb-2">
                <FileText className="w-4 h-4 text-text-muted" />
                <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Operational Screening Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Status</p>
                  <p className="text-sm font-bold text-text-main mt-0.5">{patient.status}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Last Updated</p>
                  <p className="text-sm font-bold text-text-main mt-0.5">{patient.resolvedAt ? new Date(patient.resolvedAt).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-surface-2 border border-border-primary/50 rounded-xl">
                <p className="text-xs font-semibold text-text-muted flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Clinical notes and prescription details are restricted to doctor access.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 bg-surface-2/10 p-5 rounded-2xl border border-border-primary/50">
              {isResolved ? (
              <div className="space-y-5">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-accent-primary" />
                  <h3 className="text-sm font-bold text-text-main uppercase tracking-widest">Final Clinical Summary</h3>
                </div>
                
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Doctor Notes</p>
                  <div className="text-sm text-text-main bg-surface-1 border border-border-primary/50 p-3 rounded-lg min-h-[60px]">{patient.doctorNotes || 'No notes provided.'}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Clinical Impression / Diagnosis</p>
                  <div className="text-sm text-text-main bg-surface-1 border border-border-primary/50 p-3 rounded-lg min-h-[60px] font-semibold">{patient.diagnosis || 'None'}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Prescription / Advice</p>
                  <div className="text-sm text-text-main bg-surface-1 border border-border-primary/50 p-3 rounded-lg min-h-[60px]">{patient.prescription || 'None'}</div>
                </div>
                
                <div className="pt-4 border-t border-border-primary/30 flex justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Resolved By</p>
                    <p className="text-xs font-bold text-text-main mt-0.5">{patient.resolvedBy || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">Resolved At</p>
                    <p className="text-xs font-bold text-text-main mt-0.5">{patient.resolvedAt ? new Date(patient.resolvedAt).toLocaleString() : 'Unknown'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 4. Doctor Notes */}
                <div>
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">4. Doctor Notes</h3>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-surface-1 border border-border-primary/50 rounded-lg p-3 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 resize-none placeholder:text-text-muted/40"
                    rows="2"
                    placeholder="General operational notes..."
                  ></textarea>
                </div>

                {/* 5. Clinical Impression */}
                <div>
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">5. Clinical Impression / Provisional Diagnosis <span className="text-status-red">*</span></h3>
                  <textarea 
                    value={impression}
                    onChange={(e) => setImpression(e.target.value)}
                    className="w-full bg-surface-1 border border-border-primary/50 rounded-lg p-3 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 resize-none placeholder:text-text-muted/40"
                    rows="2"
                    placeholder="Example: Suspected hypertension — PHC confirmation required"
                  ></textarea>
                </div>

                {/* 6. Prescription / Advice */}
                <div>
                  <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">6. Prescription / Referral Instruction</h3>
                  <textarea 
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    className="w-full bg-surface-1 border border-border-primary/50 rounded-lg p-3 text-sm font-medium text-text-main focus:outline-none focus:border-text-muted transition-colors duration-200 resize-none placeholder:text-text-muted/40"
                    rows="2"
                    placeholder="Example: Refer to PHC for repeat BP check within 7 days"
                  ></textarea>
                </div>
                
                {error && (
                  <div className="p-3 bg-status-red/10 border border-status-red/30 rounded-lg text-sm font-bold text-status-red">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>
          )}
          
          {/* 7. Clinical Disclaimer */}
          <div className="text-center pt-2">
            <p className="text-[10px] font-semibold text-text-muted/60 uppercase tracking-widest">
              Screening only. Final diagnosis must be clinically confirmed at PHC.
            </p>
          </div>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 border-t border-border-primary/50 bg-surface-2/30 flex justify-end space-x-3 shrink-0 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors duration-200">
            {isResolved ? 'Close Summary' : 'Cancel'}
          </button>
          
          {!isResolved && (
            <>
              {onFollowUp && patient.status !== 'FOLLOW_UP' && (
                <button 
                  onClick={() => onFollowUp(patient.id)} 
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-surface-1 hover:bg-border-primary/50 border border-border-primary/50 text-text-main text-sm font-bold rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <Clock className="w-4 h-4 text-status-yellow" />
                  <span>Mark Follow-Up</span>
                </button>
              )}

              {onResolve && (
                <button 
                  onClick={handleResolve} 
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-status-green/10 hover:bg-status-green/20 border border-status-green/30 text-status-green text-sm font-bold rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolve Case</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
