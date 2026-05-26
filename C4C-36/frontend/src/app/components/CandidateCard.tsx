interface CandidateCardProps {
  phoneNumber: string;
  timestamp: string;
  aiConfidence: number;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CandidateCard({
  phoneNumber,
  timestamp,
  aiConfidence,
  isSelected,
  onClick
}: CandidateCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'ring-2 ring-indigo-400 shadow-lg' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-gray-900">{phoneNumber}</div>
        <div className="text-xs text-gray-500">{timestamp}</div>
      </div>
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs">
        AI Match: {aiConfidence}%
      </div>
    </div>
  );
}
