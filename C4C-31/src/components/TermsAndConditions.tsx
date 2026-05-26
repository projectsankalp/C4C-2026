import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { X, Check, ChevronDown } from 'lucide-react';

interface TermsAndConditionsProps {
  onBack: () => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onBack }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Trigger enter animation
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Check if content is short enough to not need scrolling
  useEffect(() => {
    if (isVisible && contentRef.current) {
      const { scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight <= clientHeight + 10) setHasScrolledToBottom(true);
    }
  }, [isVisible]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) setHasScrolledToBottom(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onBack(), 420);
  };

  const handleAccept = () => {
    setIsClosing(true);
    setTimeout(() => onBack(), 420);
  };

  const scrollHint = () => {
    contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
  };

  const backdropStyle: CSSProperties = {
    transition: 'background 0.4s, backdrop-filter 0.4s',
    background: isClosing || !isVisible ? 'transparent' : 'rgba(15,23,42,0.45)',
    backdropFilter: isClosing || !isVisible ? 'blur(0px)' : 'blur(6px)',
  };

  const cardStyle: CSSProperties = {
    transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1), opacity 0.38s ease',
    transform: isClosing
      ? 'scale(0.92) translateY(28px)'
      : isVisible
        ? 'scale(1) translateY(0)'
        : 'scale(0.88) translateY(36px)',
    opacity: isClosing || !isVisible ? 0 : 1,
    maxHeight: '90vh',
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      style={backdropStyle}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        style={cardStyle}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Terms &amp; Conditions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Last updated:{' '}
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <div
            ref={contentRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto px-7 py-6 space-y-7 text-sm text-slate-600 leading-relaxed"
            style={{ maxHeight: '50vh' }}
          >
            <section>
              <SectionHeading num="1" title="Introduction" />
              <p>
                Welcome to <strong className="text-teal-700">VocUpSkill</strong>! These Terms and Conditions outline the rules
                for using our platform. By accessing or using this application you fully accept these terms. If you disagree
                with any part, please refrain from using the platform.
              </p>
              <p className="mt-3">
                Our mission is to empower individuals through skill assessment, career exploration, and certified recognition
                across vocational trades. We reserve the right to update these terms at any time, and your continued use
                constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <SectionHeading num="2" title="User Responsibilities" />
              <ul className="space-y-2.5 pl-1">
                {[
                  'Provide accurate, truthful information during registration and skill assessments.',
                  'Maintain the confidentiality of your account credentials and OTP codes.',
                  'Not use the platform for any illegal, harmful, or fraudulent purpose.',
                  'Ensure uploaded content (videos, photos) is your own original work, free of IP violations.',
                  'Accept responsibility for all activity that occurs under your account.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                      <Check size={10} className="text-teal-600" strokeWidth={3} />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <SectionHeading num="3" title="Privacy Policy" />
              <p>
                Your privacy is our highest priority. We collect personal data — including your phone number, name, and
                uploaded media — solely to validate your skills and issue verifiable certificates.
              </p>
              <p className="mt-3">
                We will <strong className="text-slate-700">never</strong> sell your personal information to third parties.
                All media is stored using industry-standard encryption. You may request data deletion at any time by
                contacting our support team.
              </p>
            </section>

            <section>
              <SectionHeading num="4" title="Limitations of Liability" />
              <p>
                VocUpSkill provides services "as is". While we strive for accuracy, we do not warrant the absolute
                completeness of information on this platform. In no event shall VocUpSkill or its team be held liable
                for damages arising from your use of this service.
              </p>
            </section>

            <section className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
              <p className="font-bold text-slate-800 mb-2">Contact Information</p>
              <p className="text-teal-800">📧 support@vocupskill.com</p>
              <p className="text-teal-800 mt-1">📞 +91 1800-123-4567</p>
            </section>

            <div className="h-2" />
          </div>

          {/* Scroll-to-bottom gradient hint */}
          {!hasScrolledToBottom && (
            <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-2">
              <button
                onClick={scrollHint}
                className="pointer-events-auto flex items-center gap-1 text-xs font-semibold text-teal-600 animate-bounce"
              >
                <ChevronDown size={15} /> Scroll to read all
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/60 shrink-0 space-y-4">
          {/* Checkbox */}
          <label
            htmlFor="tc-agree"
            className={`flex items-start gap-3 select-none ${hasScrolledToBottom ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            <div className="relative shrink-0 mt-0.5">
              <input
                id="tc-agree"
                type="checkbox"
                disabled={!hasScrolledToBottom}
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-300 bg-white
                           checked:bg-teal-600 checked:border-teal-600 transition-all duration-200
                           disabled:cursor-not-allowed"
              />
              <Check
                size={12}
                strokeWidth={3}
                className="absolute inset-0 m-auto text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
              />
            </div>
            <span className={`text-sm font-medium leading-snug ${isAgreed ? 'text-slate-800' : 'text-slate-500'}`}>
              I have read and agree to the Terms and Conditions
              {!hasScrolledToBottom && (
                <span className="block text-xs text-amber-500 font-normal mt-0.5">
                  Please scroll to the bottom first
                </span>
              )}
            </span>
          </label>

          {/* Accept Button */}
          <button
            disabled={!isAgreed}
            onClick={handleAccept}
            className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2
              transition-all duration-300
              ${isAgreed
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
          >
            <Check size={18} strokeWidth={2.5} />
            Accept &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Small helper sub-component
const SectionHeading: React.FC<{ num: string; title: string }> = ({ num, title }) => (
  <h3 className="text-base font-bold text-slate-800 mb-2.5 flex items-center gap-2">
    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-extrabold flex items-center justify-center shrink-0">
      {num}
    </span>
    {title}
  </h3>
);
