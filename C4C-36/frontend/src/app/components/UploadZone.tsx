import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.includes('video')) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-4 border-dashed rounded-3xl p-12 transition-all cursor-pointer ${
        isDragging
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-white/20 bg-white/5'
      }`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <input
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />

      <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
        <UploadCloud size={64} className="text-white/40 mb-4" />

        {selectedFile ? (
          <div className="text-center">
            <p className="text-white mb-2">{selectedFile.name}</p>
            <p className="text-white/60 text-sm">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white mb-2">
              Drag and drop your video here
            </p>
            <p className="text-white/60 text-sm">or click to browse</p>
          </div>
        )}
      </label>
    </motion.div>
  );
}
