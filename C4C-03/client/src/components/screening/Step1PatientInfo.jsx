import { useTranslation } from 'react-i18next';

export default function Step1PatientInfo({
  data,
  onChange,
  onCreatePatient,
  createdPatient
}) {
  const { t } = useTranslation();

  const isCreated = !!createdPatient;

  // Shared Styles
  const inputStyles =
    "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium";

  const labelStyles =
    "block text-sm font-bold text-slate-700 mb-1.5 ml-1";

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xl">
          👤
        </div>

        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          {t('patient_info', 'Patient Info')}
        </h2>
      </div>

      {/* Success Banner */}
      {isCreated && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-[1.25rem] p-4 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <p className="text-emerald-800 font-bold text-sm">
              {t('patient_registered', 'Patient Registered')}
            </p>

            <p className="text-emerald-600 text-xs font-medium mt-0.5">
              <strong>{createdPatient.name}</strong>{' '}
              {t('patient_saved_continue', 'has been saved. Proceed to vitals.')}
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        
        {/* Name */}
        <div>
          <label className={labelStyles}>
            {t('name', 'Full Name')}{' '}
            <span className="text-red-500">*</span>
          </label>

          <input
            disabled={isCreated}
            className={inputStyles}
            placeholder={t('name_placeholder', 'e.g. Ramesh Kumar')}
            value={data.name || ''}
            onChange={e => onChange({ name: e.target.value })}
          />
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          
          <div>
            <label className={labelStyles}>
              {t('age', 'Age')}{' '}
              <span className="text-red-500">*</span>
            </label>

            <input
              disabled={isCreated}
              type="number"
              className={inputStyles}
              placeholder={t('age_placeholder', 'Years')}
              value={data.age || ''}
              onChange={e => onChange({ age: e.target.value })}
            />
          </div>

          <div>
            <label className={labelStyles}>
              {t('gender', 'Gender')}{' '}
              <span className="text-red-500">*</span>
            </label>

            <select
              disabled={isCreated}
              className={`${inputStyles} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
              value={data.gender || ''}
              onChange={e => onChange({ gender: e.target.value })}
            >
              <option value="" disabled>
                {t('select', 'Select')}
              </option>

              <option value="male">
                {t('male', 'Male')}
              </option>

              <option value="female">
                {t('female', 'Female')}
              </option>

              <option value="other">
                {t('other', 'Other')}
              </option>
            </select>
          </div>
        </div>

        {/* Village */}
        <div>
          <label className={labelStyles}>
            {t('village', 'Village')}{' '}
            <span className="text-red-500">*</span>
          </label>

          <input
            disabled={isCreated}
            className={inputStyles}
            placeholder={t('village_placeholder', 'Village/Hamlet name')}
            value={data.village || ''}
            onChange={e => onChange({ village: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div>
          <label className={labelStyles}>
            {t('phone', 'Phone Number')}
          </label>

          <input
            disabled={isCreated}
            type="tel"
            className={inputStyles}
            placeholder={t('phone_placeholder', '10-digit mobile number')}
            value={data.phone || ''}
            onChange={e => onChange({ phone: e.target.value })}
          />
        </div>

        {/* Aadhaar */}
        <div>
          <label className={labelStyles}>
            {t('aadhaar', 'Aadhaar Number')}{' '}
            <span className="text-slate-400 font-normal">
              ({t('optional', 'Optional')})
            </span>
          </label>

          <input
            disabled={isCreated}
            className={inputStyles}
            placeholder={t('aadhaar_placeholder', '12-digit number')}
            value={data.aadhaar || ''}
            onChange={e => onChange({ aadhaar: e.target.value })}
          />
        </div>
      </div>

      {/* Action Button */}
      {!isCreated && (
        <button
          onClick={onCreatePatient}
          className="w-full mt-2 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-2xl shadow-sm hover:shadow-md hover:from-green-700 hover:to-emerald-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>
            {t('register_continue', 'Register Patient & Continue')}
          </span>

          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14m-7-7l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}