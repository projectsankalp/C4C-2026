import { LucideIcon } from 'lucide-react';

interface CertificationCardProps {
  icon: LucideIcon;
  title: string;
  color: string;
  onClick: () => void;
}

export function CertificationCard({ icon: Icon, title, color, onClick }: CertificationCardProps) {
  return (
    <div
      onClick={onClick}
      className="min-w-[200px] bg-white/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-4 aspect-square"
    >
      <Icon size={64} className={color} strokeWidth={1.5} />
      <div className="text-slate-800 text-center">{title}</div>
    </div>
  );
}
