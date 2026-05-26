"use client";

import { signIn } from "next-auth/react";
import { CheckCircle2, Link2 } from "lucide-react";
import { useState } from "react";

export default function ClientAccountLinker({ 
  provider, 
  name, 
  icon, 
  color,
  isConnected 
}: { 
  provider: string, 
  name: string, 
  icon: React.ReactNode, 
  color: string,
  isConnected: boolean
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    await signIn(provider, { callbackUrl: "/settings" });
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-[#1E293B] bg-[#020617] group hover:border-[#334155] transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <div className="font-medium text-nx-text flex items-center gap-2">
            {name} 
            {isConnected && <CheckCircle2 size={14} className="text-nx-mint" />}
          </div>
          <div className="text-xs text-nx-text-sec">
            {isConnected ? "Ready to publish" : "Not connected"}
          </div>
        </div>
      </div>
      
      {isConnected ? (
        <span className="text-xs font-mono text-nx-text-sec bg-[#1E293B] px-3 py-1 rounded-full">Connected</span>
      ) : (
        <button 
          onClick={handleConnect}
          disabled={isLoading}
          className="text-xs font-medium text-nx-blue hover:text-white hover:bg-nx-blue px-4 py-1.5 rounded-full border border-nx-blue transition-colors flex items-center gap-2"
        >
          {isLoading ? "Connecting..." : (
            <>
              <Link2 size={14} /> Connect
            </>
          )}
        </button>
      )}
    </div>
  );
}
