import { CheckCircle, XCircle } from 'lucide-react';

interface ActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
}

export function ActionButtons({ onApprove, onReject }: ActionButtonsProps) {
  return (
    <div className="flex gap-4 justify-end">
      <button
        onClick={onReject}
        className="px-6 py-3 rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
      >
        <XCircle size={20} />
        Reject & Flag
      </button>
      <button
        onClick={onApprove}
        className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
      >
        <CheckCircle size={24} />
        <span className="text-lg">Approve & Mint Credential</span>
      </button>
    </div>
  );
}
