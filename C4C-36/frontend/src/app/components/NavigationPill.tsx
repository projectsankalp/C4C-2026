import { Home, List, History, Settings } from 'lucide-react';

export function NavigationPill() {
  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-900/80 backdrop-blur-md rounded-full">
      <button className="p-3 text-white hover:bg-white/10 rounded-full transition-colors">
        <Home size={20} />
      </button>
      <button className="p-3 text-white hover:bg-white/10 rounded-full transition-colors">
        <List size={20} />
      </button>
      <button className="p-3 text-white hover:bg-white/10 rounded-full transition-colors">
        <History size={20} />
      </button>
      <button className="p-3 text-white hover:bg-white/10 rounded-full transition-colors">
        <Settings size={20} />
      </button>
    </div>
  );
}
