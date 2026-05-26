import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UploadCloud, ChevronDown, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

import { api } from '../services/api';
const skillKeys = [
  'tailoring',
  'handicrafts',
  'food_prep',
  'beauty',
  'domestic_work',
  'manufacturing',
];

const serif = { fontFamily: '"Instrument Serif", serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };

export function HubPage() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProxy, setIsProxy] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('+91 ');
  const [candidateLocation, setCandidateLocation] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.includes('video')) setUploadedFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedSkill || !uploadedFile) {
      toast.error('Please select a skill and upload a video');
      return;
    }

    if (!candidateName || !candidatePhone || !candidateLocation) {
      toast.error('Please fill in all details');
      return;
    }

    const candidateData = {
      name: candidateName,
      phone: candidatePhone,
      location: candidateLocation
    };

    const promise = api.submitSkill(selectedSkill, uploadedFile, candidateData);

    toast.promise(promise, {
      loading: 'Uploading video and generating AI transcript...',
      success: 'Video uploaded! Pending Review.',
      error: (err) => err.message || 'Upload failed',
    });

    try {
      await promise;
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const inputClass =
    'w-full bg-zinc-50/80 border border-zinc-200 rounded-2xl px-4 py-3.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/30 focus:border-[#2F6BFF] transition-all';

  return (
    <div
      className="min-h-screen"
      style={{
        ...sans,
        background:
          'radial-gradient(1200px 600px at 50% -10%, #ffffff 0%, #F4F1EC 60%, #EDE8E0 100%)',
      }}
    >
      <Toaster position="top-center" richColors />
      <div className="px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Hero */}
          <div className="text-center mb-10">

            <h1
              className="text-zinc-900 leading-[0.95] tracking-tight"
              style={{ ...serif, fontSize: 'clamp(48px, 7vw, 80px)' }}
            >
              {t('show_us_what')}
              <br />
              <span className="italic">{t('you_can_do')}</span>
            </h1>
            <p
              className="text-zinc-500 mt-5 max-w-md mx-auto"
              style={{ fontSize: '16px', lineHeight: '1.5' }}
            >
              {t('record_video_desc')}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white/85 backdrop-blur rounded-[32px] border border-zinc-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-8">

            <div className="mb-6 pb-4 border-b border-zinc-100">
              <h2 className="text-zinc-900" style={{ ...serif, fontSize: '28px' }}>
                {t('registration')}
              </h2>
            </div>

            {/* User/Candidate Fields */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-7 space-y-4"
            >
              <div>
                <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                  {t('your_name')}
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className={inputClass}
                  placeholder={t('eg_your_name')}
                  style={{ fontSize: '15px' }}
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                  {t('your_phone')}
                </label>
                <input
                  type="tel"
                  value={candidatePhone}
                  onChange={(e) => setCandidatePhone(e.target.value)}
                  className={inputClass}
                  placeholder="+91 98765 43210"
                  style={{ fontSize: '15px' }}
                />
              </div>
              <div>
                <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                  {t('your_location')}
                </label>
                <input
                  type="text"
                  value={candidateLocation}
                  onChange={(e) => setCandidateLocation(e.target.value)}
                  className={inputClass}
                  placeholder={t('eg_bangalore')}
                  style={{ fontSize: '15px' }}
                />
              </div>
            </motion.div>

            {/* Skill */}
            <div className="mb-7">
              <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                {t('select_skill')}
              </label>
              <div className="relative">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full appearance-none bg-zinc-50/80 border border-zinc-200 rounded-2xl px-4 py-4 pr-10 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/30 focus:border-[#2F6BFF] transition-all"
                  style={{ fontSize: '15px' }}
                >
                  <option value="">{t('choose_skill')}</option>
                  {skillKeys.map((key) => (
                    <option key={key} value={key}>
                      {t(key)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Upload */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-zinc-500" style={{ fontSize: '13px' }}>
                  {t('video_proof')}
                </label>
              </div>
              <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.005 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`border-2 border-dashed rounded-[28px] p-12 transition-colors cursor-pointer ${isDragging
                    ? 'border-[#2F6BFF] bg-[#2F6BFF]/5'
                    : 'border-zinc-300 bg-zinc-50/60'
                  }`}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-5 shadow-sm">
                    <UploadCloud
                      size={28}
                      className={isDragging ? 'text-[#2F6BFF]' : 'text-zinc-500'}
                      strokeWidth={1.75}
                    />
                  </div>
                  {uploadedFile ? (
                    <div className="text-center">
                      <p className="text-zinc-900" style={{ fontSize: '15px' }}>
                        {uploadedFile.name}
                      </p>
                      <p className="text-zinc-500 mt-1" style={{ fontSize: '13px' }}>
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-zinc-900" style={{ ...serif, fontSize: '22px' }}>
                        {t('drop_video_here')}
                      </p>
                      <p className="text-zinc-500 mt-1" style={{ fontSize: '13px' }}>
                        {t('tap_to_record')}
                      </p>
                    </div>
                  )}
                </label>
              </motion.div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!selectedSkill || !uploadedFile}
              className="w-full py-4 rounded-full bg-[#2F6BFF] text-white hover:bg-[#1F58E8] transition-colors shadow-[0_2px_8px_rgba(47,107,255,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              style={{ fontSize: '15px' }}
            >
              {t('submit_for_validation')}
            </button>

            <p className="text-center text-zinc-500 mt-5" style={{ fontSize: '13px' }}>
              {t('submission_reviewed')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
