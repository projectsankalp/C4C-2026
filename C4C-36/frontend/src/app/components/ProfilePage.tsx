import { useEffect, useState } from 'react';
import { CheckCircle, BadgeCheck, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router';

interface Job {
  id: number;
  titleKey: string;
  companyKey: string;
  locationKey: string;
  description?: string;
  employerPhone?: string;
}



const serif = { fontFamily: '"Instrument Serif", serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };

export function ProfilePage() {
  const [isJobsExpanded, setIsJobsExpanded] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, subsData] = await Promise.all([
        api.getProfile(),
        api.getSubmissions(),
      ]);
      setProfile(profileData);
      setSubmissions(subsData);
    } catch (err) {
      console.error('Failed to fetch profile data', err);
    }
  };

  // Fallback to dummy submission if none exists so the profile is fully populated for demo
  const approvedSubmission = submissions.find(s => s.status === 'approved') || {
    trade: 'tailoring',
    status: 'approved',
    aiScore: 95,
    createdAt: '2026-05-24T00:00:00Z',
    candidateLocation: 'Mangalore', // Added for demo filtering
    certificate: {
      certCode: 'CERT-A1B2C3D4',
      hash: '7f3a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e9e2b'
    }
  };

  useEffect(() => {
    if (approvedSubmission?.trade) {
      setIsLoadingJobs(true);
      api.getJobs(approvedSubmission.candidateLocation)
        .then(data => setJobs(data))
        .catch(err => {
          console.error('Failed to fetch jobs', err);
          toast.error('Could not load jobs at this time.');
        })
        .finally(() => setIsLoadingJobs(false));
    }
  }, [approvedSubmission?.trade, approvedSubmission?.candidateLocation]);

  return (
    <div
      className="min-h-screen"
      style={{
        ...sans,
        background:
          'radial-gradient(1200px 600px at 50% -10%, #ffffff 0%, #F4F1EC 60%, #EDE8E0 100%)',
      }}
    >
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
              style={{ ...serif, fontSize: 'clamp(40px, 6vw, 64px)' }}
            >
              {approvedSubmission?.candidateName || profile?.name || t('my_profile')}
            </h1>
            <p className="text-zinc-500 mt-3" style={{ fontSize: '15px' }}>
              {approvedSubmission?.candidatePhone || profile?.phone}
            </p>
            {approvedSubmission?.candidateName && (
              <div className="mt-3 inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
                Proxy Submission by {profile?.name || profile?.phone}
              </div>
            )}
          </div>

          {/* Certificate Card */}
          {approvedSubmission ? (
            <motion.div
              onClick={() => setIsJobsExpanded(!isJobsExpanded)}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white/90 backdrop-blur rounded-[36px] border border-zinc-200/70 p-10 cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_8px_32px_rgba(16,24,40,0.08)] transition-shadow mb-4"
            >
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[20px] bg-[#FFF8EB] border border-[#FFE8C2] flex items-center justify-center">
                    <BadgeCheck size={28} className="text-[#F5A524]" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h2 className="text-zinc-900" style={{ ...serif, fontSize: '38px', lineHeight: '1' }}>
                      Master Tailor
                    </h2>
                    <p className="text-zinc-500 mt-1" style={{ fontSize: '15px' }}>
                      Certified credential
                    </p>
                  </div>
                </div>

                <div className="w-[104px] h-[104px] bg-white border border-zinc-200 rounded-[24px] flex items-center justify-center shadow-sm">
                  <span className="text-zinc-400" style={{ fontSize: '13px' }}>QR Code</span>
                </div>
              </div>

              <div className="flex gap-20 mb-8">
                <div>
                  <p className="text-zinc-500 mb-1" style={{ fontSize: '14px' }}>
                    Skill score
                  </p>
                  <p className="text-zinc-900" style={{ ...serif, fontSize: '42px' }}>
                    {approvedSubmission.aiScore}<span className="text-zinc-300" style={{ fontSize: '36px' }}>/100</span>
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 mb-1" style={{ fontSize: '14px' }}>
                    Issued
                  </p>
                  <p className="text-zinc-900" style={{ ...serif, fontSize: '36px' }}>
                    {new Date(approvedSubmission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {approvedSubmission.certificate && (
                <div className="w-full bg-[#FAFAFA] border border-zinc-200/70 rounded-[20px] p-5 text-center mb-6">
                  <p className="text-zinc-400 mb-1" style={{ fontSize: '12px' }}>
                    Certificate ID
                  </p>
                  <p className="text-zinc-800 font-mono tracking-widest" style={{ fontSize: '15px' }}>
                    0x{approvedSubmission.certificate.hash.substring(0, 4)}...{approvedSubmission.certificate.hash.substring(approvedSubmission.certificate.hash.length - 4)}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center mt-6 text-zinc-500 gap-2">
                {isJobsExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    <span style={{ fontSize: '13px' }}>{t('hide_jobs')}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span style={{ fontSize: '13px' }}>{t('view_unlocked_jobs')}</span>
                  </>
                )}
              </div>
            </motion.div>
          ) : submissions.length > 0 ? (
            <div className="bg-white/80 backdrop-blur rounded-[32px] border border-zinc-200/70 p-12 text-center mb-4">
              <Clock size={48} className="mx-auto text-amber-500 mb-4" />
              <h2 className="text-zinc-900 mb-2" style={{ ...serif, fontSize: '32px' }}>
                Certification Pending
              </h2>
              <p className="text-zinc-500">
                A validator is currently reviewing your {submissions[0].trade} proof.
              </p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur rounded-[32px] border border-zinc-200/70 p-12 text-center mb-4">
              <h2 className="text-zinc-900 mb-2" style={{ ...serif, fontSize: '32px' }}>
                No Certifications Yet
              </h2>
              <p className="text-zinc-500 mb-6">
                Upload a video of your skill to get your first verified credential.
              </p>
              <button
                onClick={() => navigate('/hub')}
                className="px-8 py-3 bg-[#2F6BFF] text-white rounded-full"
              >
                Go to Hub
              </button>
            </div>
          )}

          {/* Unlocked Jobs */}
          <AnimatePresence>
            {isJobsExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white/85 backdrop-blur border border-zinc-200/70 rounded-[28px] p-6">
                  <h3 className="text-zinc-900 mb-5" style={{ ...serif, fontSize: '26px' }}>
                    {t('unlocked_local_jobs')}
                  </h3>

                  {isLoadingJobs ? (
                    <div className="text-center py-6">
                      <div className="inline-block w-6 h-6 border-2 border-zinc-200 border-t-[#2F6BFF] rounded-full animate-spin mb-2"></div>
                      <p className="text-zinc-500" style={{ fontSize: '14px' }}>Loading jobs in your area...</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-6 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                      <p className="text-zinc-500" style={{ fontSize: '14px' }}>
                        No jobs available in your area right now. Check back later!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.map((job) => {
                        const isExpanded = expandedJobId === job.id;
                        return (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: job.id * 0.05 }}
                            className="bg-zinc-50/70 border border-zinc-200/60 rounded-2xl overflow-hidden hover:bg-white hover:border-zinc-300 transition-colors"
                          >
                            <div className="p-4 flex items-start justify-between">
                              <div>
                                <div className="text-zinc-900 font-medium" style={{ fontSize: '15px' }}>
                                  {t(job.titleKey) === job.titleKey ? job.titleKey : t(job.titleKey)}
                                </div>
                                <div className="text-zinc-500 mt-0.5" style={{ fontSize: '13px' }}>
                                  {t(job.companyKey) === job.companyKey ? job.companyKey : t(job.companyKey)} · {t(job.locationKey) === job.locationKey ? job.locationKey : t(job.locationKey)}
                                </div>
                              </div>

                              {!isExpanded && (
                                <button
                                  onClick={() => setExpandedJobId(job.id)}
                                  className="px-5 py-2 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm"
                                  style={{ fontSize: '13px' }}
                                >
                                  Apply
                                </button>
                              )}
                            </div>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="px-4 pb-4 border-t border-zinc-100 mt-2 pt-4 bg-white/50"
                                >
                                  <p className="text-zinc-600 mb-4" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                    {job.description || "Looking for a skilled verified tailor to join our local team. Must have experience with measurements, cutting, and stitching high-quality garments."}
                                  </p>

                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setExpandedJobId(null)}
                                      className="px-4 py-2 rounded-full text-zinc-500 hover:bg-zinc-100 transition-colors"
                                      style={{ fontSize: '13px' }}
                                    >
                                      Close
                                    </button>
                                    <a
                                      href={job.employerPhone ? `tel:${job.employerPhone}` : '#'}
                                      className="px-6 py-2 rounded-full bg-[#2F6BFF] text-white hover:bg-[#1F58E8] transition-colors shadow-[0_1px_2px_rgba(47,107,255,0.3)] inline-block"
                                      style={{ fontSize: '13px' }}
                                    >
                                      Call Employer
                                    </a>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { value: approvedSubmission ? 1 : 0, labelKey: 'certificates', accent: 'text-zinc-900' },
              { value: approvedSubmission ? 3 : 0, labelKey: 'jobs_unlocked', accent: 'text-zinc-900' },
              { value: approvedSubmission ? approvedSubmission.aiScore : 0, labelKey: 'skill_score', accent: 'text-emerald-600' },
            ].map((s) => (
              <div
                key={s.labelKey}
                className="bg-white/80 backdrop-blur border border-zinc-200/70 rounded-[24px] p-5 text-center shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              >
                <div className={`leading-none ${s.accent}`} style={{ ...serif, fontSize: '44px' }}>
                  {s.value}
                </div>
                <div className="text-zinc-500 mt-2" style={{ fontSize: '12px' }}>
                  {t(s.labelKey)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
