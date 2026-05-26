import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { api } from '../services/api';

const serif = { fontFamily: '"Instrument Serif", serif' };
const sans = { fontFamily: '"Inter", system-ui, sans-serif' };

export function VolunteerRegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [collegeProof, setCollegeProof] = useState<File | null>(null);
  const [livePhoto, setLivePhoto] = useState<File | null>(null);

  const inputClass =
    'w-full bg-zinc-50/80 border border-zinc-200 rounded-2xl px-4 py-3.5 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2F6BFF]/30 focus:border-[#2F6BFF] transition-all';

  const handleRegister = async () => {
    if (!email || !phone || !password || !collegeProof || !livePhoto) {
      toast.error('Please fill all fields and upload required documents');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('collegeProof', collegeProof);
      formData.append('livePhoto', livePhoto);

      await api.registerVolunteer(formData);
      toast.success('Registration successful! Please login.');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 py-12" style={sans}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1
            className="text-zinc-900 leading-[0.95] tracking-tight mb-2"
            style={{ ...serif, fontSize: 'clamp(40px, 6vw, 56px)' }}
          >
            Volunteer Registration
          </h1>
          <p className="text-zinc-500 mt-4" style={{ fontSize: '15px' }}>
            Join us to validate and empower artisans.
          </p>
        </div>

        <div className="bg-white/85 backdrop-blur border border-zinc-200/70 rounded-[32px] p-7 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="volunteer@college.edu"
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+91 98765 43210"
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                College ID Proof (Image or PDF)
              </label>
              <input
                type="file"
                onChange={(e) => setCollegeProof(e.target.files?.[0] || null)}
                className={inputClass}
                style={{ fontSize: '15px' }}
              />
            </div>

            <div>
              <label className="block text-zinc-500 mb-2" style={{ fontSize: '13px' }}>
                Live Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLivePhoto(e.target.files?.[0] || null)}
                className={inputClass}
                style={{ fontSize: '15px' }}
              />
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-[#2F6BFF] text-white py-3.5 mt-2 rounded-full hover:bg-[#1F58E8] transition-colors shadow-[0_2px_8px_rgba(47,107,255,0.35)]"
              style={{ fontSize: '15px' }}
            >
              Register as Volunteer
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full mt-3 text-zinc-500 py-2 rounded-full hover:text-zinc-800 transition-colors"
              style={{ fontSize: '13px' }}
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
