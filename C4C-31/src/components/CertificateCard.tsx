import React, { useRef } from 'react';
import { Download, ShieldCheck, Share2, Award, Star, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../utils/supabaseClient';
import type { LanguageStrings } from '../data/translations';

interface CertificateCardProps {
  profile: UserProfile;
  labels: LanguageStrings;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ profile, labels }) => {
  const cardRef = useRef<HTMLDivElement>(null);


  const getTradeName = () => {
    const tradeMap: Record<string, string> = {
      tailoring: labels.sewingTrade,
      beauty: labels.beautyTrade,
      foodprep: labels.foodTrade,
      fashion: labels.fashionTrade,
      baking: labels.bakingTrade,
      welding: labels.weldingTrade,
      handicrafts: labels.handicraftsTrade,
    };
    return tradeMap[profile.trade] || profile.trade;
  };

  // Generate a mock certificate ID
  const certId = `VUS-${profile.id.toUpperCase().substring(0, 6)}-${profile.trade.toUpperCase().substring(0, 3)}`;

  const issueDate = profile.certifiedAt || new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleDownload = () => {
    const element = document.createElement("a");
    const certDetails = `
══════════════════════════════════════════════════════
             VOCUPSKILL — CERTIFICATE OF EXCELLENCE
══════════════════════════════════════════════════════

  This is to certify that

  ${profile.name.toUpperCase()}

  has successfully completed the skill assessment
  and has been officially verified in the field of:

  ${getTradeName().toUpperCase()}

  Skill Level : ${profile.skillLevel}
  Certificate ID : ${certId}
  Issue Date  : ${issueDate}
  Status      : VERIFIED & BLOCKCHAIN ANCHORED

══════════════════════════════════════════════════════
        Issued by VocUpSkill — Powered by AI
══════════════════════════════════════════════════════
`;
    const file = new Blob([certDetails], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${profile.name.replace(/\s+/g, '_')}_VocUpSkill_Certificate.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full flex flex-col items-center">

      {/* ── CERTIFICATE CARD ─────────────────────────────────── */}
      <div
        ref={cardRef}
        className="w-full max-w-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f1729 0%, #0a2438 50%, #0f1729 100%)',
          borderRadius: '20px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.3)',
        }}
      >
        {/* Gold outer border */}
        <div className="absolute inset-0 rounded-[20px] pointer-events-none" style={{
          boxShadow: 'inset 0 0 0 2px rgba(212,175,55,0.5), inset 0 0 0 5px rgba(212,175,55,0.08)'
        }}></div>

        {/* Decorative corner ornaments */}
        <svg className="absolute top-3 left-3 text-yellow-500/30" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M2 2 L2 18 M2 2 L18 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M2 8 L8 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <svg className="absolute top-3 right-3 text-yellow-500/30" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M38 2 L38 18 M38 2 L22 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M38 8 L32 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <svg className="absolute bottom-3 left-3 text-yellow-500/30" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M2 38 L2 22 M2 38 L18 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M2 32 L8 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <svg className="absolute bottom-3 right-3 text-yellow-500/30" width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M38 38 L38 22 M38 38 L22 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M38 32 L32 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>

        {/* Radial glow center */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(20,100,120,0.15) 0%, transparent 70%)'
        }}></div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <Award size={260} className="text-yellow-400" />
        </div>

        {/* ── CARD CONTENT ── */}
        <div className="relative z-10 p-7 md:p-10">

          {/* Top header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="VocUpSkill" className="w-12 h-12 rounded-full object-cover ring-2 ring-yellow-500/40" />
              <div>
                <p className="text-[10px] tracking-[0.25em] text-yellow-500/80 uppercase font-semibold">VocUpSkill</p>
                <p className="text-[9px] text-slate-400 tracking-wide mt-0.5">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Verified</span>
            </div>
          </div>

          {/* Gold divider */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent"></div>
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent"></div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <p className="text-[11px] tracking-[0.3em] text-slate-400 uppercase mb-2 font-medium">Certificate of Excellence</p>
            <p className="text-slate-300 text-sm mb-5">This is to certify that</p>

            {/* Recipient Name */}
            <div className="relative inline-block">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide" style={{
                background: 'linear-gradient(135deg, #f5e27a 0%, #d4af37 40%, #f5e27a 70%, #a07828 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                {profile.name}
              </h2>
              <div className="mt-1 h-px bg-gradient-to-r from-transparent via-yellow-600/60 to-transparent"></div>
            </div>

            <p className="text-slate-400 text-sm mt-5 leading-relaxed">
              has successfully completed the skill assessment<br />
              and is officially verified in the field of
            </p>
          </div>

          {/* Trade badge */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border"
              style={{
                background: 'linear-gradient(135deg, rgba(20,80,100,0.4) 0%, rgba(10,50,70,0.6) 100%)',
                borderColor: 'rgba(212,175,55,0.3)',
              }}>
              <ShieldCheck size={20} className="text-yellow-400 fill-yellow-400/10 shrink-0" />
              <span className="font-extrabold text-lg text-white tracking-wide">{getTradeName()}</span>
            </div>
          </div>

          {/* Skill Level Stars */}
          <div className="flex justify-center gap-1.5 mb-8">
            {['Beginner', 'Intermediate', 'Expert'].map((level, i) => {
              const levels = ['Beginner', 'Intermediate', 'Expert'];
              const currentIndex = levels.indexOf(profile.skillLevel || 'Beginner');
              return (
                <div key={i} className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${i <= currentIndex ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-slate-700 bg-slate-800/30 text-slate-600'}`}>
                  <Star size={9} className={i <= currentIndex ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} />
                  {level}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent"></div>
            <Star size={12} className="text-yellow-500 fill-yellow-500" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent"></div>
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-3 gap-3 text-center mb-6">
            <div>
              <p className="text-[9px] tracking-widest uppercase text-slate-500 mb-1">Cert. ID</p>
              <p className="text-[11px] font-bold text-slate-200 font-mono">{certId}</p>
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase text-slate-500 mb-1">Issued On</p>
              <p className="text-[11px] font-bold text-slate-200">{issueDate}</p>
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase text-slate-500 mb-1">Status</p>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 size={10} className="text-emerald-400 fill-emerald-400/20" />
                <p className="text-[11px] font-bold text-emerald-400">Active</p>
              </div>
            </div>
          </div>

          {/* QR & Signature row */}
          <div className="flex items-end justify-between mt-2">
            {/* QR Code */}
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <svg width="56" height="56" viewBox="0 0 29 29">
                <path d="M0 0h7v7H0zm1 1v5h5V1zm8 0h1v1H9zm1 0h1v2h-1zm1 0h3v1h-3zm3 0h1v4h-1zm1 0h1v1h-1zm1 0h3v3h-1V2h-1v1h-1zm3 0h1v2h-1zm-6 2h1v1h-1zm1 0h2v1h-2zm-5 4h1v1H3zm17-2v1h-1v-1zm1 0h1v2h-1zm1 0h2v1h-2zm1 0h1v1h-1zm-6 2h1v3h-1zm1 0h1v1h-1zm2 0h1v1h-1zm1 0h1v2h-1zm-15 4h7v7H0zm1 1v5h5v-5zm8-1h1v1H9zm2 0h1v1h-1zm2 0h1v1h-1zm2 0h2v1h-2zm2 0h1v3h-1zm2 0h1v1h-1zm1 0h1v2h-1zm-9 2h1v1h-1zm2 0h1v2h-1zm2 0h1v1h-1zm-8 2h1v1H3zm6 0h1v1H9zm1 0h2v1h-2zm4 0h1v2h-1zm2 0h2v1h-2zm1 0h1v1h-1zm-10 2h1v1h-1zm2 0h3v1h-3zm4 0h1v1h-1zm3 0h1v1h-1zm1 0h2v1h-2z" fill="#0D5C75"/>
              </svg>
            </div>

            {/* Signature block */}
            <div className="text-center">
              <div className="font-bold text-yellow-400 text-lg mb-0.5" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>VocUpSkill</div>
              <div className="h-px w-28 bg-yellow-600/40 mb-1.5 mx-auto"></div>
              <p className="text-[9px] text-slate-400 tracking-widest uppercase">Authorized Signature</p>
              <p className="text-[9px] text-slate-500 mt-0.5">Skill Certification Authority</p>
            </div>
          </div>

        </div>

        {/* Bottom gold band */}
        <div className="relative z-10 px-8 py-3 flex items-center justify-center gap-2" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.12) 30%, rgba(212,175,55,0.12) 70%, transparent 100%)',
          borderTop: '1px solid rgba(212,175,55,0.2)'
        }}>
          <ShieldCheck size={12} className="text-yellow-500/60" />
          <p className="text-[9px] text-yellow-600/70 tracking-widest uppercase text-center font-medium">
            Blockchain Anchored · Tamper Proof · Instantly Verifiable
          </p>
          <ShieldCheck size={12} className="text-yellow-500/60" />
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="flex gap-3 w-full max-w-xl mt-5">
        <button
          onClick={handleDownload}
          className="flex-1 font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f5e27a 50%, #d4af37 100%)',
            color: '#0f1729',
            boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
          }}
        >
          <Download size={18} />
          {labels.downloadCert}
        </button>
        <button
          onClick={() => alert("Certificate verification link copied! Share with employers.")}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold p-3.5 rounded-2xl flex items-center justify-center shadow-lg transition-all hover:scale-[1.02]"
          title="Share Certificate"
        >
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
};
