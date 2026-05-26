import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2, Server, Database } from 'lucide-react';
import { checkBackendHealth } from '../services/kriticamApi';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * BackendStatus — floating status badge (bottom-right)
 *
 * Shows judges the exact live connection state of all 4 stack layers:
 *   ⚡ FastAPI backend (uvicorn)
 *   🤖 OpenAI GPT-4o (configured in backend .env)
 *   🗄  Supabase DB (python-supabase via FastAPI)
 *   🔴 Supabase Realtime (supabase-js direct subscription)
 */
export default function BackendStatus() {
  const [apiStatus, setApiStatus] = useState('checking');
  const [apiDetails, setApiDetails] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState(
    isSupabaseConfigured ? 'connecting' : 'unconfigured'
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // ── Ping FastAPI backend ──────────────────────────────────────────────────
  useEffect(() => {
    const ping = async () => {
      try {
        const health = await checkBackendHealth();
        setApiStatus('connected');
        setApiDetails(health);
      } catch {
        setApiStatus('demo-mode');
        setApiDetails(null);
      }
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Monitor Supabase Realtime channel ────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('haathse-status-probe')
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('live');
        else if (status === 'CHANNEL_ERROR') setRealtimeStatus('error');
        else if (status === 'TIMED_OUT') setRealtimeStatus('timeout');
        else setRealtimeStatus('connecting');
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Derived overall status ────────────────────────────────────────────────
  const overallStatus =
    apiStatus === 'connected' ? 'connected' :
    apiStatus === 'checking'  ? 'checking'  : 'demo-mode';

  const cfg = {
    connected:  { dot: 'bg-green-400',  label: 'Stack Live',    border: 'border-green-500/30'  },
    checking:   { dot: 'bg-gold-400 animate-pulse', label: 'Connecting…', border: 'border-gold-500/30' },
    'demo-mode':{ dot: 'bg-orange-400 animate-pulse', label: 'Demo Mode', border: 'border-orange-500/30' },
  }[overallStatus];

  const statusDot = (ok, checking = false) =>
    checking ? '○' : ok ? '●' : '●';
  const statusColor = (ok, checking = false) =>
    checking ? 'text-gold-400' : ok ? 'text-green-400' : 'text-orange-400';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        id="backend-status-badge"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 bg-white/95 rounded-full border ${cfg.border} shadow-premium text-[10px] font-semibold text-charcoal backdrop-blur-sm hover:shadow-luxury transition-all duration-300`}
        title="Stack connection status"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <Server className="w-3 h-3 text-charcoal/50" />
        <span className="uppercase tracking-widest text-charcoal/70">{cfg.label}</span>
        {apiStatus === 'checking'
          ? <Loader2 className="w-3 h-3 animate-spin text-gold-500" />
          : apiStatus === 'connected'
            ? <Wifi className="w-3 h-3 text-green-500" />
            : <WifiOff className="w-3 h-3 text-orange-500" />}
      </button>

      {/* ── Expanded panel ── */}
      {isExpanded && (
        <div className="absolute bottom-12 right-0 w-72 bg-charcoal text-ivory rounded-2xl p-5 border border-white/10 shadow-luxury text-[10px] space-y-3 animate-slide-up">
          <p className="font-semibold uppercase tracking-widest text-gold-400">
            HaathSe Stack Status
          </p>

          {/* FastAPI */}
          <div className="space-y-2">
            <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Backend</p>
            <div className="flex justify-between">
              <span className="text-ivory/60">FastAPI (uvicorn)</span>
              <span className={statusColor(apiStatus === 'connected', apiStatus === 'checking')}>
                {statusDot(apiStatus === 'connected', apiStatus === 'checking')} {apiStatus === 'connected' ? 'Online' : apiStatus === 'checking' ? 'Pinging…' : 'Offline'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory/60">GPT-4o Vision</span>
              <span className={apiDetails ? statusColor(apiDetails.openai_configured) : 'text-white/30'}>
                {apiDetails
                  ? `${statusDot(apiDetails.openai_configured)} ${apiDetails.openai_configured ? 'Active' : 'Mock mode'}`
                  : '— not checked'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory/60">Supabase (python)</span>
              <span className={apiDetails ? statusColor(apiDetails.supabase_configured) : 'text-white/30'}>
                {apiDetails
                  ? `${statusDot(apiDetails.supabase_configured)} ${apiDetails.supabase_configured ? 'Connected' : 'Mock mode'}`
                  : '— not checked'}
              </span>
            </div>
          </div>

          {/* Supabase JS */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold">Frontend</p>
            <div className="flex justify-between">
              <span className="text-ivory/60 flex items-center gap-1"><Database className="w-3 h-3" /> Supabase JS</span>
              <span className={statusColor(isSupabaseConfigured)}>
                {statusDot(isSupabaseConfigured)} {isSupabaseConfigured ? 'Configured' : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ivory/60">Realtime Channel</span>
              <span className={
                realtimeStatus === 'live'          ? 'text-green-400' :
                realtimeStatus === 'connecting'    ? 'text-gold-400' :
                realtimeStatus === 'unconfigured'  ? 'text-white/30' : 'text-orange-400'
              }>
                {realtimeStatus === 'live'          ? '● Live'         :
                 realtimeStatus === 'connecting'    ? '○ Connecting…'  :
                 realtimeStatus === 'unconfigured'  ? '— Not set'      : '● Error'}
              </span>
            </div>
          </div>

          {/* Env hint */}
          {!isSupabaseConfigured && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <p className="text-[8px] text-ivory/30 uppercase tracking-wider">Add to .env.local:</p>
              <code className="block bg-white/5 px-2 py-1.5 rounded text-[9px] text-green-400 font-mono leading-relaxed">
                VITE_SUPABASE_URL=…{'\n'}
                VITE_SUPABASE_ANON_KEY=…
              </code>
            </div>
          )}

          <div className="pt-1 border-t border-white/10 text-[8px] text-ivory/20 font-mono">
            FastAPI: localhost:8000 · React + Vite.js · @supabase/supabase-js
          </div>
        </div>
      )}
    </div>
  );
}
