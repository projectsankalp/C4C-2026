import React, { useState } from 'react';

/**
 * AntigravityNav Component
 * 
 * Features:
 * - "Zero gravity" floating aesthetics using CSS animations
 * - Deep space dark mode with neon cyan/purple accents
 * - Glassmorphic tabs
 * - Glitch-free tab switching via React state
 * - Fade transitions without layout shifting
 */

// Simulated content for the tabs to demonstrate instantaneous switching
const pageContent = {
  previous: {
    title: "System Logs: Previous Cycle",
    body: "Initiating retro-thrusters. All previous orbital data has been successfully archived. The antigravity stabilization field remains at 99.8% efficiency. No anomalies detected in the space-time continuum."
  },
  next: {
    title: "Coordinates: Next Destination",
    body: "Hyper-drive sequence calculated. Plotting course to the Andromeda sector. Ensure all safety harnesses are secured before engaging the quantum accelerator. ETA: 4.2 light years."
  }
};

const AntigravityNav: React.FC = () => {
  // --- State Management ---
  // We manage the active tab in state. Because the component re-renders instantly,
  // there is no "glitch" or loading delay between tabs. The content is pre-loaded.
  const [activeTab, setActiveTab] = useState<'previous' | 'next'>('previous');
  
  // We use a secondary state to handle the fade transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(pageContent.previous);

  const handleTabChange = (tab: 'previous' | 'next') => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setDisplayContent(pageContent[tab]);
      setIsTransitioning(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-200 font-sans">
      
      {/* Background Starfield / Nebular Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '10s' }}></div>
      </div>

      {/* Main Container */}
      <div className="z-10 w-full max-w-3xl flex flex-col items-center">
        
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-12 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" style={{ animation: 'float 6s ease-in-out infinite' }}>
          vocupskill
        </h1>

        {/* Tabbed Navigation */}
        <div className="flex gap-4 md:gap-8 mb-8 w-full justify-center">
          
          <button
            onClick={() => handleTabChange('previous')}
            className={`
              relative px-6 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 ease-out
              backdrop-blur-md border border-white/10 overflow-hidden group
              ${activeTab === 'previous' 
                ? 'bg-white/10 text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.2)] scale-105' 
                : 'bg-black/20 text-slate-400 hover:bg-white/5 hover:text-slate-200'}
            `}
            style={{ animation: 'float 5s ease-in-out infinite' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-lg">←</span> Previous Page
            </span>
            {/* Active Neon Underglow */}
            {activeTab === 'previous' && (
              <div className="absolute bottom-0 left-0 h-1 w-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
            )}
          </button>

          <button
            onClick={() => handleTabChange('next')}
            className={`
              relative px-6 py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 ease-out
              backdrop-blur-md border border-white/10 overflow-hidden group
              ${activeTab === 'next' 
                ? 'bg-white/10 text-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.2)] scale-105' 
                : 'bg-black/20 text-slate-400 hover:bg-white/5 hover:text-slate-200'}
            `}
            style={{ animation: 'float 7s ease-in-out infinite' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Next Page <span className="text-lg">→</span>
            </span>
            {/* Active Neon Underglow */}
            {activeTab === 'next' && (
              <div className="absolute bottom-0 left-0 h-1 w-full bg-purple-500 shadow-[0_0_10px_#c084fc]"></div>
            )}
          </button>

        </div>

        {/* Content Area */}
        {/* Fixed minimum height prevents layout shifting/jumping during transitions */}
        <div className="w-full min-h-[250px] relative">
          <div 
            className={`
              w-full p-8 md:p-10 rounded-3xl backdrop-blur-xl bg-slate-900/40 border border-slate-700/50
              shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-opacity duration-200 ease-in-out
              ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}
          >
            <div className="absolute top-0 left-10 w-20 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            
            <h2 className="text-2xl font-bold text-slate-100 mb-4 tracking-wide">
              {displayContent.title}
            </h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              {displayContent.body}
            </p>
            
            {/* Decorative elements */}
            <div className="mt-8 flex gap-2">
              <div className="h-1 w-8 bg-cyan-500 rounded-full animate-pulse"></div>
              <div className="h-1 w-2 bg-slate-600 rounded-full"></div>
              <div className="h-1 w-2 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Global styles for floating animation (Ideally goes in index.css) */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default AntigravityNav;
