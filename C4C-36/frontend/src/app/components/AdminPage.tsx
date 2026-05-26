import { useEffect, useState } from 'react';
import { Play, CheckCircle, Clock, XCircle, BarChart3, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'sonner';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
interface Submission {
  id: string;
  phoneNumber?: string;
  phone?: string;
  skill?: string;
  trade?: string;
  submittedAt?: string;
  createdAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  professionalismScore?: number;
  skillScore?: number;
  transcript?: string;
  mediaUrl?: string;
}

const initialSubmissions: Submission[] = [
  { id: '#1001', phoneNumber: '+91 9876543210', skill: 'Tailoring', submittedAt: '2 hours ago', status: 'pending' },
  { id: '#1002', phoneNumber: '+91 8765432109', skill: 'Handicrafts', submittedAt: '2 hours ago', status: 'pending' },
  { id: '#1003', phoneNumber: '+91 7654321098', skill: 'Food Prep', submittedAt: '2 hours ago', status: 'pending' },
  { id: '#1004', phoneNumber: '+91 6543210987', skill: 'Beauty', submittedAt: '1 day ago', status: 'approved', professionalismScore: 88, skillScore: 92 },
  { id: '#1005', phoneNumber: '+91 5432109876', skill: 'Manufacturing', submittedAt: '2 days ago', status: 'approved', professionalismScore: 95, skillScore: 90 },
];

const serif = { fontFamily: '"Instrument Serif", serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };

function StatCard({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: number;
  Icon: typeof CheckCircle;
  accent: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-white/80 backdrop-blur rounded-[28px] p-6 border border-zinc-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-[13px] text-zinc-500 tracking-tight" style={sans}>
          {label}
        </span>
        <Icon size={18} className={accent} strokeWidth={2} />
      </div>
      <div className="text-zinc-900 leading-none" style={{ ...serif, fontSize: '64px' }}>
        {value}
      </div>
    </motion.div>
  );
}

export function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [skillScore, setSkillScore] = useState(75);
  const [professionalismScore, setProfessionalismScore] = useState(75);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingSubmissions();
      setSubmissions(data);
    } catch (err: any) {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!selectedSubmission) return;
    try {
      await api.approveSubmission(selectedSubmission.id, skillScore, professionalismScore);
      toast.success('Certificate Issued!');
      setIsReviewMode(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDecline = async () => {
    if (!selectedSubmission) return;
    try {
      await api.rejectSubmission(selectedSubmission.id);
      toast.error('Application declined');
      setIsReviewMode(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBackToDashboard = () => {
    setIsReviewMode(false);
    setSelectedSubmission(null);
  };

  const stats = {
    approved: 0,
    pending: submissions.length,
    rejected: 0,
    total: submissions.length,
  };

  const handleReviewClick = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsReviewMode(true);
    setSkillScore(75);
    setProfessionalismScore(75);
  };

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

      <AnimatePresence mode="wait">
        {!isReviewMode ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-8 py-12"
          >
            <div className="max-w-6xl mx-auto">
              {/* Hero */}
              <div className="flex flex-col items-center text-center mb-14">

                <h1
                  className="text-zinc-900 leading-[0.95] tracking-tight"
                  style={{ ...serif, fontSize: 'clamp(56px, 8vw, 96px)' }}
                >
                  {t('review_score_mint')}
                  <br />
                  <span className="italic">{t('mint_with_care')}</span>
                </h1>

                <p
                  className="text-zinc-500 mt-6 max-w-xl"
                  style={{ fontSize: '17px', lineHeight: '1.5' }}
                >
                  {t('admin_hero_desc')}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard label={t('approved')} value={stats.approved} Icon={CheckCircle} accent="text-emerald-500" />
                <StatCard label={t('pending')} value={stats.pending} Icon={Clock} accent="text-amber-500" />
                <StatCard label={t('rejected')} value={stats.rejected} Icon={XCircle} accent="text-rose-500" />
                <StatCard label={t('total_reviews')} value={stats.total} Icon={BarChart3} accent="text-blue-500" />
              </div>

              {/* Submissions Card */}
              <div className="bg-white/85 backdrop-blur rounded-[32px] border border-zinc-200/70 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-8">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h2 className="text-zinc-900" style={{ ...serif, fontSize: '40px', lineHeight: '1' }}>
                      {t('pending_review')}
                    </h2>
                    <p className="text-zinc-500 mt-2" style={{ fontSize: '14px' }}>
                      {t('submissions_waiting')}
                    </p>
                  </div>
                  <span
                    className="text-zinc-500 px-3 py-1 rounded-full bg-zinc-100"
                    style={{ fontSize: '12px' }}
                  >
                    {stats.pending} {t('open')}
                  </span>
                </div>

                <div className="space-y-3">
                  {submissions
                    .filter((s) => s.status === 'pending')
                    .map((submission) => (
                      <motion.div
                        key={submission.id}
                        whileHover={{ x: 2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="group flex items-center justify-between p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 hover:border-zinc-300 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-4">
                            <div
                              className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-zinc-700"
                              style={{ ...serif, fontSize: '18px' }}
                            >
                              {(submission.skill || submission.trade || 'S')[0].toUpperCase()}
                            </div>
                          <div>
                            <div className="text-zinc-900" style={{ fontSize: '15px' }}>
                              Submission {submission.id.slice(0, 8)}
                              <span className="text-zinc-400"> · {submission.trade || submission.skill}</span>
                            </div>
                            <div className="text-zinc-500 mt-0.5" style={{ fontSize: '13px' }}>
                              {submission.phone || submission.phoneNumber} · {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : submission.submittedAt}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleReviewClick(submission)}
                          className="px-5 py-2.5 rounded-full bg-[#2F6BFF] text-white hover:bg-[#1F58E8] transition-colors shadow-[0_1px_2px_rgba(47,107,255,0.3)]"
                          style={{ fontSize: '14px' }}
                        >
                          {t('review')}
                        </button>
                      </motion.div>
                    ))}

                  {submissions.filter((s) => s.status === 'pending').length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-zinc-700" style={{ ...serif, fontSize: '28px' }}>
                        {t('all_caught_up')}
                      </p>
                      <p className="text-zinc-500 mt-2" style={{ fontSize: '14px' }}>
                        {t('no_pending_submissions')}
                      </p>
                    </div>
                  )}
                </div>

                {submissions.filter((s) => s.status === 'approved').length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-zinc-900 mb-4" style={{ ...serif, fontSize: '24px' }}>
                      {t('recently_approved')}
                    </h3>
                    <div className="space-y-2">
                      {submissions
                        .filter((s) => s.status === 'approved')
                        .slice(0, 3)
                        .map((submission) => (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100"
                          >
                            <div>
                              <p className="text-zinc-900" style={{ fontSize: '14px' }}>
                                {submission.id} · {t((submission.trade || submission.skill)?.toLowerCase() || '') === (submission.trade || submission.skill)?.toLowerCase() ? (submission.trade || submission.skill) : t((submission.trade || submission.skill)?.toLowerCase() || '')}
                              </p>
                              <p className="text-zinc-500 mt-0.5" style={{ fontSize: '12px' }}>
                                {t('skill_score')} {submission.skillScore}/100 · {t('professionalism')}{' '}
                                {submission.professionalismScore}/100
                              </p>
                            </div>
                            <CheckCircle size={18} className="text-emerald-500" />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="px-8 py-12"
          >
            <div className="max-w-5xl mx-auto">
              <button
                onClick={handleBackToDashboard}
                className="text-zinc-500 hover:text-zinc-900 mb-8 flex items-center gap-2 transition-colors"
                style={{ fontSize: '14px' }}
              >
                <ArrowLeft size={16} /> {t('back_to_dashboard')}
              </button>

              <div className="mb-10">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full bg-white/70 border border-zinc-200 text-zinc-600 mb-5 backdrop-blur"
                  style={{ fontSize: '12px' }}
                >
                  Submission {selectedSubmission?.id}
                </div>
                <h1
                  className="text-zinc-900 leading-[0.95] tracking-tight"
                  style={{ ...serif, fontSize: 'clamp(44px, 6vw, 72px)' }}
                >
                  {t('reviewing')} <span className="italic">{t((selectedSubmission?.trade || selectedSubmission?.skill)?.toLowerCase() || '') === (selectedSubmission?.trade || selectedSubmission?.skill)?.toLowerCase() ? (selectedSubmission?.trade || selectedSubmission?.skill) : t((selectedSubmission?.trade || selectedSubmission?.skill)?.toLowerCase() || '')}</span>
                </h1>
                <p className="text-zinc-500 mt-3" style={{ fontSize: '15px' }}>
                  {selectedSubmission?.phone || selectedSubmission?.phoneNumber}
                </p>
              </div>

              {/* Video */}
              <div className="mb-8 relative aspect-video rounded-[28px] overflow-hidden border border-zinc-200 shadow-[0_4px_24px_rgba(16,24,40,0.06)]">
                <img
                  src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80"
                  alt="Video preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <button className="p-6 rounded-full bg-white hover:scale-105 transition-transform shadow-lg">
                    <Play size={28} className="text-zinc-900 ml-1" fill="currentColor" />
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid md:grid-cols-2 gap-5 mb-10">
                {[
                  {
                    label: t('skill_score'),
                    desc: t('technical_skill_desc'),
                    value: skillScore,
                    set: setSkillScore,
                    color: '#10b981',
                  },
                  {
                    label: t('professionalism'),
                    desc: t('professionalism_desc'),
                    value: professionalismScore,
                    set: setProfessionalismScore,
                    color: '#2F6BFF',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white/85 backdrop-blur rounded-[28px] border border-zinc-200/70 p-7 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                  >
                    <div className="flex items-baseline justify-between mb-5">
                      <h3 className="text-zinc-900" style={{ ...serif, fontSize: '28px' }}>
                        {s.label}
                      </h3>
                      <span
                        className="text-zinc-900 leading-none"
                        style={{ ...serif, fontSize: '56px' }}
                      >
                        {s.value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={s.value}
                      onChange={(e) => s.set(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${s.color} 0%, ${s.color} ${s.value}%, #e4e4e7 ${s.value}%, #e4e4e7 100%)`,
                      }}
                    />
                    <p className="text-zinc-500 mt-4" style={{ fontSize: '13px' }}>
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDecline}
                  className="px-7 py-3.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:border-rose-300 hover:text-rose-600 transition-colors"
                  style={{ fontSize: '15px' }}
                >
                  {t('decline')}
                </button>
                <button
                  onClick={handleAccept}
                  className="px-7 py-3.5 rounded-full bg-[#2F6BFF] text-white hover:bg-[#1F58E8] transition-colors shadow-[0_2px_8px_rgba(47,107,255,0.35)]"
                  style={{ fontSize: '15px' }}
                >
                  {t('accept_and_mint')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
