import React from 'react';

const VoiceGuidance = ({ text, showDots }) => {
  return (
    <div className="saree-guidance-avatar flex items-start gap-4 p-4 bg-white rounded-2xl border-l-[5px] border-[#8B3A1A] shadow-sm max-w-xl">
      <img 
        src="/karighar-assistant-lady.png" 
        alt="KariGhar Assistant" 
        className="saree-avatar-img w-12 h-12 rounded-full object-cover border-2 border-[#8B3A1A] bg-[#FFF0EB] flex-shrink-0"
      />
      <div className="flex flex-col gap-1">
        <p className="saree-guidance-bubble italic text-[15px] leading-relaxed text-[#1A1A1A]">
          "{text}"
        </p>
        {showDots && (
          <div className="flex gap-1.5 items-center mt-1">
            <span className="w-2 h-2 rounded-full bg-[#8B3A1A] animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 rounded-full bg-[#8B3A1A] animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 rounded-full bg-[#8B3A1A] animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceGuidance;
