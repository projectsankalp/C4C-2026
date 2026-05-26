import { useState, useEffect } from 'react'
import URLInput from './components/URLInput'
import CommentCard from './components/CommentCard'
import ResourceCard from './components/ResourceCard'
import Dashboard from './components/Dashboard'
import Chatbot from './components/Chatbot'

function App() {
  const [results, setResults] = useState(null)

  const handleResults = (data) => {
    setResults(data)
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-premium-dark relative">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 mb-6 glass rounded-full border-white/5 transition-transform hover:scale-105 duration-300">
            <span className="text-xs font-bold tracking-[0.2em] text-indigo-400 uppercase">CyberBullying Detection AI</span>
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight drop-shadow-2xl">
            <span className="premium-gradient">ToxCore</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Protect your community. Analyze YouTube comments in real-time with state-of-the-art machine learning.
          </p>
        </header>

        <URLInput onResults={handleResults} />

        {results && (
          <div className="mt-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Dashboard data={results} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                  Detailed Analysis
                </h2>
                <div className="space-y-4">
                  {results.results.map((comment, index) => (
                    <div key={comment.comment_id} className={`transition-all duration-300 hover:-translate-y-1 ${index < 5 ? `stagger-${index + 1}` : ""}`}>
                      <CommentCard result={comment} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></span>
                  Resources
                </h2>
                <div className="space-y-4">
                  {results.results
                    .filter(r => r.is_harmful)
                    .flatMap(r => r.resources)
                    .filter((v, i, a) => a.findIndex(t => t.url === v.url) === i) // Deduplicate
                    .map((resource, idx) => (
                      <div key={idx} className={`transition-all duration-300 hover:-translate-y-1 ${idx < 5 ? `stagger-${idx + 1}` : ""}`}>
                        <ResourceCard resource={resource} />
                      </div>
                    ))
                  }
                  {results.harmful_count === 0 && (
                    <div className="glass p-6 rounded-2xl text-slate-400 italic text-center animate-pulse">
                      No harmful content detected. Stay kind!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Chatbot />
      
      <footer className="mt-32 text-center text-slate-600 text-sm">
        <p>© 2026 ToxCore • Built with ❤️ for a safer internet</p>
      </footer>
    </div>
  )
}

export default App
