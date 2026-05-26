export default function AlertBadge({ count }) {
  // Ensure we don't render a badge for 0 or undefined
  if (!count || count <= 0) return null;

  return (
    <span 
      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-sm shadow-rose-500/30 border-2 border-white animate-in zoom-in duration-300 z-10"
      style={{ WebkitFontSmoothing: 'antialiased' }}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}