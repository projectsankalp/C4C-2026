import { Play } from 'lucide-react';

interface VideoPlayerProps {
  thumbnailUrl?: string;
}

export function VideoPlayer({ thumbnailUrl }: VideoPlayerProps) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-video shadow-lg">
      <img
        src={thumbnailUrl || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"}
        alt="Artisan video thumbnail"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <button className="p-6 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-xl hover:scale-110">
          <Play size={32} className="text-gray-900 ml-1" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
