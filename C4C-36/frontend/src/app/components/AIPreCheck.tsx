interface AIPreCheckProps {
  confidence: string;
  keywords: string[];
}

export function AIPreCheck({ confidence, keywords }: AIPreCheckProps) {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-sm">
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">AI Confidence Score</div>
        <div className="text-2xl text-emerald-600">{confidence}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
}
