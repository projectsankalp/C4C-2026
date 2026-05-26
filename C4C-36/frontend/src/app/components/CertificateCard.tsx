import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, ChevronDown, ChevronUp } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
}

const mockJobs: Job[] = [
  { id: 1, title: 'Senior Stitcher', company: 'FabIndia', location: 'Local Workshop' },
  { id: 2, title: 'Pattern Designer', company: 'Handloom Co-op', location: 'Village Center' },
];

export function CertificateCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-8">
      <motion.div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 cursor-pointer hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Award size={32} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white text-xl mb-1">Master Tailor</h3>
              <p className="text-white/60 text-sm">Certified • Skill Score: 95/100</p>
            </div>
          </div>

          <div className="text-white/60">
            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <h4 className="text-white mb-4">Unlocked Local Jobs</h4>

              <div className="space-y-3">
                {mockJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="text-white mb-1">{job.title}</div>
                      <div className="text-white/60 text-sm">
                        {job.company} • {job.location}
                      </div>
                    </div>

                    <button className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
