export default function ResourceCard({ resource }) {
  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 glass border-white/5 hover:border-indigo-500/50 hover:bg-white/5 transition-all duration-300 rounded-xl group"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-indigo-300 group-hover:text-indigo-200">{resource.title}</h4>
        <svg className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </div>
      <p className="text-sm text-slate-400 leading-snug">{resource.description}</p>
    </a>
  );
}
