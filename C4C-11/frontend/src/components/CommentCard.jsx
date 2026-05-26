export default function CommentCard({ result }) {
  const { 
    text, 
    author, 
    author_channel_url, 
    author_profile_img, 
    like_count, 
    is_harmful, 
    toxicity_score, 
    category, 
    reason 
  } = result;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both ${
      is_harmful 
        ? "glass border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/5" 
        : "glass border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-emerald-500/5"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={author_profile_img} 
            alt={author} 
            className="w-10 h-10 rounded-full border border-white/10 shadow-lg"
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${author}` }}
          />
          <div>
            <a 
              href={author_channel_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors block leading-tight"
            >
              {author}
            </a>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"></path>
                </svg>
                {like_count} likes
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            is_harmful ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
          }`}>
            {is_harmful ? category : "Safe"}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {(toxicity_score * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-slate-300 text-sm mb-0 leading-relaxed">
        {text}
      </p>
      {is_harmful && (
        <div className="mt-3 pt-3 border-t border-red-500/10">
          <p className="text-sm text-red-400/80 italic">
            <span className="font-semibold mr-1">Reason:</span> {reason}
          </p>
        </div>
      )}
    </div>
  );
}
