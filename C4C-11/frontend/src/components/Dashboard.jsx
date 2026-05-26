export default function Dashboard({ data }) {
  const { total_comments, harmful_count, video_title, youtube_url, category_breakdown } = data;
  const harmfulPercentage = total_comments > 0 ? (harmful_count / total_comments * 100).toFixed(1) : 0;
  
  const categoryLabels = {
    "toxicity": "General Toxicity",
    "severe_toxicity": "Severe Toxicity",
    "obscene": "Obscene Language",
    "threat": "Threat / Violence",
    "insult": "Personal Insult",
    "identity_attack": "Identity-Based Attack",
  };
  
  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2">Analysis Results For:</h2>
          <a 
            href={youtube_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-3xl font-black text-white hover:text-indigo-400 transition-colors line-clamp-2"
          >
            {video_title}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-1 fill-mode-both">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <p className="text-slate-400 font-medium mb-1 uppercase tracking-tighter text-sm">Analyzed</p>
          <h3 className="text-4xl font-bold text-white">{total_comments}</h3>
          <p className="text-xs text-slate-500 mt-2">Total Comments</p>
        </div>

        <div className="glass p-6 rounded-3xl border-red-500/10 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-2 fill-mode-both">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 5l6.5 11h-13L12 7zm-1 6h2v2h-2v-2zm0-4h2v2h-2V9z"></path>
            </svg>
          </div>
          <p className="text-slate-400 font-medium mb-1 uppercase tracking-tighter text-sm">Harmful</p>
          <h3 className="text-4xl font-bold text-red-400">{harmful_count}</h3>
          <p className="text-xs text-slate-500 mt-2">Detected Threats</p>
        </div>

        <div className={`glass p-6 rounded-3xl relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-3 fill-mode-both ${
          parseFloat(harmfulPercentage) > 30 ? "border-red-500/30 shadow-lg shadow-red-500/10" : "border-indigo-500/10"
        }`}>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-400">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V7h2v10z"></path>
            </svg>
          </div>
          <p className="text-slate-400 font-medium mb-1 uppercase tracking-tighter text-sm">Intensity</p>
          <h3 className={`text-4xl font-bold ${parseFloat(harmfulPercentage) > 30 ? "text-red-400" : "text-indigo-400"}`}>
            {harmfulPercentage}%
          </h3>
          <p className="text-xs text-slate-500 mt-2">Toxicity Ratio</p>
        </div>
      </div>

      {harmful_count > 0 && category_breakdown && (
        <div className="glass p-8 rounded-3xl border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 stagger-4 fill-mode-both">
          <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Threat Distribution
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {Object.entries(category_breakdown).map(([cat, count]) => (
              <div key={cat} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {categoryLabels[cat] || cat}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{count} occurrences</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500/50 group-hover:bg-red-400 transition-all duration-500" 
                    style={{ width: `${(count / harmful_count) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
