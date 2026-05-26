"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/lib/api";
import { useRuralMode } from "@/lib/rural";

interface NavItem {
  href: string;
  label: string;
  roles?: string[];
}

const NAV: NavItem[] = [
  { href: "/caregiver", label: "Caregiver", roles: ["CAREGIVER"] },
  { href: "/caregiver/feed", label: "Health Feed", roles: ["CAREGIVER"] },
  { href: "/foundation", label: "Foundation Dashboard", roles: ["FOUNDATION_WORKER"] },
  { href: "/me/intake", label: "My Health", roles: ["PATIENT"] },
  { href: "/conditions", label: "Conditions" },
  { href: "/labs", label: "Labs" },
  { href: "/handover", label: "Handover", roles: ["FOUNDATION_WORKER", "CAREGIVER", "ADMIN"] },
  { href: "/admin/audit", label: "Audit Log", roles: ["ADMIN"] },
  { href: "/account", label: "Account", roles: ["PATIENT", "CAREGIVER", "FOUNDATION_WORKER", "ADMIN"] },
];

type EngineStatus = "checking" | "online" | "offline";

export function Header() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const visible = NAV.filter((n) => !n.roles || (role && n.roles.includes(role)));

  const [engine, setEngine] = useState<EngineStatus>("checking");
  const [latency, setLatency] = useState<number | null>(null);
  const rural = useRuralMode();

  async function ping() {
    setEngine("checking");
    const t0 = performance.now();
    try {
      await api.health();
      setLatency(Math.round(performance.now() - t0));
      setEngine("online");
    } catch {
      setLatency(null);
      setEngine("offline");
    }
  }

  useEffect(() => {
    ping();
    const id = setInterval(ping, 60_000);
    return () => clearInterval(id);
  }, []);

  const dotClass =
    engine === "online"
      ? "bg-green-400"
      : engine === "offline"
        ? "bg-red-400"
        : "bg-amber-300 animate-pulse";
  const engineLabel =
    engine === "online"
      ? `Engine ${latency != null ? `${latency}ms` : "online"}`
      : engine === "offline"
        ? "Engine offline"
        : "Engine…";

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/20 backdrop-blur-md shadow-soft">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-1.5 group">
          <span className="text-xl font-display font-extrabold tracking-tight text-foreground transition group-hover:opacity-80">PULSE</span>
          <span className="text-xl font-display font-extrabold tracking-tight text-primary transition group-hover:scale-105">
            POINT
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1.5 text-sm">
          {visible.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-foreground/80 font-medium transition hover:bg-primary/10 hover:text-primary"
            >
              {n.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => rural.setManual(rural.on ? false : true)}
            title={
              rural.reason === "auto-2g"
                ? `Auto-enabled — slow connection (${rural.effectiveType})`
                : rural.reason === "auto-savedata"
                  ? "Auto-enabled — Save Data is on"
                  : rural.on
                    ? "Rural Mode on (manual). Click to disable."
                    : "Rural Mode off. Click to enable."
            }
            className={`ml-2 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              rural.on
                ? "border-warning/40 bg-warning/15 text-orange-700 dark:text-warning hover:bg-warning/25"
                : "border-border bg-card text-foreground/80 hover:bg-muted"
            }`}
          >
            <span aria-hidden>{rural.on ? "📶" : "🌐"}</span>
            {rural.on ? "Rural" : "Rural off"}
          </button>

          <button
            type="button"
            onClick={ping}
            title="PulsePoint AI Engine status (GET /)"
            className="ml-1 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground/80 hover:bg-muted"
          >
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            {engineLabel}
          </button>

          {status === "authenticated" && session?.user ? (
            <div className="ml-2 flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px]">
              <span className="font-semibold text-foreground">
                {session.user.name}
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                {role}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-foreground/60 hover:text-destructive transition font-bold"
                title="Sign out"
              >
                ↩
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="ml-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow hover:bg-primary/95 transition-all transform hover:-translate-y-0.5"
            >
              Sign in
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
