import { useState } from 'react';
import { updateAlert } from '../../services/alertService';

export default function DoctorNotes({ alert, onUpdate }) {
  const [note, setNote] = useState(alert.doctorNote || '');
  const [status, setStatus] = useState(alert.status || 'pending');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setJustSaved(false);
    try {
      const updated = await updateAlert(alert._id, { status, doctorNote: note });
      onUpdate?.(updated.data);
      
      // Trigger success state for 2 seconds
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Reusable modern input styles
  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium";
  const labelStyles = "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Status Dropdown */}
      <div>
        <label className={labelStyles}>Alert Status</label>
        <div className="relative">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className={`${inputStyles} appearance-none pr-10 cursor-pointer`}
          >
            <option value="pending">🟡 Pending Review</option>
            <option value="acknowledged">🔵 Acknowledged / Monitoring</option>
            <option value="actioned">🟢 Actioned / Resolved</option>
          </select>
          {/* Custom Caret */}
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Notes Textarea */}
      <div>
        <label className={labelStyles}>Clinical Notes</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          className={`${inputStyles} h-28 resize-none`}
          placeholder="Add observations, patient history, or treatment plan..."
        />
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button 
          onClick={save} 
          disabled={saving} 
          className={`w-full py-3.5 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
            saving 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : justSaved
              ? 'bg-emerald-500 text-white shadow-emerald-200'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98]'
          }`}
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving Notes...</span>
            </>
          ) : justSaved ? (
            <>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <span>💾 Save Notes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}