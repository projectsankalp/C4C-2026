import { motion, AnimatePresence } from 'motion/react';
import { Camera, Mic } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onRecordVideo: () => void;
  onRecordAudio: () => void;
}

export function ActionModal({ isOpen, onRecordVideo, onRecordAudio }: ActionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full mt-6 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-100/80 to-pink-100/80 backdrop-blur-xl rounded-full p-4 flex gap-4 justify-center items-center border border-white/60 shadow-lg">
            <button
              onClick={onRecordVideo}
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all"
            >
              <Camera size={24} className="text-purple-600" />
              <span className="text-slate-800">Record Video Proof</span>
            </button>
            <button
              onClick={onRecordAudio}
              className="flex items-center gap-3 px-8 py-4 bg-white rounded-full shadow-md hover:shadow-xl hover:scale-105 transition-all"
            >
              <Mic size={24} className="text-pink-600" />
              <span className="text-slate-800">Record Audio Proof</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
