interface TranscriptBubbleProps {
  transcript: string;
}

export function TranscriptBubble({ transcript }: TranscriptBubbleProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-lg">
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">AI Transcript</div>
      <p className="text-gray-800 leading-relaxed">
        {transcript}
      </p>
    </div>
  );
}
