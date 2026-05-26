interface LoadingAnimationProps {
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export function LoadingAnimation({
  text = "Loading...",
  subtext,
  fullScreen = true,
}: LoadingAnimationProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${
        fullScreen ? "min-h-[60vh]" : "h-full w-full py-12"
      }`}
    >
      {/* Serene Animation Container */}
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Expanding subtle ring (Ping) */}
        <div className="absolute h-full w-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-teal-200/40"></div>

        {/* Secondary slower expanding ring */}
        <div className="absolute h-24 w-24 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-emerald-100/50 delay-1000"></div>

        {/* Core pulsing circle */}
        <div className="relative flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-tr from-teal-400 to-emerald-400 shadow-lg shadow-teal-200/50">
          <svg
            className="h-8 w-8 text-white opacity-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4"
            />
          </svg>
        </div>
      </div>

      {/* Calming text */}
      <div className="mt-8 flex flex-col items-center space-y-2">
        {text && (
          <h2 className="animate-pulse text-xl font-light tracking-wide text-navy-900">
            {text}
          </h2>
        )}
        {subtext && (
          <p className="text-sm text-slate-500">{subtext}</p>
        )}
      </div>
    </div>
  );
}
