import { useState } from "react";

export default function URLInput({ onResults }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url, max_comments: 50 }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to analyze URL");
      }
      
      const data = await res.json();
      onResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col md:flex-row gap-4 glass p-2 rounded-2xl">
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-400 px-6 py-4 text-lg"
            placeholder="Paste YouTube Video URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !url}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : "Detect Toxicity"}
          </button>
        </div>
      </form>
      {error && (
        <p className="mt-4 text-red-400 text-center animate-pulse">{error}</p>
      )}
    </div>
  );
}
